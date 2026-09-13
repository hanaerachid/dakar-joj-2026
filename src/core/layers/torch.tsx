import mapboxgl, { type Map } from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { Flame } from "lucide-react";
import { destroyPopup, renderVenuePopup } from "../../components/popupRenderer";

export type TorchStop = {
	_id: string;
	name: string;
	region: string;
	location: {
		type: "Point";
		coordinates: [number, number];
	};
	tourDate: string;
	metadata?: {
		phase?: string;
		description?: string;
		isMajorStop?: boolean;
	};
};

export const TORCH_SOURCE_ID = "torch-route-source";
export const TORCH_LINE_ID = "torch-route-line";
export const TORCH_LINE_CASING_ID = "torch-route-casing";
export const TORCH_ARROWS_ID = "torch-route-arrows";

const TORCH_MARKERS = new WeakMap<Map, mapboxgl.Marker[]>();

const removeTorchMarkers = (map: Map) => {
	const markers = TORCH_MARKERS.get(map) ?? [];
	for (const marker of markers) {
		try {
			const el = marker.getElement() as HTMLElement | null;
			if (el) {
				// If we attached the React root to the element, unmount it now
				const maybeRoot = (el as any).__iconRoot;
				if (maybeRoot && typeof maybeRoot.unmount === "function") {
					try {
						maybeRoot.unmount();
					} catch {
						// ignore unmount errors
					}
				}
				delete (el as any).__iconRoot;
			}
		} catch {
			// ignore cleanup errors
		}
		marker.remove();
	}
	TORCH_MARKERS.set(map, []);
};

const removeTorchLayer = (map: Map, layerId: string) => {
	if (map.getLayer(layerId)) {
		map.removeLayer(layerId);
	}
};

export function clearTorchOverlay(map: Map) {
	removeTorchMarkers(map);
	removeTorchLayer(map, TORCH_ARROWS_ID);
	removeTorchLayer(map, TORCH_LINE_ID);
	removeTorchLayer(map, TORCH_LINE_CASING_ID);

	if (map.getSource(TORCH_SOURCE_ID)) {
		map.removeSource(TORCH_SOURCE_ID);
	}
}

function addTorchMarker(
	map: Map,
	stop: TorchStop,
	index: number,
) {
	const element = document.createElement("div");
	element.className = "torch-stop-marker";
	element.setAttribute(
		"aria-label",
		`${stop.name}, torch stop ${index + 1}`,
	);

	const icon = document.createElement("span");
	icon.className = "torch-stop-marker__icon";

	const iconRoot = createRoot(icon);
	iconRoot.render(
		<Flame size={18} strokeWidth={2.5} />,
	);

	// keep a reference on the element so we can unmount when removing markers
	(element as any).__iconRoot = iconRoot;

	const number = document.createElement("span");
	number.className = "torch-stop-marker__number";
	number.textContent = String(index + 1);

	element.append(icon, number);

	const marker = new mapboxgl.Marker({
		element,
		anchor: "bottom",
	})
		.setLngLat(stop.location.coordinates)
		.addTo(map);

	// Attach click listener directly to the marker element (markers are DOM-based)
	element.addEventListener("click", (ev: MouseEvent) => {
		// prevent bubbling to map click handlers which may close popups immediately
		ev.stopPropagation();

		let popup: mapboxgl.Popup | null = null;

		const popupNode = renderVenuePopup({
			title: stop.name || "Unknown Stop",
			zone: stop.region,
			info: stop.metadata?.description || "",
			coordinates: stop.location.coordinates,
			onClose: () => popup?.remove(),
		});

		popup = new mapboxgl.Popup({
			offset: 22,
			closeButton: false,
			closeOnClick: true,
		})
			.setLngLat(stop.location.coordinates)
			.setDOMContent(popupNode)
			.addTo(map);

		popup.once("close", () => {
			// cleanup popup DOM/rendered content when popup closes
			destroyPopup(popupNode);
		});
	});

	const markers = TORCH_MARKERS.get(map) ?? [];
	markers.push(marker);
	TORCH_MARKERS.set(map, markers);
}

export function addTorchOverlay(
	map: Map,
	stops: TorchStop[],
) {
	clearTorchOverlay(map);

	if (stops.length === 0) return;

	map.addSource(TORCH_SOURCE_ID, {
		type: "geojson",
		data: {
			type: "Feature",
			properties: {},
			geometry: {
				type: "LineString",
				coordinates: stops.map(
					(stop) => stop.location.coordinates,
				),
			},
		},
	});

	map.addLayer({
		id: TORCH_LINE_CASING_ID,
		type: "line",
		source: TORCH_SOURCE_ID,
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#fff7cc",
			"line-width": 9,
			"line-opacity": 0.9,
		},
	});

	map.addLayer({
		id: TORCH_LINE_ID,
		type: "line",
		source: TORCH_SOURCE_ID,
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#f97316",
			"line-width": 4,
			"line-dasharray": [1, 1.2],
		},
	});

	map.addLayer({
		id: TORCH_ARROWS_ID,
		type: "symbol",
		source: TORCH_SOURCE_ID,
		layout: {
			"symbol-placement": "line",
			"symbol-spacing": 80,
			"text-field": ">",
			"text-font": ["Open Sans Bold"],
			"text-size": 17,
			"text-keep-upright": false,
			"text-allow-overlap": true,
			"text-ignore-placement": true,
		},
		paint: {
			"text-color": "#c2410c",
			"text-halo-color": "#fff7cc",
			"text-halo-width": 2,
		},
	});

	stops.forEach((stop, index) => {
		addTorchMarker(map, stop, index);
	});
}

export async function fetchTorchStops(): Promise<TorchStop[]> {
	const response = await fetch("/api/v2/torch");

	if (!response.ok) {
		throw new Error(
			`Torch stops request failed (${response.status})`,
		);
	}

	const payload = (await response.json()) as {
		success?: boolean;
		data?: TorchStop[];
	};

	if (!payload.success || !Array.isArray(payload.data)) {
		throw new Error("Invalid torch stops response");
	}

	return payload.data;
}