type ReverseGeocodeResult = {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
};

type MapboxReverseResponse = {
  features?: Array<{
    properties?: {
      full_address?: string;
      name?: string;
      place_formatted?: string;
    };
  }>;
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export async function locateAndReverseGeocode(): Promise<ReverseGeocodeResult> {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  if (!token) {
    throw new Error("Mapbox access token is not configured.");
  }

  // 1. Get the user's current position.
  const position = await getCurrentPosition();

  const { latitude, longitude } = position.coords;

  // 2. Reverse geocode using Mapbox.
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    access_token: token,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/reverse?${params}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve an address from Mapbox.");
  }

  const data = (await response.json()) as MapboxReverseResponse;
  const feature = data.features?.[0];
  const properties = feature?.properties;

  const address =
    properties?.full_address ??
    properties?.place_formatted ??
    properties?.name;

  if (!address) {
    throw new Error("No address was found for your current location.");
  }

  return {
    coordinates: [longitude, latitude],
    address,
  };
}
