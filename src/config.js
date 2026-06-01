const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Match something like "prefix-5173.something.devtunnels.ms"
    const match = hostname.match(/^(.+)-(517\d)\.(.+devtunnels\.ms)$/);
    if (match) {
      return `${window.location.protocol}//${match[1]}-5000.${match[3]}`;
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
