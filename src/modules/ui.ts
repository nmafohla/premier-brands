import { PRODUCTS } from "../data/products";
import { filterProducts } from "./catalog";
import { EnquiryBasket } from "./basket";
import { createGalleryController } from "./gallery";
import { setupForms } from "./forms";
import { createWhatsAppUrl } from "./whatsapp";

export function setupUI(): void {
  const basket = new EnquiryBasket();
  let catalogQuery = "";
  let catalogCat = "all";

  const gallery = createGalleryController();

  function renderProducts(): void {
    const grid = document.querySelector<HTMLElement>("#products-grid");
    if (!grid) return;

    const items = filterProducts(PRODUCTS, catalogCat, catalogQuery);
    if (items.length === 0) {
      grid.innerHTML =
        '<p class="empty">No products match your search. Try another keyword or filter.</p>';
      return;
    }

    grid.innerHTML = items
      .map(
        (p) => `
      <article class="product">
        <div class="product-img">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <span class="badge">${p.badge}</span>
        </div>
        <div class="product-body">
          <p class="product-cat">${p.category}</p>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-foot">
            <span class="gold">Quote Req.</span>
            <button class="btn btn-gold btn-sm" data-add="${p.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add to Enquiry
            </button>
          </div>
        </div>
      </article>`,
      )
      .join("");
  }

  function updateBasketUI(): void {
    const fab = document.querySelector<HTMLElement>("#enq-fab");
    const count = document.querySelector<HTMLElement>("#enq-count");
    const itemsContainer = document.querySelector<HTMLElement>("#enq-items");
    const items = basket.getItems();

    if (fab) fab.classList.toggle("is-on", items.length > 0);
    if (count) count.textContent = String(items.length);

    if (itemsContainer) {
      if (items.length === 0) {
        itemsContainer.innerHTML =
          '<p class="muted" style="font-size:0.875rem">No items selected — you can still send a general enquiry below.</p>';
      } else {
        itemsContainer.innerHTML = `<div class="tags">${items
          .map(
            (p) =>
              `<span class="tag">${p.name}<button type="button" data-remove="${p.id}" aria-label="Remove ${p.name}">×</button></span>`,
          )
          .join("")}</div>`;
      }
    }
  }

  function addToBasket(productId: string): void {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    basket.addItem(product);
    updateBasketUI();

    const modal = document.querySelector<HTMLElement>("#enquiry-modal");
    if (modal) modal.classList.add("is-open");
  }

  // Initial renders
  renderProducts();
  gallery.renderGallery();
  updateBasketUI();
  setupForms(basket, updateBasketUI);

  // Set default WhatsApp link hrefs
  document.querySelectorAll<HTMLAnchorElement>(".wa-link").forEach((link) => {
    const currentHref = link.getAttribute("href");
    if (!currentHref || currentHref === "#" || currentHref.trim() === "") {
      link.href = createWhatsAppUrl(
        "Hello Premier Brands, I would like to enquire about your services.",
      );
    }
  });

  // Search & Catalog Filter
  const heroSearch = document.querySelector<HTMLFormElement>("#hero-search");
  const heroQ = document.querySelector<HTMLInputElement>("#hero-q");
  const catalogQ = document.querySelector<HTMLInputElement>("#catalog-q");

  heroSearch?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (heroQ) {
      catalogQuery = heroQ.value;
      if (catalogQ) catalogQ.value = catalogQuery;
      renderProducts();
      document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
    }
  });

  catalogQ?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    catalogQuery = target.value;
    renderProducts();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      catalogCat = btn.dataset.cat ?? "all";
      document
        .querySelectorAll("[data-cat]")
        .forEach((b) => b.classList.toggle("is-on", b === btn));
      renderProducts();
    });
  });

  document.querySelector<HTMLElement>("#products-grid")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>("[data-add]");
    if (btn?.dataset.add) {
      addToBasket(btn.dataset.add);
    }
  });

  // Gallery Filter Buttons & Arrow controls
  document.querySelectorAll<HTMLButtonElement>("[data-gfilter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.gfilter ?? "all";
      document
        .querySelectorAll("[data-gfilter]")
        .forEach((b) => b.classList.toggle("is-on", b === btn));
      gallery.setFilter(cat);
    });
  });

  document.querySelector("#g-prev")?.addEventListener("click", () => gallery.scrollGallery(-1));
  document.querySelector("#g-next")?.addEventListener("click", () => gallery.scrollGallery(1));

  // Header & FAB Scroll Listener
  const waFab = document.querySelector<HTMLElement>("#wa-fab");
  const header = document.querySelector<HTMLElement>(".site-header");
  const sections = ["home", "about", "services", "products", "portfolio", "faq", "contact"];

  const handleScroll = (): void => {
    if (waFab) waFab.classList.toggle("is-on", window.scrollY > 280);
    if (header) header.classList.toggle("scrolled", window.scrollY > 16);

    let currentSection = "home";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) {
        currentSection = id;
      }
    }

    document.querySelectorAll(".nav a, .drawer-nav a").forEach((a) => {
      a.classList.toggle("is-on", a.getAttribute("href") === `#${currentSection}`);
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}
