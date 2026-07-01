const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isProductionHost = (
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "192.168.1.12" &&
      !hostname.includes("devtunnels.ms") &&
      !hostname.includes("trycloudflare.com")
    );

    // If running in production (not localhost/LAN and not tunnel/dev services)
    // and VITE_API_URL is not set, default to same-origin.
    if (isProductionHost) {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        return window.location.origin;
      }

      try {
        const parsedApiUrl = new URL(apiUrl);
        const pointsToLocalhost = parsedApiUrl.hostname === "localhost" || parsedApiUrl.hostname === "127.0.0.1";
        const pointsToSameHostDifferentPort = parsedApiUrl.hostname === hostname && parsedApiUrl.port !== window.location.port;
        const wouldDowngradeHttps = window.location.protocol === "https:" && parsedApiUrl.protocol === "http:";

        if (pointsToLocalhost || pointsToSameHostDifferentPort || wouldDowngradeHttps) {
          return window.location.origin;
        }

        return parsedApiUrl.origin;
      } catch {
        return window.location.origin;
      }
    }
    // Match something like "prefix-5173.something.devtunnels.ms"
    const match = hostname.match(/^(.+)-(517\d)\.(.+devtunnels\.ms)$/);
    if (match) {
      return `${window.location.protocol}//${match[1]}-5000.${match[3]}`;
    }

    if (window.location.port && window.location.port.startsWith("517")) {
      return `${window.location.protocol}//${hostname}:5000`;
    }
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000";
};

export const API_URL = getApiUrl();

// Automatically attach credentials (session cookies) for all frontend fetch requests to API_URL
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init = {}) {
    const url = typeof input === "string" ? input : (input && input.url ? input.url : "");
    if (url && url.startsWith(API_URL)) {
      init.credentials = "include";
    }
    return originalFetch.call(this, input, init);
  };
}
