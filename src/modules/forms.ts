import { EnquiryBasket } from "./basket";
import {
  createWhatsAppUrl,
  formatContactMessage,
  formatEnquiryMessage,
  DEFAULT_WA_PRIMARY,
} from "./whatsapp";

export function setupForms(basket: EnquiryBasket, updateBasketUI: () => void): void {
  // Mobile drawer controls
  const menuBtn = document.querySelector<HTMLElement>("#menu-btn");
  const drawer = document.querySelector<HTMLElement>("#drawer");
  const drawerClose = document.querySelector<HTMLElement>("#drawer-close");
  const drawerBack = document.querySelector<HTMLElement>("#drawer-back");

  menuBtn?.addEventListener("click", () => drawer?.classList.add("is-open"));
  drawerClose?.addEventListener("click", () => drawer?.classList.remove("is-open"));
  drawerBack?.addEventListener("click", () => drawer?.classList.remove("is-open"));
  document.querySelectorAll<HTMLElement>("#drawer a").forEach((a) => {
    a.addEventListener("click", () => drawer?.classList.remove("is-open"));
  });

  // Storefront photos scroll
  const storeStrip = document.querySelector<HTMLElement>("#store-strip");
  document.querySelector("#store-prev")?.addEventListener("click", () => {
    if (storeStrip)
      storeStrip.scrollBy({ left: -storeStrip.clientWidth * 0.85, behavior: "smooth" });
  });
  document.querySelector("#store-next")?.addEventListener("click", () => {
    if (storeStrip)
      storeStrip.scrollBy({ left: storeStrip.clientWidth * 0.85, behavior: "smooth" });
  });

  // Reviews Dots
  const setReview = (index: number): void => {
    const dots = document.querySelectorAll<HTMLElement>(".dot");
    const slides = document.querySelectorAll<HTMLElement>(".review-slide");

    dots.forEach((d, n) => d.classList.toggle("is-on", n === index));
    slides.forEach((s, n) => (s.hidden = n !== index));
  };

  document.querySelectorAll<HTMLElement>(".dot").forEach((d) => {
    d.addEventListener("click", () => {
      if (d.dataset.i) setReview(Number(d.dataset.i));
    });
  });

  // FAQ Accordion
  document.querySelectorAll<HTMLButtonElement>(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      if (!item) return;
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach((n) => n.classList.remove("is-open"));
      if (!isOpen) item.classList.add("is-open");
    });
  });

  // Contact Form
  const contactForm = document.querySelector<HTMLFormElement>("#contact-form");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.querySelector("#c-name") as HTMLInputElement)?.value || "";
    const email = (document.querySelector("#c-email") as HTMLInputElement)?.value || "";
    const dept = (document.querySelector("#c-dept") as HTMLSelectElement)?.value || "";
    const message = (document.querySelector("#c-msg") as HTMLTextAreaElement)?.value || "";

    const msg = formatContactMessage({ name, email, department: dept, message });
    window.open(createWhatsAppUrl(msg, DEFAULT_WA_PRIMARY), "_blank", "noopener,noreferrer");
  });

  // Enquiry Modal & Form
  const enqModal = document.querySelector<HTMLElement>("#enquiry-modal");
  document
    .querySelector("#enq-fab")
    ?.addEventListener("click", () => enqModal?.classList.add("is-open"));
  document
    .querySelector("#enq-close")
    ?.addEventListener("click", () => enqModal?.classList.remove("is-open"));
  enqModal?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "enquiry-modal") enqModal?.classList.remove("is-open");
  });

  document.querySelector("#enq-items")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>("[data-remove]");
    if (btn?.dataset.remove) {
      basket.removeItem(btn.dataset.remove);
      updateBasketUI();
    }
  });

  const enqForm = document.querySelector<HTMLFormElement>("#enq-form");
  enqForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.querySelector("#e-name") as HTMLInputElement)?.value || "";
    const phone = (document.querySelector("#e-phone") as HTMLInputElement)?.value || "";
    const email = (document.querySelector("#e-email") as HTMLInputElement)?.value || "";
    const requirements = (document.querySelector("#e-msg") as HTMLTextAreaElement)?.value || "";

    const selectedItemNames = basket.getItems().map((item) => item.name);
    const msg = formatEnquiryMessage({ name, phone, email, selectedItemNames, requirements });
    window.open(createWhatsAppUrl(msg, DEFAULT_WA_PRIMARY), "_blank", "noopener,noreferrer");
  });
}
