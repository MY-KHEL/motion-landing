export const CATEGORIES = [
  { id: "social", label: "Social" },
  { id: "product", label: "Product" },
  { id: "explainers", label: "Explainers" },
  { id: "logos", label: "Logos" },
  { id: "launch", label: "Launch ads" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function isCategory(value: string): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
