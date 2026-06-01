/**
 * Lightweight, high-performance HTML sanitizer for use with dangerouslySetInnerHTML.
 * Safely strips malicious <script>, <iframe>, link tags, javascript: links, and inline on* event handlers,
 * while allowing standard typography and styling tags like <b>, <i>, <strong>, <em>, and •.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return "";
  
  // Remove script tags and their inner content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove iframe, object, embed, link, and meta tags
  cleaned = cleaned.replace(/<(iframe|object|embed|link|meta)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "");
  cleaned = cleaned.replace(/<(iframe|object|embed|link|meta)\b[^>]*>/gi, "");

  // Remove inline on* event handlers (e.g. onload, onerror, onclick)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");

  // Remove javascript: pseudo-protocols inside href or src attributes
  cleaned = cleaned.replace(/(href|src)\s*=\s*(["']\s*javascript:[^"']*["']|\s*javascript:[^\s>]+)/gi, "");

  return cleaned;
}
