import type { CategoryId } from "@/lib/categories";

export type Video = {
  id: string;
  title: string;
  category: CategoryId;
  blobUrl: string;
  blobPathname: string;
  sortOrder: number;
  isHero: boolean;
};

export type ActionResult = {
  error: string;
};
