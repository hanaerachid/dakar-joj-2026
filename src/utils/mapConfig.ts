export const INITIAL_CENTER: [number, number] = [-17.194, 14.593];
export const INITIAL_ZOOM = 9.75;
export const MOBILE_INITIAL_CENTER: [number, number] = [-17.194, 14.68];
export const MOBILE_INITIAL_ZOOM = 8.3;

export const getInitialZoom = (): number => {
  if (typeof window === "undefined") return INITIAL_ZOOM;
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  return isMobile ? MOBILE_INITIAL_ZOOM : INITIAL_ZOOM;
};

export const getInitialCenter = (): [number, number] => {
  if (typeof window === "undefined") return INITIAL_CENTER;
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  return isMobile ? MOBILE_INITIAL_CENTER : INITIAL_CENTER;
};

export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";