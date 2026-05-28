import { memo, useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.png',
  loading = 'lazy',
  width,
  height
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
    setIsLoading(false);
  }, [fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className={`relative ${isLoading ? 'bg-gray-200 animate-pulse' : ''}`}>
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        width={width}
        height={height}
        style={{
          transition: 'opacity 0.2s ease-in-out',
          opacity: isLoading ? 0.7 : 1
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;