import { apiRequest } from "../apiClient";
import type { Event } from "../../shared/contracts";

export async function listEvents() {
  const query = new URLSearchParams();
  const response = await apiRequest<{ success: true; data: Event[] }>(`/api/v2/events?${query.toString()}`);
  return response.data;
}

export async function getEvent(id: string | undefined) {
  const response = await apiRequest<{ success: true; data: Event }>(`/api/v2/events/${id}`);
  return response.data;
}

export async function createEvent(payload: {
  name: string;
  region: string;
  sport: string;
  status: string;
  venue: string;
  location: {
    type?: "Point";
    coordinates: [number, number];
  };
  startAt: Date | string;
  endAt: Date | string;
}) {
  const response = await apiRequest<{ success: true; data: Event }>(`/api/v2/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateEvent(id: string | undefined, payload: unknown) {
  const response = await apiRequest<{ success: true; data: Event }>(`/api/v2/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteEvent(id: string | undefined) {
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/events/${id}`, {
    method: "DELETE",
  });
}

export async function addEventToCalendar(event: Event) {
    const response = await apiRequest<{ success: true; data: { tracked: boolean } }>(`/api/v2/events/${event._id}/calendar`, {
      method: "POST",
    });
    return response.data;
}

export async function hasEventInCalendar(eventId: string) {
  const response = await apiRequest<{ success: true; data: { tracked: boolean } }>(
    `/api/v2/events/${eventId}/calendar`,
  );
  return response.data.tracked;
}

export async function listCalendarEvents() {
  const response = await apiRequest<{ success: true; data: Event[] }>("/api/v2/events/calendar");
  return response.data;
}

export async function removeEventFromCalendar(eventId: string) {
  const response = await apiRequest<{ success: true; data: { removed: boolean } }>(
    `/api/v2/events/${eventId}/calendar`,
    { method: "DELETE" },
  );
  return response.data.removed;
}
