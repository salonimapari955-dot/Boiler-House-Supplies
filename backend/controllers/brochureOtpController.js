const {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} = require("crypto");
const dns = require("dns");
const net = require("net");
const os = require("os");
const nodemailer = require("nodemailer");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const CHALLENGE_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_SEND_LIMIT = 5;
const IP_SEND_LIMIT = 20;
const OTP_ATTEMPT_LIMIT = 5;
const DNS_LOOKUP_TIMEOUT_MS = 3 * 1000;
const FALLBACK_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];
const EMAIL_CANNOT_RECEIVE_MESSAGE =
  "This email could not receive OTP. Please enter a valid email address.";
const PROBE_PORT = 25;
const PROBE_CONNECT_TIMEOUT_MS = 2500;
const PROBE_GREETING_TIMEOUT_MS = 5000;
const PROBE_COMMAND_TIMEOUT_MS = 5000;
const PROBE_TOTAL_TIMEOUT_MS = 9000;
const PROBE_MAX_HOSTS = 3;
const PROBE_BACKOFF_MS = 5 * 60 * 1000;
const PROBE_NETWORK_ERRORS = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
]);
const MAILBOX_NOT_FOUND_PATTERNS = [
  /does not exist/i,
  /doesn't exist/i,
  /no such (user|mailbox|recipient|address)/i,
  /user unknown/i,
  /unknown (user|recipient|mailbox)/i,
  /mailbox (unavailable|not found|disabled)/i,
  /recipient (address )?(rejected|not found)/i,
  /recipientnotfound/i,
  /invalid recipient/i,
  /account .*not exist/i,
];

const challenges = new Map();
const emailSendWindows = new Map();
const ipSendWindows = new Map();

function hashOtp(challengeId, otp) {
  return createHash("sha256").update(`${challengeId}:${otp}`).digest();
}

function isOtpMatch(challenge, otp) {
  const submittedHash = hashOtp(challenge.id, otp);
  return (
    challenge.otpHash?.length === submittedHash.length &&
    timingSafeEqual(challenge.otpHash, submittedHash)
  );
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("DNS lookup timed out.");
      error.code = "ETIMEOUT";
      reject(error);
    }, timeoutMs);
    timer.unref?.();
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function createDnsResolvers() {
  const resolvers = [dns.promises];

  try {
    const fallback = new dns.promises.Resolver();
    fallback.setServers(FALLBACK_DNS_SERVERS);
    resolvers.push(fallback);
  } catch (error) {
    console.warn("Fallback DNS resolver unavailable:", error.message);
  }

  return resolvers;
}

const dnsResolvers = createDnsResolvers();

async function queryDns(recordType, domain) {
  let lastError = null;

  for (const resolver of dnsResolvers) {
    try {
      const records = await withTimeout(
        resolver[recordType](domain),
        DNS_LOOKUP_TIMEOUT_MS,
      );
      return { records: Array.isArray(records) ? records : [] };
    } catch (error) {
      // NXDOMAIN is definitive; ENODATA means this record type is absent.
      if (error.code === "ENOTFOUND") return { notFound: true };
      if (error.code === "ENODATA") return { noRecords: true };
      lastError = error;
    }
  }

  // DNS itself is unavailable, so do not block the user. SMTP must still accept.
  return { inconclusive: true, error: lastError };
}

// Free checks only: syntax is validated earlier, here we resolve the domain's
// mail route. This proves the domain can receive mail, not that a mailbox does.
async function resolveMailHosts(email) {
  const domain = email.slice(email.lastIndexOf("@") + 1).trim().toLowerCase();
  if (!domain) return { deliverable: false, hosts: [] };

  const mxResult = await queryDns("resolveMx", domain);
  if (mxResult.notFound) return { deliverable: false, hosts: [] };

  if (mxResult.records?.length) {
    // RFC 7505: an MX entry of "." explicitly means the domain accepts no mail.
    const hosts = mxResult.records
      .filter((record) => {
        const exchange =
          typeof record?.exchange === "string"
            ? record.exchange.trim().replace(/\.$/, "")
            : "";
        return exchange !== "" && exchange !== ".";
      })
      .sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0))
      .map((record) => record.exchange.trim().replace(/\.$/, ""));

    return { deliverable: hosts.length > 0, hosts };
  }

  if (mxResult.inconclusive) {
    // DNS is unavailable; do not block a real user. SMTP still has the final say.
    return { deliverable: true, hosts: [domain], inconclusive: true };
  }

  // No MX records: the domain itself is the implicit mail host (RFC 5321).
  const addressResults = await Promise.all([
    queryDns("resolve4", domain),
    queryDns("resolve6", domain),
  ]);
  if (addressResults.some((result) => result.records?.length)) {
    return { deliverable: true, hosts: [domain] };
  }
  if (addressResults.some((result) => result.inconclusive)) {
    return { deliverable: true, hosts: [domain], inconclusive: true };
  }

  return { deliverable: false, hosts: [] };
}

function getEnvelopeFrom() {
  const raw =
    typeof process.env.SMTP_FROM === "string" ? process.env.SMTP_FROM.trim() : "";
  const match = raw.match(/<([^>]+)>/);
  const address = (match ? match[1] : raw).trim();
  return EMAIL_PATTERN.test(address) ? address : "";
}

function getProbeClientName() {
  const from = getEnvelopeFrom();
  const fromDomain = from ? from.slice(from.lastIndexOf("@") + 1) : "";
  const candidate = (fromDomain || os.hostname() || "localhost")
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "")
    .replace(/^[.-]+|[.-]+$/g, "");
  return candidate || "localhost";
}

function isMailboxNotFoundReply(text) {
  return MAILBOX_NOT_FOUND_PATTERNS.some((pattern) => pattern.test(text));
}

// Free, best-effort mailbox check: connect to the domain's mail server on port
// 25 and ask whether it accepts this recipient. No message is sent. This is the
// only free way to get a mailbox-level answer, and it only works when the host
// allows outbound port 25. Catch-all servers accept every address, so a 2xx
// reply is not proof that the mailbox exists.
function smtpProbeHost(host, email) {
  return new Promise((resolve) => {
    let settled = false;
    let connected = false;
    let buffer = "";
    let stage = "connect";
    let stageTimer = null;
    let hardTimer = null;
    const socket = net.createConnection({ host, port: PROBE_PORT });

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(stageTimer);
      clearTimeout(hardTimer);
      socket.removeAllListeners();
      socket.destroy();
      resolve({ host, ...result });
    };

    const armStage = (timeoutMs) => {
      clearTimeout(stageTimer);
      stageTimer = setTimeout(() => {
        finish({
          status: "unknown",
          reason: `timeout_${stage}`,
          network: stage === "connect",
        });
      }, timeoutMs);
      stageTimer.unref?.();
    };

    hardTimer = setTimeout(() => {
      finish({ status: "unknown", reason: "total_timeout" });
    }, PROBE_TOTAL_TIMEOUT_MS);
    hardTimer.unref?.();

    socket.setEncoding("utf8");
    armStage(PROBE_CONNECT_TIMEOUT_MS);

    socket.once("connect", () => {
      connected = true;
      stage = "greeting";
      armStage(PROBE_GREETING_TIMEOUT_MS);
    });

    socket.once("error", (error) => {
      finish({
        status: "unknown",
        reason: error.code || "socket_error",
        network: !connected && PROBE_NETWORK_ERRORS.has(error.code),
      });
    });

    socket.once("close", () => {
      finish({ status: "unknown", reason: "connection_closed" });
    });

    function send(command, nextStage) {
      stage = nextStage;
      armStage(PROBE_COMMAND_TIMEOUT_MS);
      socket.write(`${command}\r\n`);
    }

    function handleReply(line) {
      const code = Number(line.slice(0, 3));
      const text = line.slice(4).trim();

      if (stage === "greeting") {
        if (code === 220) send(`EHLO ${getProbeClientName()}`, "ehlo");
        else finish({ status: "unknown", reason: `greeting_${code}` });
        return;
      }

      if (stage === "ehlo") {
        if (code === 250) send("MAIL FROM:<>", "mailfrom");
        else if (code >= 500) send(`HELO ${getProbeClientName()}`, "helo");
        else finish({ status: "unknown", reason: `ehlo_${code}` });
        return;
      }

      if (stage === "helo") {
        if (code === 250) send("MAIL FROM:<>", "mailfrom");
        else finish({ status: "unknown", reason: `helo_${code}` });
        return;
      }

      if (stage === "mailfrom") {
        if (code >= 200 && code < 300) send(`RCPT TO:<${email}>`, "rcptto");
        else finish({ status: "unknown", reason: `mail_from_${code}` });
        return;
      }

      if (stage === "rcptto") {
        if (code >= 200 && code < 300) {
          socket.write("QUIT\r\n");
          finish({ status: "exists", reason: "accepted" });
        } else if (code >= 500 && isMailboxNotFoundReply(text)) {
          finish({ status: "not_found", reason: `rcpt_${code}`, detail: text });
        } else {
          finish({ status: "unknown", reason: `rcpt_${code}`, detail: text });
        }
      }
    }

    socket.on("data", (chunk) => {
      buffer += chunk;
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
        buffer = buffer.slice(newlineIndex + 1);
        // Multiline replies use '-' after the code; wait for the final line.
        if (!/^\d{3}[ -]/.test(line) || line.charAt(3) === "-") continue;
        handleReply(line);
        if (settled) return;
      }
    });
  });
}

let probeUnavailableUntil = 0;

async function probeMailbox(email, mailHosts) {
  if (Date.now() < probeUnavailableUntil) {
    return { status: "unknown", reason: "probe_unavailable" };
  }

  let networkFailure = false;
  const hosts = (mailHosts.hosts || []).slice(0, PROBE_MAX_HOSTS);

  for (const host of hosts) {
    const result = await smtpProbeHost(host, email);
    if (result.status === "exists" || result.status === "not_found") {
      return result;
    }
    if (result.network) {
      // A network-level failure (blocked port 25, unreachable network) will
      // affect every MX host, so do not wait through the whole list.
      networkFailure = true;
      break;
    }
  }

  if (networkFailure) {
    // Port 25 is blocked or the network cannot reach mail servers. Avoid
    // delaying every request; fall back to SMTP delivery + OTP proof instead.
    probeUnavailableUntil = Date.now() + PROBE_BACKOFF_MS;
    console.warn(
      "Mailbox probe unavailable (outbound port 25 unreachable). Falling back to OTP verification.",
    );
  }

  return { status: "unknown", reason: "inconclusive" };
}

function getSmtpConfig() {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
  ];
  const missing = required.filter(
    (name) => typeof process.env[name] !== "string" || !process.env[name].trim(),
  );

  if (missing.length) {
    return { missing };
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { invalid: "SMTP_PORT must be a valid port number." };
  }
  const secure = process.env.SMTP_SECURE.trim().toLowerCase();
  if (secure !== "true" && secure !== "false") {
    return { invalid: "SMTP_SECURE must be either true or false." };
  }

  return {
    config: {
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: secure === "true",
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    },
  };
}

function takeWindow(map, key, limit, now, windowMs) {
  let window = map.get(key);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + windowMs };
    map.set(key, window);
  }

  if (window.count >= limit) {
    return Math.max(1, Math.ceil((window.resetAt - now) / 1000));
  }

  window.count += 1;
  return 0;
}

function cleanup(now) {
  for (const [id, challenge] of challenges) {
    if (challenge.createdAt + CHALLENGE_WINDOW_MS <= now) {
      challenges.delete(id);
    }
  }
  for (const [key, window] of emailSendWindows) {
    if (window.resetAt <= now) emailSendWindows.delete(key);
  }
  for (const [key, window] of ipSendWindows) {
    if (window.resetAt <= now) ipSendWindows.delete(key);
  }
}

function getRequestEmail(req, res) {
  // Preserve the address exactly as entered (apart from surrounding spaces) so
  // the OTP is delivered to, and stored against, the requested mailbox.
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
    return null;
  }
  return email;
}

function getProductKey(req, res) {
  const productKey =
    typeof req.body?.productKey === "string" ? req.body.productKey.trim() : "";
  if (!productKey || productKey.length > 200) {
    res.status(400).json({
      success: false,
      message: "A valid product is required for brochure access.",
    });
    return null;
  }
  return productKey;
}

function getOtp(req, res) {
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
  if (!/^\d{6}$/.test(otp)) {
    res.status(400).json({
      success: false,
      message: "Enter the 6-digit OTP sent to your email.",
    });
    return null;
  }
  return otp;
}

function normalizeMailAddress(value) {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value.address === "string"
        ? value.address
        : "";
  // Nodemailer may echo "Name <user@example.com>"; compare only the address.
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

async function deliverOtp(email, otp, smtpConfig) {
  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    // Await the full SMTP transaction. sendMail resolves only after the SMTP
    // server has replied, but it can still report rejected recipients, so the
    // envelope result must be inspected before treating the email as sent.
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM.trim(),
      to: email,
      subject: "Your Boiler House brochure access code",
      text: `Your one-time password is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
      html: `<p>Your one-time password is <strong>${otp}</strong>.</p><p>It expires in 5 minutes. Do not share this code with anyone.</p>`,
    });

    const target = normalizeMailAddress(email);
    const accepted = Array.isArray(info?.accepted)
      ? info.accepted.map(normalizeMailAddress)
      : [];
    const rejected = Array.isArray(info?.rejected)
      ? info.rejected.map(normalizeMailAddress)
      : [];

    if (rejected.includes(target) || !accepted.includes(target)) {
      const error = new Error(
        `SMTP server did not accept ${email} for delivery.`,
      );
      error.code = "EMAIL_REJECTED";
      throw error;
    }

    return info;
  } finally {
    transporter.close?.();
  }
}

function isRecipientRejected(error) {
  return (
    error?.code === "EMAIL_REJECTED" ||
    (error?.code === "EENVELOPE" &&
      Number(error?.responseCode) >= 500) ||
    (error?.command === "RCPT TO" && Number(error?.responseCode) >= 500)
  );
}

function requireSmtp(res) {
  const result = getSmtpConfig();
  if (result.missing) {
    res.status(503).json({
      success: false,
      message: `Email OTP is not configured. Set these backend environment variables: ${result.missing.join(", ")}.`,
    });
    return null;
  }
  if (result.invalid) {
    res.status(503).json({ success: false, message: result.invalid });
    return null;
  }
  return result.config;
}

async function sendOtp(req, res) {
  const email = getRequestEmail(req, res);
  if (!email) return;
  const productKey = getProductKey(req, res);
  if (!productKey) return;
  const smtpConfig = requireSmtp(res);
  if (!smtpConfig) return;

  const now = Date.now();
  cleanup(now);
  // Rate limits are keyed case-insensitively because mailbox providers treat
  // addresses that differ only by case as the same mailbox.
  const emailWait = takeWindow(
    emailSendWindows,
    email.toLowerCase(),
    EMAIL_SEND_LIMIT,
    now,
    CHALLENGE_WINDOW_MS,
  );
  const ipWait = takeWindow(
    ipSendWindows,
    req.ip || "unknown",
    IP_SEND_LIMIT,
    now,
    60 * 60 * 1000,
  );
  if (emailWait || ipWait) {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests. Please try again later.",
      retryAfterSeconds: Math.max(emailWait, ipWait),
    });
  }

  // Free validation: the domain must publish a mail route.
  const mailHosts = await resolveMailHosts(email);
  if (!mailHosts.deliverable) {
    return res.status(400).json({
      success: false,
      code: "EMAIL_NOT_FOUND",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  // Free, best-effort mailbox check when outbound port 25 is available.
  const mailboxProbe = await probeMailbox(email, mailHosts);
  if (mailboxProbe.status === "not_found") {
    return res.status(400).json({
      success: false,
      code: "EMAIL_NOT_FOUND",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  const id = randomBytes(32).toString("hex");
  const otp = String(randomInt(0, 1000000)).padStart(6, "0");

  try {
    await deliverOtp(email, otp, smtpConfig);
  } catch (error) {
    const rejected = isRecipientRejected(error);
    console.error("Brochure OTP email delivery failed:", error.message);
    return res.status(502).json({
      success: false,
      code: rejected ? "EMAIL_REJECTED" : "EMAIL_SEND_FAILED",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  challenges.set(id, {
    id,
    email,
    productKey,
    otpHash: hashOtp(id, otp),
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
    verified: false,
  });

  return res.status(200).json({
    success: true,
    email,
    emailAccepted: true,
    mailboxConfirmed: mailboxProbe.status === "exists",
    challengeId: id,
    expiresInSeconds: OTP_TTL_MS / 1000,
    resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
  });
}

async function resendOtp(req, res) {
  const challengeId =
    typeof req.body?.challengeId === "string" ? req.body.challengeId : "";
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    return res.status(400).json({
      success: false,
      message: "This OTP request has expired. Start again to request a new code.",
    });
  }

  const smtpConfig = requireSmtp(res);
  if (!smtpConfig) return;
  const now = Date.now();
  cleanup(now);

  if (challenge.verified || challenge.attempts >= OTP_ATTEMPT_LIMIT) {
    return res.status(429).json({
      success: false,
      message: "This OTP request can no longer be used. Start again.",
    });
  }
  if (challenge.createdAt + CHALLENGE_WINDOW_MS <= now) {
    challenges.delete(challengeId);
    return res.status(400).json({
      success: false,
      message: "This OTP request has expired. Start again to request a new code.",
    });
  }
  if (now - challenge.lastSentAt < RESEND_COOLDOWN_MS) {
    return res.status(429).json({
      success: false,
      message: "Please wait before requesting another OTP.",
      retryAfterSeconds: Math.ceil(
        (RESEND_COOLDOWN_MS - (now - challenge.lastSentAt)) / 1000,
      ),
    });
  }

  const emailWait = takeWindow(
    emailSendWindows,
    challenge.email.toLowerCase(),
    EMAIL_SEND_LIMIT,
    now,
    CHALLENGE_WINDOW_MS,
  );
  const ipWait = takeWindow(
    ipSendWindows,
    req.ip || "unknown",
    IP_SEND_LIMIT,
    now,
    60 * 60 * 1000,
  );
  if (emailWait || ipWait) {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests. Please try again later.",
      retryAfterSeconds: Math.max(emailWait, ipWait),
    });
  }

  // Re-run the same free validation on resend. If the mailbox is now known to
  // be invalid, remove the challenge so no OTP can be used or resent.
  const mailHosts = await resolveMailHosts(challenge.email);
  if (!mailHosts.deliverable) {
    challenges.delete(challengeId);
    return res.status(400).json({
      success: false,
      code: "EMAIL_NOT_FOUND",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  const mailboxProbe = await probeMailbox(challenge.email, mailHosts);
  if (mailboxProbe.status === "not_found") {
    challenges.delete(challengeId);
    return res.status(400).json({
      success: false,
      code: "EMAIL_NOT_FOUND",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  const otp = String(randomInt(0, 1000000)).padStart(6, "0");
  try {
    await deliverOtp(challenge.email, otp, smtpConfig);
  } catch (error) {
    const rejected = isRecipientRejected(error);
    if (rejected) challenges.delete(challengeId);
    console.error("Brochure OTP email delivery failed:", error.message);
    return res.status(502).json({
      success: false,
      code: rejected ? "EMAIL_REJECTED" : "EMAIL_SEND_FAILED",
      message: EMAIL_CANNOT_RECEIVE_MESSAGE,
    });
  }

  challenge.otpHash = hashOtp(challengeId, otp);
  challenge.expiresAt = now + OTP_TTL_MS;
  challenge.lastSentAt = now;

  return res.status(200).json({
    success: true,
    email: challenge.email,
    emailAccepted: true,
    mailboxConfirmed: mailboxProbe.status === "exists",
    expiresInSeconds: OTP_TTL_MS / 1000,
    resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
  });
}

function verifyOtp(req, res) {
  const challengeId =
    typeof req.body?.challengeId === "string" ? req.body.challengeId : "";
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    return res.status(400).json({
      success: false,
      message: "This OTP request has expired. Start again to request a new code.",
    });
  }

  const productKey = getProductKey(req, res);
  if (!productKey) return;
  if (productKey !== challenge.productKey) {
    return res.status(400).json({
      success: false,
      message: "This OTP was requested for a different product. Start again.",
    });
  }
  if (challenge.verified) {
    return res.status(400).json({
      success: false,
      message: "This OTP has already been used. Start again to request a new code.",
    });
  }
  if (Date.now() >= challenge.expiresAt) {
    return res.status(400).json({
      success: false,
      message: "This OTP has expired. Request a new code.",
    });
  }
  if (challenge.attempts >= OTP_ATTEMPT_LIMIT) {
    return res.status(429).json({
      success: false,
      message: "Too many incorrect attempts. Start again to request a new code.",
    });
  }

  const otp = getOtp(req, res);
  if (!otp) return;
  challenge.attempts += 1;

  if (!isOtpMatch(challenge, otp)) {
    return res.status(400).json({
      success: false,
      message:
        challenge.attempts >= OTP_ATTEMPT_LIMIT
          ? "Too many incorrect attempts. Start again to request a new code."
          : "The OTP is incorrect. Please check the code and try again.",
    });
  }

  challenge.verified = true;
  challenge.otpHash = null;
  return res.status(200).json({
    success: true,
    verified: true,
  });
}

module.exports = {
  sendOtp,
  resendOtp,
  verifyOtp,
};
