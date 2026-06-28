export interface ModelViewerElement extends HTMLElement {
  autoRotate: boolean;
  cameraOrbit: string;
  toDataURL: (type?: string, quality?: number) => string;
  addEventListener(
    type: 'camera-change' | 'load' | 'error' | 'progress',
    listener: (e: Event) => void
  ): void;
  removeEventListener(type: string, listener: (e: Event) => void): void;
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          poster?: string;
          alt?: string;
          'camera-controls'?: boolean | '';
          'auto-rotate'?: boolean | '';
          'auto-rotate-delay'?: number | string;
          'rotation-per-second'?: string;
          'shadow-intensity'?: number | string;
          'environment-image'?: string;
          exposure?: number | string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'manual';
          ar?: boolean | '';
          'ar-modes'?: string;
          'ar-scale'?: string;
          'camera-orbit'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
          'interaction-prompt-style'?: 'basic' | 'wiggle';
          slot?: string;
        },
        HTMLElement
      >;
    }
  }
}
