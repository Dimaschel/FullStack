import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SITE_NAME = 'Помощь рядом';
const DEFAULT_OG_IMAGE = '/social-card.svg';

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  robots = 'index,follow',
  ogType = 'website',
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    document.title = `${title} | ${SITE_NAME}`;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[name="robots"]', { name: 'robots' }, robots);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, `${title} | ${SITE_NAME}`);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, `${baseUrl}${DEFAULT_OG_IMAGE}`);
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'ru_RU');
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let structuredDataScript = document.head.querySelector<HTMLScriptElement>('script[data-seo-json-ld="true"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.dataset.seoJsonLd = 'true';
      document.head.appendChild(structuredDataScript);
    }

    structuredDataScript.textContent = jsonLd ? JSON.stringify(jsonLd) : '';

    return () => {
      if (structuredDataScript && !jsonLd) {
        structuredDataScript.textContent = '';
      }
    };
  }, [title, description, canonicalPath, robots, ogType, jsonLd]);

  return null;
}
