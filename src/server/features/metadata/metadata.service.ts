import urlMetadata from "url-metadata";

export type UrlMetadata = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
};

export async function fetchUrlMetadata(
  url: string,
): Promise<UrlMetadata> {
  const metadata = await urlMetadata(url);

  return {
    url,
    title: metadata["og:title"] ?? metadata.title ?? null,
    description:
      metadata["og:description"] ?? metadata.description ?? null,
    image: metadata["og:image"] ?? null,
  };
}
