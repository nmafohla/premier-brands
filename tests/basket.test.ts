import { describe, it, expect, beforeEach } from "vitest";
import { EnquiryBasket } from "../src/modules/basket";
import type { Product } from "../src/types";

const item1: Product = {
  id: "prod-1",
  name: "Typek Bond Paper",
  category: "paper",
  badge: "Best Seller",
  desc: "80gsm paper",
  img: "/assets/stock/bond-paper.jpg",
};

const item2: Product = {
  id: "prod-2",
  name: "Clear PVC Binding Covers",
  category: "binding",
  badge: "Popular",
  desc: "Clear A4 covers",
  img: "/assets/stock/pvc-covers.jpg",
};

describe("EnquiryBasket", () => {
  let basket: EnquiryBasket;

  beforeEach(() => {
    basket = new EnquiryBasket();
  });

  it("starts empty with count 0", () => {
    expect(basket.getCount()).toBe(0);
    expect(basket.getItems()).toHaveLength(0);
  });

  it("adds items successfully and prevents duplicates", () => {
    const added1 = basket.addItem(item1);
    expect(added1).toBe(true);
    expect(basket.getCount()).toBe(1);
    expect(basket.hasItem("prod-1")).toBe(true);

    const addedDuplicate = basket.addItem(item1);
    expect(addedDuplicate).toBe(false);
    expect(basket.getCount()).toBe(1);

    const added2 = basket.addItem(item2);
    expect(added2).toBe(true);
    expect(basket.getCount()).toBe(2);
  });

  it("removes items by ID accurately", () => {
    basket.addItem(item1);
    basket.addItem(item2);

    const removed = basket.removeItem("prod-1");
    expect(removed).toBe(true);
    expect(basket.getCount()).toBe(1);
    expect(basket.hasItem("prod-1")).toBe(false);
    expect(basket.hasItem("prod-2")).toBe(true);

    const removeNonExistent = basket.removeItem("prod-unknown");
    expect(removeNonExistent).toBe(false);
    expect(basket.getCount()).toBe(1);
  });

  it("clears all items cleanly", () => {
    basket.addItem(item1);
    basket.addItem(item2);
    expect(basket.getCount()).toBe(2);

    basket.clear();
    expect(basket.getCount()).toBe(0);
    expect(basket.getItems()).toEqual([]);
  });
});
