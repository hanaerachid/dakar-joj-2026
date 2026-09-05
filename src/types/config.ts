// src/types/config.ts

export interface SiteConfig {
  name: string;
  file: string;
  color: string;
}
export interface CategoryConfig {
  id: string;
  label: string;
  sources?: SiteConfig[];
  hint?: string;
}
