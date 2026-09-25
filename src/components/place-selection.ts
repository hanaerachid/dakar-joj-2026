export const PLACE_SELECTED_EVENT = "dakar:place-selected";

export type PlaceSelection = {
  id: string;
  lng: number;
  lat: number;
  title?: string;
};

export function selectPlace(place: PlaceSelection) {
  window.dispatchEvent(
    new CustomEvent<PlaceSelection>(PLACE_SELECTED_EVENT, {
      detail: place,
    }),
  );
}