export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function getMediaUrl(value: string) {
  // Existing data URI
  if (value.startsWith("data:")) {
    return value;
  }

  // Existing absolute URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // New R2 object path
  return `${import.meta.env.VITE_STORAGE_URL_BASE}/${value}`;
}
