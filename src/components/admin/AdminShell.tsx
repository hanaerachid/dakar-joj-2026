import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { ArrowLeft, ChevronDown, Home, Menu } from "lucide-react";

import { HeaderBar } from "@/components/header/HeaderBar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type AdminNavigationItem = {
  link: string;
  label: string;
};

type AdminNavigationProps = {
  items: AdminNavigationItem[];
};

export function AdminShell() {
  const { t } = useTranslation();

  const NAVIGATION_ITEMS: AdminNavigationItem[] = [
    {
      link: "/admin/subscriptions",
      label: t("admin.subscriptions", "Subscriptions"),
    },
    {
      link: "/admin/listings",
      label: t("business_listings", "Business Listings"),
    },
    {
      link: "/admin/torch",
      label: t("torch_stops", "Torch Stops"),
    },
    {
      link: "/admin/events",
      label: t("events.events", "Events"),
    },
    {
      link: "/admin/places",
      label: t("places", "Places"),
    },
  ]

  return (
    <>
      <HeaderBar
        showLogo={true}
        backButton={
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  // className={navigationMenuTriggerStyle()}
                  render={<Link
                    to="/"
                    className="inline-flex items-center gap-2 py-2"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only">{t("back_to_map", "Back to Map")}</span>
                  </Link>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        }
        title={t("admin_panel", "Admin Panel")}
      >
        <Navigation
          items={NAVIGATION_ITEMS}
        />
      </HeaderBar>
      <div className="pt-12">
        <Outlet />
      </div>
    </>
  );
}

export const Navigation = ({ items }: AdminNavigationProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">{t("navigation", "Navigation")}</span>
              {/* <ChevronDown className="h-4 w-4" /> */}
            </Button>
          } />
        <DropdownMenuContent align="start" className="w-56">
          {items.map(({ link, label }) => (
            <DropdownMenuItem
              key={link}
              render={
                <Link to={link} className="w-full cursor-pointer">
                  {label}
                </Link>
              } />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList
        className={cn(
          // "flex",
          // isMobile ? "flex-col items-stretch gap-1" : "flex-row items-center gap-2"
        )}
      >
        {items.map(({ link, label }) => (
          <NavigationMenuItem key={link} /*className={isMobile ? "w-full" : ""}*/>
            <NavigationMenuLink
              // className={navigationMenuTriggerStyle()}
              render={<Link
                to={link}
                className="inline-flex items-center gap-2 py-2"
              />}
            >
              {label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}