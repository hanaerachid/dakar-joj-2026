import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { AlertCircle } from "lucide-react"
import { getDomain } from "tldts";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

type Metadata = {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
};

type ApiNewsItem = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  status: string;
  url: string;
  pinned: boolean;
} & {
  metadata?: Metadata | null;
};

type NewsResponse = {
  success: boolean;
  data: ApiNewsItem[];
};

export const NewsContent = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [news, setNews] = useState<ApiNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/v2/news?status=published&limit=20"
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }

        const result: NewsResponse = await response.json();

        if (!result.success) {
          throw new Error("Failed to fetch news");
        }

        setNews(result.data);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Unable to load news.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <p className="text-xs text-[#f2b705] uppercase">
          {t("news.thegamesjournal", "The Games journal")}
        </p>

        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("news.news", "News")}
        </h2>

        <p className="text-sm text-muted-foreground">
          {t("news.latest", "Latest from the official YOG site and online press.")}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-9/16 overflow-hidden rounded-3xl"
            />
          ))}
        </div>
      )}

      {error && (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
      )}

      {!loading && !error && (
      <div className="flex flex-col gap-4">
        <ItemGroup className="grid grid-cols-2 gap-2" >
          {news.map((item, index) => (
            <Item
              key={index}
              size="sm"
              variant="outline"
              className={cn(
                "group relative aspect-9/16 overflow-hidden",
              )}
            >
              <Badge
                className="absolute start-2 top-2 z-20"
                variant="secondary"
              >
                <span className="text-xs">
                  {new Date(item.publishedAt).toLocaleDateString(lang, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Badge>
              <ItemMedia variant="default" className="h-full absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110"
                style={{
                  backgroundImage: item.metadata?.image ? `url(${item.metadata.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <ItemContent className="flex-col justify-end absolute h-1/2 bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2">
                <ItemTitle
                  title={item.metadata?.title || item.title}
                  className={cn(
                    "text-sm leading-tight",
                    "line-clamp-3",
                    "group-hover:underline",
                  )}
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.metadata?.title || item.title}
                  </a>
                </ItemTitle>
                <ItemDescription className="flex items-center justify-start gap-1">
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {getDomain(item.metadata?.url || item.url)}
                  </span>
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
      )}
    </div>
  );
}
