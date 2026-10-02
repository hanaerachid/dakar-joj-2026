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

export async function presignResponse(file: File) {
  const body = JSON.stringify({
    filename: file.name,
    contentType: file.type,
  });
  const response = await apiRequest<{ success: true; data: { url: string; path: string } }>(
    "/api/v2/uploads/presign",
    {
      method: "POST",
      body: body,
    },
  );
  return response.data;
}

export async function uploadToR2(file: File) {
  const { url, path } = await presignResponse(file);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (error) {
    throw new Error(
      `Unable to upload ${file.name} to storage. Check the R2 bucket CORS policy.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Failed to upload ${file.name} to storage (${response.status})${
        details ? `: ${details}` : ""
      }`,
    );
  }

  return path;
}

export async function uploadFilesToR2(files: readonly File[]) {
  const paths: string[] = [];

  for (const file of files) {
    paths.push(await uploadToR2(file));
  }

  return paths;
}
