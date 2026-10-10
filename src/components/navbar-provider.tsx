import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";

import { BottomNavigation } from "@/components/BottomBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

type NavbarProviderProps = {
  children: ReactNode;
};

type NavbarContent = Pick<
  ComponentProps<typeof BottomNavigation>,
  "items" | "activeKey"
> & {
  title?: string;
  children?: ReactNode;
};

type NavbarContextState = {
  navbarContent: NavbarContent;
  setNavbarContent: (content: NavbarContent) => void;
};

const defaultNavbarContent: NavbarContent = {
  items: [],
  activeKey: "",
  children: null,
};

export const NavbarContext = createContext<
  NavbarContextState | undefined
>(undefined);

export function NavbarProvider({
  children,
}: NavbarProviderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [navbarContent, setNavbarContent] =
    useState<NavbarContent>(defaultNavbarContent);

  const value: NavbarContextState = {
    navbarContent,
    setNavbarContent,
  };

  return (
    <NavbarContext.Provider value={value}>
      <BottomNavigation
        t={t}
        isMobile={isMobile}
        items={navbarContent.items}
        activeKey={navbarContent.activeKey}
      />

      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbarContext() {
  const context = useContext(NavbarContext);

  if (context === undefined) {
    throw new Error(
      "useNavbarContext must be used within a NavbarProvider"
    );
  }

  return context;
}