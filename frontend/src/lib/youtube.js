const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function normalizeVideoId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return VIDEO_ID_PATTERN.test(id) ? id : "";
}

/**
 * Extracts the 11-character video id from the YouTube URL formats the admin
 * panel accepts (watch, share, shorts, live and embed links). A bare id is
 * also accepted so older records remain usable.
 */
export function getYouTubeVideoId(value) {
  if (typeof value !== "string") return "";

  const input = value.trim();
  if (!input) return "";

  const bareId = normalizeVideoId(input);
  if (bareId) return bareId;

  let url;

  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be") {
    return normalizeVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      return normalizeVideoId(url.searchParams.get("v"));
    }

    const segments = url.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live", "v"].includes(segments[0])) {
      return normalizeVideoId(segments[1]);
    }
  }

  return "";
}

export function getYouTubeThumbnail(videoId, quality = "hqdefault") {
  const id = normalizeVideoId(videoId);
  return id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : "";
}

export function getYouTubeWatchUrl(videoId) {
  const id = normalizeVideoId(videoId);
  return id ? `https://www.youtube.com/watch?v=${id}` : "";
}

export function getYouTubeEmbedUrl(videoId, { autoplay = false } = {}) {
  const id = normalizeVideoId(videoId);
  if (!id) return "";

  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
  });

  if (autoplay) params.set("autoplay", "1");

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
