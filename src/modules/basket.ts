import type { Product } from "../types";

export class EnquiryBasket {
  private items: Product[] = [];

  public addItem(product: Product): boolean {
    if (this.hasItem(product.id)) {
      return false;
    }
    this.items.push(product);
    return true;
  }

  public removeItem(productId: string): boolean {
    const index = this.items.findIndex((item) => item.id === productId);
    if (index >= 0) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  public hasItem(productId: string): boolean {
    return this.items.some((item) => item.id === productId);
  }

  public getItems(): readonly Product[] {
    return [...this.items];
  }

  public getCount(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }
}
