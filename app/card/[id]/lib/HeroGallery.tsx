"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import type { ICard } from "@/app/types/models";
import "yet-another-react-lightbox/styles.css";

/**
 * Pixel-perfect web port of the mobile DetailHeroGallery.kt Compose component.
 * dp -> px 1:1. Colors via var(--*) tokens; rgba(7,7,7,...) mirrors Compose
 * `DreamColors.background.copy(alpha=...)` translucent overlays.
 */

interface HeroGalleryProps {
  card: ICard;
  isFavorite: boolean;
  onToggleFav: () => void;
  onShare: () => void;
  onBack: () => void;
  aspectRatio?: string;
}

/** Translucent 40x40 control button, lucide icon 20px inside. */
function HeroControlButton({
  onClick,
  ariaLabel,
  ariaPressed,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  ariaPressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className="press-scale"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "rgba(7, 7, 7, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

export function HeroGallery({
  card,
  isFavorite,
  onToggleFav,
  onShare,
  onBack,
  aspectRatio = "4 / 5",
}: HeroGalleryProps) {
  const images = useMemo(
    () =>
      (card.images ?? []).filter(
        (img) =>
          img.image && typeof img.image === "string" && img.image.trim() !== ""
      ),
    [card.images]
  );
  const videos = useMemo(
    () =>
      (card.videos ?? []).filter(
        (vid) =>
          vid.video && typeof vid.video === "string" && vid.video.trim() !== ""
      ),
    [card.videos]
  );
  const hasVideo = videos.length > 0;

  // Slides: all images, then (optionally) the first video as the last slide.
  const totalPages = hasVideo ? images.length + 1 : images.length;
  const hasMedia = totalPages > 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    startIndex: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentPage(emblaApi.selectedScrollSnap());
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
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [emblaApi, handleResize]);

  // Lightbox slides mirror the legacy ImageCarousel approach (images only).
  const lightboxSlides = useMemo(
    () => images.map((img) => ({ src: img.image })),
    [images]
  );

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio,
    overflow: "hidden",
    borderRadius: "0 0 15px 15px",
  };

  return (
    <div style={containerStyle} role="region" aria-label="Галерея объекта">
      {hasMedia ? (
        <div
          ref={emblaRef}
          style={{ overflow: "hidden", width: "100%", height: "100%" }}
        >
          <div style={{ display: "flex", height: "100%" }}>
            {images.map((img, index) => (
              <div
                key={img.id ?? index}
                style={{
                  flex: "0 0 100%",
                  minWidth: 0,
                  position: "relative",
                  height: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  aria-label={`Открыть фото ${index + 1} на весь экран`}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "zoom-in",
                    display: "block",
                    position: "relative",
                  }}
                >
                  <Image
                    src={img.image}
                    alt={`${card.title} — фото ${index + 1}`}
                    fill
                    sizes="(max-width: 480px) 100vw, 480px"
                    style={{ objectFit: "cover" }}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </button>
              </div>
            ))}

            {hasVideo && (
              <div
                key="video"
                style={{
                  flex: "0 0 100%",
                  minWidth: 0,
                  position: "relative",
                  height: "100%",
                }}
              >
                <video
                  src={videos[0].video}
                  controls
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  Ваш браузер не поддерживает видео
                </video>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Фото скоро</span>
        </div>
      )}

      {/* Gradient overlay (top, 100px) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100px",
          background:
            "linear-gradient(180deg, rgba(7, 7, 7, 0.5) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top controls */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
        }}
      >
        <HeroControlButton onClick={onBack} ariaLabel="Назад">
          <ArrowLeft size={20} color="#FFFFFF" />
        </HeroControlButton>

        <div style={{ display: "flex", gap: "8px" }}>
          <HeroControlButton onClick={onShare} ariaLabel="Поделиться">
            <Share2 size={20} color="#FFFFFF" />
          </HeroControlButton>

          <HeroControlButton
            onClick={onToggleFav}
            ariaLabel={
              isFavorite ? "Убрать из избранного" : "Добавить в избранное"
            }
            ariaPressed={isFavorite}
          >
            <Heart
              size={20}
              color={isFavorite ? "var(--favorite)" : "#FFFFFF"}
              fill={isFavorite ? "var(--favorite)" : "none"}
            />
          </HeroControlButton>
        </div>
      </div>

      {/* Page counter */}
      {totalPages > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(7, 7, 7, 0.6)",
            borderRadius: "9999px",
            padding: "4px 12px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "var(--font-stetica-medium)",
              color: "#FFFFFF",
            }}
          >
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  );
}

export default HeroGallery;
