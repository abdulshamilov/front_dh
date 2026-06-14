"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ICard } from "@/app/types/models";
import { parsePriceToNumber } from "@/app/shared/utils/price";
import { getViewedCardIds } from "@/app/shared/utils/viewedCards";
import { useToast } from "@/app/components/shared/Toast";
import { MapCanvas, type MapCanvasHandle } from "./components/MapCanvas";
import {
  MapTopBar,
  type MapFilters,
  type MapFilterKey,
} from "./components/MapTopBar";
import { SelectedCardSheet } from "./components/SelectedCardSheet";
import { NearbyCardsStrip } from "./components/NearbyCardsStrip";
import type { LayerKey } from "./components/LayersChip";
import { MyLocationFAB } from "./components/MyLocationFAB";
import { SearchThisAreaButton } from "./components/SearchThisAreaButton";
import { ZoomBreadcrumb } from "./components/ZoomBreadcrumb";
import { useMapCards } from "./hooks/useMapCards";
import { MapScheduleModal } from "./components/MapScheduleModal";

// City label is purely an orientation aid for ZoomBreadcrumb. The map is
// always centered on Makhachkala (see MapCanvas DEFAULT center) and the
// dataset is Dagestan-scoped, so a static label is correct here.
const CITY_LABEL = "Махачкала";
// Approximate rendered height of the SelectedCardSheet — used to lift the
// strip / FABs above it so nothing overlaps.
const CARD_SHEET_HEIGHT = 232;

// Layers and compare are intentionally not mounted on /map (product
// decision). MapCanvas / NearbyCardsStrip still require their Set props,
// so we pass stable empty sets — no POI layers drawn, no compare dots.
const EMPTY_LAYERS: Set<LayerKey> = new Set();
const EMPTY_IDS: Set<number> = new Set();

/**
 * /map integration container.
 *
 * This page owns NO MapLibre instance and does NOT touch the Redux cards
 * slice — both responsibilities live elsewhere by design (see the two
 * audit-risk notes inline). It is a pure state hub: it holds the
 * cross-component state (selection, center, zoom, search-pill visibility)
 * and wires the children together via props and callbacks so they all
 * stay in sync.
 */
export default function MapPage() {
  // RISK 1 fix — single data source. Cards come ONLY from useMapCards()
  // (its own paginated fetch loop). No dispatch(fetchCards), no
  // useAppSelector(state.cards): the map never competes with the home
  // list's Redux pagination, eliminating the double-load / torn-state bug.
  const { cards, isLoading, fetchError } = useMapCards();

  const { show } = useToast();

  // RISK 2 fix — single MapLibre instance. The page never constructs a
  // maplibregl.Map. MapCanvas is the sole owner; we only hold a handle ref
  // and call its imperative methods (flyTo / panTo).
  const mapRef = useRef<MapCanvasHandle>(null);

  // RISK 3 fix — centralized state. All cross-component state lives here and
  // is pushed down as props + callbacks, so pins, strip and sheet can never
  // drift out of sync.
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);
  // Cluster tap → list of every apartment of that complex. Mutually
  // exclusive with selectedCard: opening one always clears the other so the
  // sheet renders exactly one mode.
  const [clusterCards, setClusterCards] = useState<ICard[] | null>(null);
  // Cards the user already opened (/card/{id}) — read once from localStorage
  // at mount so visited pins render dimmed. Lazy initializer is SSR-safe
  // (getViewedCardIds guards `window`).
  const [viewedIds] = useState<Set<number>>(() => getViewedCardIds());
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    maxPrice: false,
    minRooms: false,
    onlyNew: false,
  });

  // Quick-filter pass over the locally fetched dataset. useMapCards
  // intentionally ignores filters (broadest set of geocoded cards), so the
  // filtering for the chips happens here, client-side.
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filters.maxPrice && parsePriceToNumber(card.price) > 10_000_000) {
        return false;
      }
      if (filters.minRooms && card.rooms < 2) {
        return false;
      }
      if (filters.onlyNew && card.category !== "new_building") {
        return false;
      }
      return true;
    });
  }, [cards, filters]);

  const handleFilterChange = useCallback((key: MapFilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Pin tap → select + recenter. flyTo also bumps zoom so the chosen
  // object is comfortably in frame.
  const handlePinClick = useCallback((card: ICard) => {
    setSelectedCard(card);
    setClusterCards(null);
    if (
      card.latitude != null &&
      card.longitude != null &&
      Number.isFinite(card.latitude) &&
      Number.isFinite(card.longitude)
    ) {
      mapRef.current?.flyTo(card.longitude, card.latitude);
    }
  }, []);

  // Cluster tap → open the list sheet; clear any single selection.
  const handleClusterClick = useCallback((cardsInGroup: ICard[]) => {
    setClusterCards(cardsInGroup);
    setSelectedCard(null);
  }, []);

  // Row tap inside the list → drill into that apartment's single preview.
  const handleSelectFromList = useCallback((card: ICard) => {
    setClusterCards(null);
    setSelectedCard(card);
    if (
      card.latitude != null &&
      card.longitude != null &&
      Number.isFinite(card.latitude) &&
      Number.isFinite(card.longitude)
    ) {
      mapRef.current?.panTo(card.longitude, card.latitude);
    }
  }, []);

  // Tap on empty map → clear selection (single + list).
  const handleMapClick = useCallback(() => {
    setSelectedCard(null);
    setClusterCards(null);
  }, []);

  // Drag/zoom end → sync center+zoom and surface "Search this area".
  const handleMoveEnd = useCallback(() => {
    const center = mapRef.current?.getCenter() ?? null;
    const z = mapRef.current?.getZoom() ?? null;
    setMapCenter(center);
    setZoom(z);
    setSearchVisible(true);
  }, []);

  // Strip tap → select + pan (no zoom change, matching strip UX).
  const handleCardTap = useCallback((card: ICard) => {
    setSelectedCard(card);
    setClusterCards(null);
    if (
      card.latitude != null &&
      card.longitude != null &&
      Number.isFinite(card.latitude) &&
      Number.isFinite(card.longitude)
    ) {
      mapRef.current?.panTo(card.longitude, card.latitude);
    }
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedCard(null);
    setClusterCards(null);
  }, []);

  const handleSchedule = useCallback(() => {
    setScheduleOpen(true);
  }, []);

  const handleLocate = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo(lng, lat, 14);
  }, []);

  const handleLocateError = useCallback(
    (message: string) => {
      show(message, { type: "error" });
    },
    [show]
  );

  // The strip already filters by current bbox/center on its own (it resorts
  // by distance to `center`). useMapCards exposes no bbox API, so "Search
  // this area" only acknowledges the action by hiding the pill — we do not
  // invent a fetch endpoint that doesn't exist.
  const handleSearchThisArea = useCallback(() => {
    setSearchVisible(false);
  }, []);

  // Sheet is open in EITHER mode — single card or cluster list. Strip / FAB
  // must lift above it in both.
  const sheetOpen = selectedCard !== null || clusterCards !== null;

  return (
    <div
      className="relative w-full"
      style={{
        // Full dynamic viewport. /map hides the BottomBar and the mobile
        // Header is a static (non-fixed) in-flow block, so there is no
        // fixed chrome to subtract — the old `calc(100vh - 72px)` cut the
        // map short and left dead space. 100dvh tracks the mobile address
        // bar correctly so the map truly fills the phone screen.
        height: "100dvh",
        backgroundColor: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fullscreen map background — sole MapLibre owner. Fills the
          container edge to edge; floating overlays sit on top. */}
      <div style={{ position: "absolute", inset: 0 }}>
        <MapCanvas
          ref={mapRef}
          cards={filteredCards}
          selectedCard={selectedCard}
          comparingIds={EMPTY_IDS}
          viewedIds={viewedIds}
          activeLayers={EMPTY_LAYERS}
          onPinClick={handlePinClick}
          onClusterClick={handleClusterClick}
          onMapClick={handleMapClick}
          onMoveEnd={handleMoveEnd}
        />
      </div>

      {/* Top overlay: back, count, quick filters. */}
      <MapTopBar
        count={filteredCards.length}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Orientation aid + "search this area" share the top-center slot;
          the pill takes over once the user moves the map. */}
      {searchVisible ? (
        <SearchThisAreaButton
          visible={searchVisible}
          onClick={handleSearchThisArea}
        />
      ) : (
        <ZoomBreadcrumb city={CITY_LABEL} zoom={zoom} />
      )}

      {/* Right FAB — my location. Rises further when the sheet is open. */}
      <MyLocationFAB
        onLocate={handleLocate}
        onError={handleLocateError}
        liftedAboveStrip={sheetOpen}
      />

      {/* Nearby carousel — always on; lifts above the sheet when open. */}
      <NearbyCardsStrip
        cards={filteredCards}
        center={mapCenter}
        selectedCard={selectedCard}
        onCardTap={handleCardTap}
        comparingIds={EMPTY_IDS}
        isLoading={isLoading}
        liftedAboveCard={sheetOpen}
        cardSheetHeight={CARD_SHEET_HEIGHT}
      />

      {/* Bottom sheet preview for the selected pin. Compare is not offered
          on /map — onToggleCompare omitted, so the compare button is not
          rendered (SelectedCardSheet treats it as optional). */}
      <SelectedCardSheet
        card={selectedCard}
        cards={clusterCards ?? undefined}
        onSelectFromList={handleSelectFromList}
        onClose={handleCloseSheet}
        onSchedule={handleSchedule}
      />

      {/* Модальное окно записи на показ — открывается по кнопке в SelectedCardSheet. */}
      <MapScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        jk={selectedCard?.title ?? ""}
      />

      {/* Non-blocking fetch error notice (toast-free, doesn't hide the map). */}
      {fetchError && !isLoading && (
        <div
          role="alert"
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 21,
            padding: "8px 14px",
            background: "rgba(7,7,7,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border-glass)",
            borderRadius: 12,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
            fontSize: 13,
          }}
        >
          {fetchError}
        </div>
      )}
    </div>
  );
}
