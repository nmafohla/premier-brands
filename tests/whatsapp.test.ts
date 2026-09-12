import { describe, it, expect } from "vitest";
import {
  createWhatsAppUrl,
  formatContactMessage,
  formatEnquiryMessage,
  DEFAULT_WA_PRIMARY,
  DEFAULT_WA_SECONDARY,
} from "../src/modules/whatsapp";

describe("WhatsApp Utilities", () => {
  it("generates default WhatsApp URL when no text is passed", () => {
    const url = createWhatsAppUrl();
    expect(url).toBe(`https://wa.me/${DEFAULT_WA_PRIMARY}`);
  });

  it("cleans non-digits from the phone number", () => {
    const url = createWhatsAppUrl("Hello", "+263 (78) 197-7976");
    expect(url.startsWith(`https://wa.me/263781977976?text=`)).toBe(true);
  });

  it("correctly encodes message in URL", () => {
    const url = createWhatsAppUrl("Hello World & Co", DEFAULT_WA_SECONDARY);
    expect(url).toBe(`https://wa.me/${DEFAULT_WA_SECONDARY}?text=Hello%20World%20%26%20Co`);
  });

  it("formats contact form message with department and details", () => {
    const message = formatContactMessage({
      name: "Tariro Ndlovu",
      email: "tariro@example.com",
      department: "Orders & Quotes",
      message: "Please send quotation for 10 boxes of bond paper.",
    });

    expect(message).toContain("Hello Premier Brands — message for Orders & Quotes");
    expect(message).toContain("Name: Tariro Ndlovu");
    expect(message).toContain("Email: tariro@example.com");
    expect(message).toContain("Please send quotation for 10 boxes of bond paper.");
  });

  it("formats enquiry message with selected items list", () => {
    const message = formatEnquiryMessage({
      name: "Blessing Moyo",
      phone: "+263771234567",
      email: "blessing@example.com",
      selectedItemNames: ["Typek A4 Bond Paper (80gsm)", "Clear PVC Binding Covers (A4)"],
      requirements: "Need delivery to Bulawayo CBD by Thursday.",
    });

    expect(message).toContain("Hello Premier Brands, I would like to enquire.");
    expect(message).toContain("Name: Blessing Moyo");
    expect(message).toContain("Phone: +263771234567");
    expect(message).toContain("Email: blessing@example.com");
    expect(message).toContain("• Typek A4 Bond Paper (80gsm)");
    expect(message).toContain("• Clear PVC Binding Covers (A4)");
    expect(message).toContain("Requirements:\nNeed delivery to Bulawayo CBD by Thursday.");
  });

  it("handles empty items list gracefully in enquiry message", () => {
    const message = formatEnquiryMessage({
      name: "General Enquirer",
      phone: "0781977976",
      selectedItemNames: [],
      requirements: "Do you print wedding invitations?",
    });

    expect(message).toContain("Selected items:\nNo catalog items selected");
  });
});
