"use client";

import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import "yet-another-react-lightbox/styles.css";

interface ImageCarouselProps {
  images: Array<{ id?: number; image: string }>;
  videos?: Array<{ id?: number; video: string }>;
  title: string;
}

type MediaItem =
  | { type: 'image'; src: string; id?: number }
  | { type: 'video'; src: string; id?: number };

export function ImageCarousel({ images, videos = [], title }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Фильтруем и валидируем медиа-файлы
  const mediaItems: MediaItem[] = useMemo(() => {
    const validVideos = videos
      .filter(vid => vid.video && typeof vid.video === 'string' && vid.video.trim() !== '')
      .map(vid => ({ type: 'video' as const, src: vid.video, id: vid.id }));

    const validImages = images
      .filter(img => img.image && typeof img.image === 'string' && img.image.trim() !== '')
      .map(img => ({ type: 'image' as const, src: img.image, id: img.id }));

    return [...validVideos, ...validImages];
  }, [videos, images]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleResize = useCallback(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [emblaApi, handleResize]);

  const lightboxSlides = useMemo(() => images.map((img) => ({
    src: img.image,
  })), [images]);

  const handleImageClick = useCallback((itemSrc: string) => {
    const imageIndex = images.findIndex(img => img.image === itemSrc);
    if (imageIndex !== -1) {
      setLightboxIndex(imageIndex);
      setLightboxOpen(true);
    }
  }, [images]);

  // Если нет медиа-файлов, показываем placeholder
  if (mediaItems.length === 0) {
    return (
      <div className="relative w-full aspect-[4/3] lg:aspect-[16/9]">
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <div className="text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2" style={{ color: "var(--text-secondary)" }}>
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor" opacity="0.5"/>
            </svg>
            <p style={{ color: "var(--text-secondary)" }}>Изображения отсутствуют</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 relative aspect-[4/3] lg:aspect-[16/9]"
              >
                {(item.type === 'image') ? (
                  <div
                    className="cursor-zoom-in w-full h-full relative"
                    onClick={() => {
                      handleImageClick(item.src);
                    }}
                  >
                    <Image
                      src={item.src}
                      alt={`${title} - фото ${index + 1}`}
                      fill
                      sizes="(max-width: 1300px) 100vw, 1300px"
                      className="object-cover"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Заменяем на серый блок при ошибке загрузки
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center" style="background-color: var(--surface);">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-secondary); opacity: 0.5;">
                                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Gradient overlay at top */}
                    <div
                      className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                      style={{
                        background: "linear-gradient(to bottom, rgba(7, 7, 7, 0.5) 0%, transparent 100%)",
                      }}
                    />
                  </div>
                ) : (
                  <video
                    src={item.src}
                    controls
                    className="w-full h-full object-cover"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                    preload="metadata"
                  >
                    Ваш браузер не поддерживает видео
                  </video>
                )}
              </div>
            ))}
          </div>
        </div>

        {mediaItems.length > 1 && (
          <>
            <button
              className="glass-button absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{
                borderRadius: "var(--radius-md)",
              }}
              onClick={scrollPrev}
              aria-label="Предыдущее"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className="glass-button absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{
                borderRadius: "var(--radius-md)",
              }}
              onClick={scrollNext}
              aria-label="Следующее"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  className="rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      index === selectedIndex
                        ? "var(--accent-primary)"
                        : "rgba(255, 255, 255, 0.4)",
                    width: index === selectedIndex ? "24px" : "8px",
                    height: "8px",
                  }}
                  onClick={() => scrollTo(index)}
                  aria-label={`Перейти к ${item.type === 'image' ? 'фото' : 'видео'} ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </>
  );
}
