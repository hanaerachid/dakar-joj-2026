import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react"
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

type ApiNewsItem = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  status: string;
  pinned: boolean;
};

type NewsResponse = {
  success: boolean;
  data: ApiNewsItem[];
};

export const NewsContent = () => {
  const { t } = useTranslation();
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="overflow-hidden h-16 rounded-3xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>
          {error}
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-4">
        <ItemGroup className="gap-2" >
          {news.map((item, index) => (
            <Item key={index} size="sm" variant="muted">
              <ItemContent>
                <ItemDescription className="flex items-center gap-2">
                  <Badge className="text-xs uppercase">News</Badge>
                  <span>
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </ItemDescription>
                <ItemTitle>
                  {item.title}
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
