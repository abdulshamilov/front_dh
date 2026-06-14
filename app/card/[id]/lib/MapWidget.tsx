"use client";

import {
  FullscreenControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
} from "@mr-igorinni/react-yandex-maps-fork";

interface MapWidgetProps {
  address: string;
  latitude: number;
  longitude: number;
}

export function MapWidget({ latitude, longitude }: MapWidgetProps) {
  return (
    <div className="w-full h-full" style={{ minHeight: "280px" }}>
      <YMaps>
        <Map
          defaultState={{
            center: [latitude, longitude],
            zoom: 15,
          }}
          width="100%"
          height="100%"
        >
          <Placemark geometry={[latitude, longitude]} />
          <ZoomControl />
          <FullscreenControl />
        </Map>
      </YMaps>
    </div>
  );
}
