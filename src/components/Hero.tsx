import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import api from '../config/axios';

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  overlayOpacity?: number;
}

const Hero: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/hero-slides');
        setSlides(response.data);
      } catch (error) {
        console.error('Failed to fetch slides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false),500);
  }, [slides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);
  
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentSlide, isTransitioning]);

  const startAutoSlide = useCallback(() => {
    if (slides.length > 1 && isPlaying) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 2000);
    }
  }, [slides.length, isPlaying, nextSlide]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleAutoSlide = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }

    return () => stopAutoSlide();
  }, [isPlaying, startAutoSlide, stopAutoSlide]);

  if (loading || slides.length === 0) {
    // Display a fallback hero section while loading or if no slides
    return (
      <div className='relative bg-gray-900'>
        <div className='absolute inset-0'>
          <img
            className='w-full h-full object-cover'
            src='https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
            alt='Fashion model in elegant clothing'
          />
          <div className='absolute inset-0 bg-gray-900 bg-opacity-40'></div>
        </div>
        <div className='relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8'>
          <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl'>
            {loading ? 'Loading...' : 'ELEGANCE'}
          </h1>
          <p className='mt-6 text-xl text-white max-w-3xl'>
            {loading ? '' : 'Timeless style for the modern individual. Our new collection blends contemporary design with sustainable craftsmanship.'}
          </p>
          <div className='mt-10 flex space-x-4'>
            <Link
              to='/products'
              className='inline-block bg-white py-3 px-8 border border-transparent rounded-md text-base font-medium text-gray-900 hover:bg-gray-100'
            >
              Shop Now
            </Link>
            <Link
              to='/about'
              className='inline-block py-3 px-8 border border-transparent rounded-md text-base font-medium text-white bg-transparent hover:bg-white hover:bg-opacity-10'
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative overflow-hidden bg-gray-900' style={{ height: 'calc(100vh - 80px)' }}>
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}>
          <img
            src={slide.image}
            alt={slide.title}
            className='w-full h-full object-cover'
          />
          <div
            className='absolute inset-0'
            style={{
              backgroundColor: slide.backgroundColor || '#000000',
              opacity: slide.overlayOpacity ?? 0.4,
            }}
          ></div>
        </div>
      ))}

      <div className='relative max-w-7xl mx-auto flex items-center justify-center h-full text-center px-4'>
        <div style={{ color: slides[currentSlide]?.textColor || '#ffffff' }}>
          <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl'>
            {slides[currentSlide]?.title}
          </h1>
          <h2 className='mt-4 text-2xl font-semibold'>
            {slides[currentSlide]?.subtitle}
          </h2>
          <p className='mt-6 text-xl max-w-3xl mx-auto'>
            {slides[currentSlide]?.description}
          </p>
          <div className='mt-10 flex justify-center space-x-4'>
            <Link
              to={slides[currentSlide]?.buttonLink || '/products'}
              className='inline-block bg-white py-3 px-8 border border-transparent rounded-md text-base font-medium text-gray-900 hover:bg-gray-100'
            >
              {slides[currentSlide]?.buttonText || 'Shop Now'}
            </Link>
            {slides[currentSlide]?.secondaryButtonText && (
              <Link
                to={slides[currentSlide]?.secondaryButtonLink || '/about'}
                className='inline-block py-3 px-8 border border-transparent rounded-md text-base font-medium text-white bg-transparent hover:bg-white hover:bg-opacity-10'
              >
                {slides[currentSlide]?.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className='absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition'
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className='absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition'
          >
            <ChevronRight size={24} />
          </button>
          <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4'>
            <button onClick={toggleAutoSlide} className='text-white'>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className='flex space-x-2'>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    currentSlide === index ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;
