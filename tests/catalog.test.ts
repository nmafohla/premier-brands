import { describe, it, expect } from "vitest";
import { filterProducts, filterPortfolio } from "../src/modules/catalog";
import type { Product, PortfolioItem } from "../src/types";

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "A4 Bond Paper",
    category: "paper",
    badge: "Best Seller",
    desc: "Premium white copy paper",
    img: "/assets/stock/bond.jpg",
  },
  {
    id: "p2",
    name: "PVC Clear Covers",
    category: "binding",
    badge: "Popular",
    desc: "Rigid plastic transparent cover sheets",
    img: "/assets/stock/pvc.jpg",
  },
  {
    id: "p3",
    name: "Custom Screen Printed T-Shirts",
    category: "custom",
    badge: "Branding",
    desc: "100% cotton crewneck apparel printing",
    img: "/assets/stock/tees.jpg",
  },
];

const mockPortfolio: PortfolioItem[] = [
  {
    title: "Corporate Work Jackets",
    category: "apparel",
    desc: "Industrial safety jackets",
    img: "/assets/jacket.jpg",
  },
  {
    title: "Sublimated Coffee Mugs",
    category: "branding",
    desc: "Ceramic mugs with logo",
    img: "/assets/mug.jpg",
  },
  {
    title: "Annual Report Binding",
    category: "stationery",
    desc: "Spiral wire bound books",
    img: "/assets/report.jpg",
  },
];

describe("Catalog Filter Logic", () => {
  it("returns all products when category is 'all' and query is empty", () => {
    const result = filterProducts(mockProducts, "all", "");
    expect(result).toHaveLength(3);
  });

  it("filters products by exact category", () => {
    const paper = filterProducts(mockProducts, "paper", "");
    expect(paper).toHaveLength(1);
    expect(paper[0]?.id).toBe("p1");

    const binding = filterProducts(mockProducts, "binding", "");
    expect(binding).toHaveLength(1);
    expect(binding[0]?.id).toBe("p2");
  });

  it("filters products by search keyword across name, description, or badge", () => {
    const searchName = filterProducts(mockProducts, "all", "Bond");
    expect(searchName).toHaveLength(1);
    expect(searchName[0]?.id).toBe("p1");

    const searchDesc = filterProducts(mockProducts, "all", "transparent");
    expect(searchDesc).toHaveLength(1);
    expect(searchDesc[0]?.id).toBe("p2");

    const searchBadge = filterProducts(mockProducts, "all", "Branding");
    expect(searchBadge).toHaveLength(1);
    expect(searchBadge[0]?.id).toBe("p3");
  });

  it("returns empty array when search query matches nothing", () => {
    const result = filterProducts(mockProducts, "all", "nonexistent-item-xyz");
    expect(result).toHaveLength(0);
  });

  it("filters portfolio items accurately by category", () => {
    const all = filterPortfolio(mockPortfolio, "all");
    expect(all).toHaveLength(3);

    const apparel = filterPortfolio(mockPortfolio, "apparel");
    expect(apparel).toHaveLength(1);
    expect(apparel[0]?.title).toBe("Corporate Work Jackets");

    const branding = filterPortfolio(mockPortfolio, "branding");
    expect(branding).toHaveLength(1);
    expect(branding[0]?.title).toBe("Sublimated Coffee Mugs");
  });
});
