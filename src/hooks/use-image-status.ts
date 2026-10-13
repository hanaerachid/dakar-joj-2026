import { useEffect, useState } from "react";

type ImageStatus = "loading" | "loaded" | "error";

export function useImageStatus(src?: string | null): ImageStatus {
  const [status, setStatus] = useState<ImageStatus>(
    src ? "loading" : "error",
  );

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    let active = true;
    const image = new Image();

    setStatus("loading");

    image.onload = () => {
      if (active) setStatus("loaded");
    };

    image.onerror = () => {
      if (active) setStatus("error");
    };

    image.src = src;

    // Handle images that are already cached.
    if (image.complete) {
      if (image.naturalWidth > 0) {
        setStatus("loaded");
      } else {
        setStatus("error");
      }
    }

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  return status;
}