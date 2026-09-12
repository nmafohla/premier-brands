export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: "paper" | "binding" | "custom" | string;
  readonly badge: string;
  readonly desc: string;
  readonly img: string;
}

export interface PortfolioItem {
  readonly title: string;
  readonly category: "apparel" | "branding" | "stationery" | string;
  readonly desc: string;
  readonly img: string;
}

export interface ContactPayload {
  readonly name: string;
  readonly email: string;
  readonly department: string;
  readonly message: string;
}

export interface EnquiryPayload {
  readonly name: string;
  readonly phone: string;
  readonly email?: string;
  readonly selectedItemNames: readonly string[];
  readonly requirements: string;
}
