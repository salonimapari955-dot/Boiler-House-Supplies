import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { isAdminAuthenticated } from "../auth.js";

export default function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    function handlePageShow(event) {
      // A page restored from the browser's back/forward cache skips a fresh
      // render, so re-check the token and leave if the admin has logged out.
      if (event.persisted && !isAdminAuthenticated()) {
        navigate("/admin/login", { replace: true });
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [navigate]);

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
