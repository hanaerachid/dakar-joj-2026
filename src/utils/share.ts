import { toast } from "sonner";

export async function sharePlace({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const url = new URL("/explorer", window.location.origin);
  url.searchParams.set("place", id);

  const shareData: ShareData = {
    title,
    text: title,
    url: url.toString(),
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard?.writeText(url.toString());
    toast.success("Link copied to clipboard");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;

    console.error("Share failed:", error);
    try {
      await navigator.clipboard?.writeText(url.toString());
      toast.success("Link copied to clipboard");
    } catch {
      prompt("Copy this link:", url.toString());
    }
  }
}