import type { Product, PortfolioItem } from "../types";

/**
 * Filters the product catalog by category and query keyword.
 */
export function filterProducts(
  products: readonly Product[],
  category: string,
  query: string,
): Product[] {
  const normalizedCat = category.trim().toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((p) => {
    const matchesCat = normalizedCat === "all" || p.category.toLowerCase() === normalizedCat;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.desc.toLowerCase().includes(normalizedQuery) ||
      p.badge.toLowerCase().includes(normalizedQuery);

    return matchesCat && matchesQuery;
  });
}

/**
 * Filters the portfolio projects by category.
 */
export function filterPortfolio(
  items: readonly PortfolioItem[],
  category: string,
): PortfolioItem[] {
  const normalizedCat = category.trim().toLowerCase();
  if (normalizedCat === "all") {
    return [...items];
  }
  return items.filter((item) => item.category.toLowerCase() === normalizedCat);
}
