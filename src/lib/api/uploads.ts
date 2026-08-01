import { apiRequest } from "../apiClient";

export async function uploadImage(file: File, folder: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const response = await apiRequest<{ success: true; data: { url: string; path: string } }>(
    "/api/v1/uploads/image",
    {
      method: "POST",
      body: form,
    },
  );
  return response.data;
}
