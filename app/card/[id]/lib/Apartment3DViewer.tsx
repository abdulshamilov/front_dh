'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCw, Camera, Box, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import type { ModelViewerElement } from '@/types/model-viewer';

type Props = {
  glbUrl: string;
  usdzUrl?: string | null;
  posterUrl?: string | null;
  alt?: string;
  apartmentId?: string | number;
};

// Convert absolute media URLs to relative paths so model-viewer's fetch()
// goes through Next.js proxy (/media/ → api.dreamhouse05.com/media/).
// Works in both dev (Next.js dev server) and prod (Vercel rewrite).
function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/media/')) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    // already a relative URL — use as-is
  }
  return url;
}

export default function Apartment3DViewer({
  glbUrl,
  usdzUrl,
  posterUrl,
  alt = '3D-модель планировки квартиры',
  apartmentId,
}: Props) {
  const resolvedGlb = resolveMediaUrl(glbUrl) ?? glbUrl;
  const resolvedUsdz = resolveMediaUrl(usdzUrl);
  const resolvedPoster = resolveMediaUrl(posterUrl);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const interactionTrackedRef = useRef(false);

  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  // Lazy-load model-viewer from npm — runs once, no external CDN needed
  useEffect(() => {
    import('@google/model-viewer').catch(() => {
      // model-viewer load failed — individual model errors handled below
    });
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent<{ totalProgress: number }>).detail;
      if (detail) setLoadProgress(Math.round(detail.totalProgress * 100));
    };

    const handleCameraChange = () => {
      if (interactionTrackedRef.current) return;
      interactionTrackedRef.current = true;
      if (typeof window !== 'undefined' && 'ym' in window) {
        const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
        if (ymId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).ym(Number(ymId), 'reachGoal', '3d_model_interaction', {
            apartment_id: apartmentId,
          });
        }
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('camera-change', handleCameraChange);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('camera-change', handleCameraChange);
    };
  }, [apartmentId, retryKey]);

  const toggleAutoRotate = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.autoRotate = !isRotating;
    setIsRotating(!isRotating);
  };

  const takeSnapshot = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const dataUrl = viewer.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `dreamhouse-3d-${apartmentId ?? 'apartment'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setLoadProgress(0);
    interactionTrackedRef.current = false;
    setRetryKey((k) => k + 1);
  };

  if (hasError) {
    return (
      <div
        style={{
          position: 'relative',
          height: 350,
          borderRadius: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <AlertCircle size={40} color="var(--text-secondary)" />
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontFamily: 'var(--font-stetica-medium)',
            color: 'var(--text-secondary)',
          }}
        >
          Не удалось загрузить 3D-модель
        </p>
        <button
          onClick={handleRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 14,
            fontFamily: 'var(--font-stetica-medium)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div
      key={retryKey}
      style={{
        position: 'relative',
        height: 350,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--border-glass)',
      }}
    >
      <model-viewer
        ref={viewerRef}
        src={resolvedGlb}
        ios-src={resolvedUsdz}
        poster={resolvedPoster}
        alt={alt}
        camera-controls=""
        auto-rotate={isRotating ? '' : undefined}
        auto-rotate-delay="3000"
        rotation-per-second="20deg"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        loading="lazy"
        ar={resolvedUsdz ? '' : undefined}
        ar-modes="webxr scene-viewer quick-look"
        interaction-prompt="auto"
        interaction-prompt-style="wiggle"
        style={{ width: '100%', height: '100%', background: 'var(--surface)' }}
      >
        {/* Прогресс-бар пока грузится */}
        {isLoading && (
          <div
            slot="progress-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'var(--border-glass)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${loadProgress}%`,
                background: 'var(--accent-primary)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        )}

        {/* Подсказка по центру */}
        <div
          slot="interaction-prompt"
          style={{
            fontSize: 12,
            color: 'var(--text-primary)',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: '6px 14px',
            borderRadius: 999,
            pointerEvents: 'none',
            fontFamily: 'var(--font-stetica-medium)',
          }}
        >
          Зажмите и поверните
        </div>

        {/* Кнопка вращения — слева снизу */}
        <button
          onClick={toggleAutoRotate}
          aria-label={isRotating ? 'Остановить вращение' : 'Включить вращение'}
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13,
            fontFamily: 'var(--font-stetica-medium)',
            cursor: 'pointer',
          }}
        >
          <RotateCw
            size={15}
            style={{
              animation: isRotating ? 'spin 3s linear infinite' : 'none',
            }}
          />
          {isRotating ? 'Остановить' : 'Вращать'}
        </button>

        {/* Бейдж «3D-планировка» — по центру снизу */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13,
            fontFamily: 'var(--font-stetica-medium)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <Box size={14} color="var(--accent-primary)" />
          3D-планировка
        </div>

        {/* Кнопка снимка — справа снизу */}
        <button
          onClick={takeSnapshot}
          aria-label="Сделать снимок 3D-модели"
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13,
            fontFamily: 'var(--font-stetica-medium)',
            cursor: 'pointer',
          }}
        >
          <Camera size={15} />
          Снимок
        </button>

        {/* AR-кнопка — справа сверху (только если есть .usdz) */}
        {resolvedUsdz && (
          <button
            slot="ar-button"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 999,
              color: '#fff',
              fontSize: 13,
              fontFamily: 'var(--font-stetica-medium)',
              cursor: 'pointer',
            }}
          >
            <Smartphone size={15} />
            В AR
          </button>
        )}
      </model-viewer>

      {/* Скелетон пока скрипт model-viewer не загружен */}
      {isLoading && loadProgress === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            pointerEvents: 'none',
          }}
        >
          <Box size={48} color="var(--text-secondary)" />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
