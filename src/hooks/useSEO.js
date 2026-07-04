import { useEffect } from "react";

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  noindex = false
}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Helper to update/create meta tag
    const updateMeta = (name, content, attrName = "name") => {
      if (content === undefined || content === null) return;
      let el = document.querySelector(`meta[${attrName}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", description);
    updateMeta("keywords", keywords);
    updateMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph / Facebook
    updateMeta("og:title", ogTitle || title, "property");
    updateMeta("og:description", ogDescription || description, "property");
    updateMeta("og:image", ogImage || "https://mail-bridge.email/og-image.png", "property");
    updateMeta("og:url", ogUrl || window.location.href, "property");
    updateMeta("og:type", ogType, "property");

    // Twitter
    updateMeta("twitter:title", ogTitle || title);
    updateMeta("twitter:description", ogDescription || description);
    updateMeta("twitter:image", ogImage || "https://mail-bridge.email/og-image.png");
    updateMeta("twitter:url", ogUrl || window.location.href);

    // Canonical link tag
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    
    // Normalize path: strip trailing slashes (except root '/') and search params
    const pathname = window.location.pathname;
    const cleanPath = pathname.length > 1 && pathname.endsWith("/") 
      ? pathname.slice(0, -1) 
      : pathname;
    const derivedCanonical = window.location.origin + cleanPath;
    
    link.setAttribute("href", canonical || derivedCanonical);

  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType, noindex]);
}
