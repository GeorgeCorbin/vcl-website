"use client";

import { useEffect } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const SCRIPT_ID = "adsbygoogle-js";
const LOADED_EVENT = "vcl-adsense-loaded";

/**
 * Loads the AdSense script with a plain <script> tag.
 * Next.js <Script> adds data-nscript, which AdSense rejects and blocks fills.
 */
export function AdSenseScript() {
  useEffect(() => {
    if (!CLIENT_ID) return;
    if (document.getElementById(SCRIPT_ID)) {
      window.dispatchEvent(new Event(LOADED_EVENT));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
    script.onload = () => window.dispatchEvent(new Event(LOADED_EVENT));
    document.head.appendChild(script);
  }, []);

  return null;
}

export { LOADED_EVENT as ADSENSE_LOADED_EVENT };
