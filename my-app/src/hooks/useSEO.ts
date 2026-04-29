import { useEffect } from 'react';

interface SEOOptions {
  /** Tiêu đề trang — nên 5-10 từ, chứa từ khoá chính */
  title: string;
  /** Mô tả trang — tối đa ~155 ký tự, hiển thị trên kết quả Google */
  description: string;
  /** Từ khoá tiếng Việt, phân cách bằng dấu phẩy */
  keywords?: string;
  /** URL ảnh đại diện (Open Graph image) */
  imageUrl?: string;
  /** Canonical URL cho trang này (để tránh duplicate content) */
  canonicalUrl?: string;
}

const SITE_SUFFIX = ' | PhysicMUT';
const DEFAULT_DESCRIPTION =
  'PhysicMUT – Nền tảng học Vật lý 12 qua mô hình 3D tương tác. Khám phá Cyclotron, Loa điện động và nhiều thí nghiệm ảo trực quan, miễn phí.';

/**
 * useSEO — hook động để đặt <title> và các <meta> SEO cho từng trang.
 *
 * Gọi ở đầu mỗi page component:
 * ```
 * useSEO({
 *   title: 'Mô hình 3D Máy gia tốc Cyclotron',
 *   description: 'Khám phá nguyên lý Cyclotron qua mô hình 3D tương tác...',
 *   keywords: 'Cyclotron, máy gia tốc, lực Lorentz, Vật lý 12',
 * });
 * ```
 */
function useSEO({
  title,
  description,
  keywords,
  imageUrl,
  canonicalUrl,
}: SEOOptions) {
  useEffect(() => {
    const fullTitle = title + SITE_SUFFIX;

    // ── 1. <title> ──────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper: upsert <meta> tags ──────────────────────────────────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        // Parse attribute=value pairs from selector like [name="description"]
        const match = selector.match(/\[(\w[\w:]*?)="([^"]+)"\]/);
        if (match) {
          el.setAttribute(match[1], match[2]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      const selector = `link[rel="${rel}"]`;
      let el = document.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ── 2. Meta Description ─────────────────────────────────────────────────
    setMeta('[name="description"]', description || DEFAULT_DESCRIPTION);

    // ── 3. Keywords (tiếng Việt) ────────────────────────────────────────────
    if (keywords) {
      const el =
        (document.querySelector<HTMLMetaElement>('[name="keywords"]') as HTMLMetaElement | null)
        ?? (() => {
          const m = document.createElement('meta');
          m.setAttribute('name', 'keywords');
          m.setAttribute('lang', 'vi');
          document.head.appendChild(m);
          return m;
        })();
      el.setAttribute('lang', 'vi');
      el.setAttribute('content', keywords);
    }

    // ── 4. Open Graph ───────────────────────────────────────────────────────
    setMeta('[property="og:title"]', fullTitle);
    setMeta('[property="og:description"]', description || DEFAULT_DESCRIPTION);
    if (imageUrl) setMeta('[property="og:image"]', imageUrl);
    if (canonicalUrl) {
      setMeta('[property="og:url"]', canonicalUrl);
      setLink('canonical', canonicalUrl);
    }

    // ── Cleanup: restore default title when component unmounts ──────────────
    return () => {
      document.title = 'PhysicMUT – Mô phỏng Vật lý 3D Trực quan';
    };
  }, [title, description, keywords, imageUrl, canonicalUrl]);
}

export default useSEO;
