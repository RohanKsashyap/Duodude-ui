import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../config/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Fallback skeleton shown while loading ────────────────────────────────────

const HeroSkeleton: React.FC<{ slowLoad: boolean }> = ({ slowLoad }) => (
  <div className='relative w-full overflow-hidden bg-neutral-900' style={{ height: '80vh', minHeight: 480 }}>
    {/* Fallback background image */}
    <img
      src='https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80'
      alt='Fashion'
      className='absolute inset-0 w-full h-full object-cover object-center opacity-60'
    />
    {/* Gradient overlay */}
    <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent' />

    {/* Content */}
    <div className='absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24'>
      <div className='max-w-xl'>
        {slowLoad ? (
          <>
            <p className='text-xs uppercase tracking-[0.3em] text-white/60 mb-4'>Please wait</p>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight'>
              Starting up…
            </h1>
            <p className='mt-4 text-white/70 text-base sm:text-lg'>
              The server is waking up. This takes ~30 seconds on first load.
            </p>
          </>
        ) : (
          <>
            {/* Shimmer bars */}
            <div className='h-3 w-24 bg-white/20 rounded-full mb-5 animate-pulse' />
            <div className='h-10 w-72 bg-white/20 rounded mb-3 animate-pulse' />
            <div className='h-10 w-56 bg-white/20 rounded mb-6 animate-pulse' />
            <div className='h-4 w-64 bg-white/10 rounded mb-2 animate-pulse' />
            <div className='h-4 w-48 bg-white/10 rounded mb-8 animate-pulse' />
            <div className='h-12 w-36 bg-white/20 rounded animate-pulse' />
          </>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Hero Component ──────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch slides ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);
    api
      .get('/api/hero-slides')
      .then((res) => {
        setSlides(res.data);
      })
      .catch((err) => console.error('Hero fetch error:', err))
      .finally(() => {
        clearTimeout(slowTimer);
        setLoading(false);
        setSlowLoad(false);
      });
  }, []);

  // ── Slide transition with content fade ───────────────────────────────────────
  const changeSlide = useCallback(
    (next: number) => {
      if (transitioning || slides.length <= 1) return;
      setTransitioning(true);
      setContentVisible(false); // fade out text

      setTimeout(() => {
        setCurrent(next);
        setContentVisible(true); // fade in new text
        setTimeout(() => setTransitioning(false), 600);
      }, 300);
    },
    [transitioning, slides.length]
  );

  const next = useCallback(
    () => changeSlide(current === slides.length - 1 ? 0 : current + 1),
    [current, slides.length, changeSlide]
  );

  const prev = useCallback(
    () => changeSlide(current === 0 ? slides.length - 1 : current - 1),
    [current, slides.length, changeSlide]
  );

  const goTo = useCallback(
    (i: number) => { if (i !== current) changeSlide(i); },
    [current, changeSlide]
  );

  // ── Autoplay ──────────────────────────────────────────────────────────────────
  const clearAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    clearAuto();
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(next, 5000);
    }
    return clearAuto;
  }, [isPlaying, slides.length, next, clearAuto]);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading || slides.length === 0) {
    return <HeroSkeleton slowLoad={slowLoad} />;
  }

  const slide = slides[current];
  const overlay = slide.overlayOpacity ?? 0.45;
  const textColor = slide.textColor || '#ffffff';

  return (
    <section
      className='relative w-full overflow-hidden bg-neutral-900 select-none'
      aria-label='Hero slider'
    >
      {/* ── Image layer (all slides pre-rendered, opacity toggled) ─────────────── */}
      {slides.map((s, i) => (
        <div
          key={s._id}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/*
           *  Single image — same src for all breakpoints.
           *  Desktop: object-position left-center keeps subject visible on wide crops.
           *  Mobile:  object-position center keeps subject visible on tall crops.
           *  Use CSS classes to swap position per breakpoint.
           */}
          <img
            src={s.image}
            alt={s.title}
            loading={i === 0 ? 'eager' : 'lazy'}
            className='
              w-full h-full
              object-cover
              object-center          /* mobile: center crop */
              sm:object-[center_20%] /* tablet: slight upward shift */
              lg:object-[center_15%] /* desktop: show more of the top */
            '
          />
        </div>
      ))}

      {/*
       * ── Gradient overlays ──────────────────────────────────────────────────
       * Mobile:  bottom-to-top gradient so text at bottom stays readable.
       * Desktop: left-to-right gradient for left-aligned editorial layout.
       * Both layers stack via absolute positioning.
       */}

      {/* Mobile gradient (bottom-heavy) */}
      <div
        className='absolute inset-0 sm:hidden'
        style={{
          background: `linear-gradient(
            to top,
            rgba(0,0,0,${Math.min(overlay + 0.35, 0.92)}) 0%,
            rgba(0,0,0,${overlay}) 45%,
            rgba(0,0,0,${Math.max(overlay - 0.15, 0)}) 100%
          )`,
        }}
      />

      {/* Desktop gradient (left-heavy) */}
      <div
        className='absolute inset-0 hidden sm:block'
        style={{
          background: `linear-gradient(
            105deg,
            rgba(0,0,0,${Math.min(overlay + 0.3, 0.88)}) 0%,
            rgba(0,0,0,${overlay}) 45%,
            rgba(0,0,0,0) 100%
          )`,
        }}
      />

      {/*
       * ── Hero heights ───────────────────────────────────────────────────────
       * Mobile:  60vh so the image fills a good portion without pushing page down
       * Desktop: 80vh for the full editorial feel
       */}
      <div
        className='relative flex flex-col justify-end sm:justify-center'
        style={{
          height: 'clamp(420px, 60vh, 640px)',
        }}
      >
        {/* Override height on sm+ */}
        <style>{`
          @media (min-width: 640px) {
            .hero-inner { height: clamp(520px, 80vh, 920px) !important; }
          }
        `}</style>
        <div
          className='hero-inner relative flex flex-col justify-end sm:justify-center w-full h-full'
        >
          {/*
           * ── Content block ────────────────────────────────────────────────────
           * Mobile:  centered, pinned to bottom third, text smaller
           * Desktop: left-aligned, vertically centered, large editorial type
           */}
          <div
            className={`
              absolute inset-0 flex flex-col
              items-center justify-end pb-16   /* mobile: center+bottom */
              sm:items-start sm:justify-center sm:pb-0   /* desktop: left+middle */
              px-6 sm:px-12 lg:px-24
              transition-opacity duration-500 ease-in-out
              ${contentVisible ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ color: textColor }}
          >
            <div className='max-w-lg lg:max-w-2xl text-center sm:text-left'>

              {/* Eyebrow / subtitle */}
              {slide.subtitle && (
                <p
                  className='
                    text-[10px] sm:text-xs
                    uppercase tracking-[0.3em]
                    font-medium mb-3 sm:mb-4
                    opacity-80
                  '
                >
                  {slide.subtitle}
                </p>
              )}

              {/* Main title */}
              <h1
                className='
                  text-3xl sm:text-5xl lg:text-6xl xl:text-7xl
                  font-extrabold leading-[1.05] tracking-tight
                  mb-3 sm:mb-5
                '
              >
                {slide.title}
              </h1>

              {/* Description */}
              {slide.description && (
                <p
                  className='
                    text-sm sm:text-base lg:text-lg
                    opacity-80 leading-relaxed
                    mb-6 sm:mb-8
                    max-w-sm sm:max-w-md
                    mx-auto sm:mx-0
                  '
                >
                  {slide.description}
                </p>
              )}

              {/* CTA buttons */}
              <div className='flex flex-wrap gap-3 justify-center sm:justify-start'>
                {/* Primary */}
                <Link
                  to={slide.buttonLink || '/products'}
                  className='
                    group inline-flex items-center gap-2
                    bg-white text-black
                    text-sm font-semibold uppercase tracking-wider
                    px-7 py-3.5 rounded-sm
                    hover:bg-neutral-100
                    active:scale-95
                    transition-all duration-200
                  '
                >
                  {slide.buttonText || 'Shop Now'}
                  <ArrowRight
                    size={15}
                    className='transition-transform duration-200 group-hover:translate-x-1'
                  />
                </Link>

                {/* Secondary */}
                {slide.secondaryButtonText && (
                  <Link
                    to={slide.secondaryButtonLink || '/about'}
                    className='
                      inline-flex items-center gap-2
                      border border-white/60 text-white
                      text-sm font-semibold uppercase tracking-wider
                      px-7 py-3.5 rounded-sm
                      hover:border-white hover:bg-white/10
                      active:scale-95
                      transition-all duration-200
                    '
                  >
                    {slide.secondaryButtonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation (only when multiple slides) ──────────────────────────── */}
      {slides.length > 1 && (
        <>
          {/* Prev arrow */}
          <button
            onClick={() => { clearAuto(); prev(); }}
            aria-label='Previous slide'
            className='
              absolute left-3 sm:left-5 top-1/2 -translate-y-1/2
              w-9 h-9 sm:w-11 sm:h-11
              flex items-center justify-center
              bg-black/40 hover:bg-black/70
              text-white rounded-full
              transition-colors duration-200
              z-20
            '
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next arrow */}
          <button
            onClick={() => { clearAuto(); next(); }}
            aria-label='Next slide'
            className='
              absolute right-3 sm:right-5 top-1/2 -translate-y-1/2
              w-9 h-9 sm:w-11 sm:h-11
              flex items-center justify-center
              bg-black/40 hover:bg-black/70
              text-white rounded-full
              transition-colors duration-200
              z-20
            '
          >
            <ChevronRight size={20} />
          </button>

          {/* Dot indicators + progress bar */}
          <div className='absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20'>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearAuto(); goTo(i); }}
                aria-label={`Go to slide ${i + 1}`}
                className='relative overflow-hidden rounded-full transition-all duration-300'
                style={{
                  width: i === current ? 28 : 8,
                  height: 8,
                  backgroundColor:
                    i === current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                }}
              >
                {/* Autoplay progress fill on active dot */}
                {i === current && isPlaying && (
                  <span
                    className='absolute inset-y-0 left-0 bg-white/40 rounded-full animate-none'
                    style={{ animation: 'heroProgress 5s linear infinite' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Autoplay toggle — top-right corner */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause autoplay' : 'Resume autoplay'}
            className='
              absolute top-4 right-4
              text-[10px] uppercase tracking-widest
              text-white/60 hover:text-white
              transition-colors duration-200
              z-20 hidden sm:block
            '
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </>
      )}

      {/* Keyframe for progress bar animation */}
      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
