/**
 * Centralized placeholder image utilities
 * These base64-encoded SVG images eliminate network requests for fallback images
 */

// Generate a base64-encoded SVG placeholder
const generatePlaceholderSVG = (width: number, height: number, text: string = 'No Image') => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" fill="#97a3b4" text-anchor="middle" dy=".3em">${text}</text>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const PLACEHOLDER_IMAGES = {
  // Common sizes
  SMALL: generatePlaceholderSVG(48, 48),
  MEDIUM: generatePlaceholderSVG(100, 100),
  LARGE: generatePlaceholderSVG(300, 300),
  EXTRA_LARGE: generatePlaceholderSVG(400, 400),
  
  // Specific use cases
  PRODUCT_CARD: generatePlaceholderSVG(300, 300),
  PRODUCT_DETAIL: generatePlaceholderSVG(400, 400),
  PRODUCT_THUMBNAIL: generatePlaceholderSVG(100, 100),
  ORDER_ITEM: generatePlaceholderSVG(80, 80),
  ADMIN_THUMBNAIL: generatePlaceholderSVG(48, 48),
};

/**
 * Get a placeholder image for a specific size
 */
export const getPlaceholder = (width: number, height: number = width, text: string = 'No Image') => {
  return generatePlaceholderSVG(width, height, text);
};

/**
 * Handle image error by setting fallback
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackSrc?: string,
  size: keyof typeof PLACEHOLDER_IMAGES = 'MEDIUM'
) => {
  const target = event.target as HTMLImageElement;
  target.src = fallbackSrc || PLACEHOLDER_IMAGES[size];
};
