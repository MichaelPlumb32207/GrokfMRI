"use client";

import { useEffect, useState } from "react";

function isLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "::1" ||
    h.endsWith(".localhost")
  );
}

/**
 * Warn if the UI is served on a non-loopback host — memory contents are personal.
 */
export function HostSafetyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLocalHost(window.location.hostname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot external check
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-100"
    >
      <strong className="font-semibold">Not on localhost.</strong> This app can
      read your Grok memory store. Prefer{" "}
      <code className="text-amber-50">npm run dev</code> (binds{" "}
      <code className="text-amber-50">127.0.0.1</code>) and avoid exposing the
      port on a public network. See SECURITY.md.
    </div>
  );
}
