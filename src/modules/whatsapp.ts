import type { ContactPayload, EnquiryPayload } from "../types";

export const DEFAULT_WA_PRIMARY = "263781977976";
export const DEFAULT_WA_SECONDARY = "263783480821";

/**
 * Builds a direct wa.me link with URL-encoded message payload.
 */
export function createWhatsAppUrl(text?: string, phone: string = DEFAULT_WA_PRIMARY): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!text || text.trim().length === 0) {
    return `https://wa.me/${cleanPhone}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text.trim())}`;
}

/**
 * Formats structured user input from the contact form into a WhatsApp message.
 */
export function formatContactMessage(payload: ContactPayload): string {
  const name = payload.name.trim() || "Valued Customer";
  const email = payload.email.trim() || "Not provided";
  const dept = payload.department.trim();
  const message = payload.message.trim();

  return [
    `Hello Premier Brands — message for ${dept}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");
}

/**
 * Formats selected enquiry basket items and client requirements into a WhatsApp message.
 */
export function formatEnquiryMessage(payload: EnquiryPayload): string {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const email = payload.email && payload.email.trim() ? payload.email.trim() : "—";
  const items =
    payload.selectedItemNames.length > 0
      ? payload.selectedItemNames.map((item) => `• ${item}`).join("\n")
      : "No catalog items selected";

  return [
    "Hello Premier Brands, I would like to enquire.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    "",
    "Selected items:",
    items,
    "",
    "Requirements:",
    payload.requirements.trim(),
  ].join("\n");
}
