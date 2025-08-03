import React, { memo, useState, useCallback, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

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
  fallbackSrc = '/api/placeholder/64/64',
  loading = 'lazy',
  width,
  height
}: OptimizedImageProps) => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback(() => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  }, [fallbackSrc, hasError]);
  
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);
  
  useEffect(() => {
    // Reset states and load only if in viewport
    if (isIntersecting && src !== imgSrc && !hasError) {
      setImgSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, imgSrc, hasError, isIntersecting]);
  
  return (
    <div ref={elementRef} className={`relative ${isLoading ? 'bg-gray-200 animate-pulse' : ''}`}>
      <img
        src={imgSrc}
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
