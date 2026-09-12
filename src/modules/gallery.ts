import { PORTFOLIO } from "../data/portfolio";
import { filterPortfolio } from "./catalog";
import type { PortfolioItem } from "../types";

export interface GalleryController {
  renderGallery: () => void;
  scrollGallery: (direction: number) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setFilter: (category: string) => void;
}

export function createGalleryController(): GalleryController {
  let currentFilter = "all";
  let currentItems: PortfolioItem[] = [...PORTFOLIO];
  let lightboxIndex = 0;
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  function updateGalleryProgress(): void {
    const track = document.querySelector<HTMLElement>("#gallery-track");
    const progress = document.querySelector<HTMLElement>("#gallery-progress");
    const counter = document.querySelector<HTMLElement>("#gallery-counter");
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 0;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.7;
    const index = Math.round(track.scrollLeft / step);

    if (progress) {
      progress.style.width = `${Math.max(8, ratio * 100)}%`;
    }
    if (counter) {
      const total = currentItems.length || 1;
      const current = Math.min(index + 1, total);
      counter.textContent = `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
  }

  function renderGallery(): void {
    currentItems = filterPortfolio(PORTFOLIO, currentFilter);
    const track = document.querySelector<HTMLElement>("#gallery-track");
    if (!track) return;

    track.innerHTML = currentItems
      .map(
        (item, index) => `
      <button type="button" class="g-card" data-open="${index}">
        <img src="${item.img}" alt="${item.title}" draggable="false" loading="lazy">
        <div class="g-meta">
          <p>${item.category}</p>
          <h3>${item.title}</h3>
          <p class="desc">${item.desc}</p>
        </div>
      </button>`,
      )
      .join("");

    track.scrollLeft = 0;
    updateGalleryProgress();
  }

  function scrollGallery(direction: number): void {
    const track = document.querySelector<HTMLElement>("#gallery-track");
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.7;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function openLightbox(index: number): void {
    if (hasDragged) return;
    lightboxIndex = index;
    const item = currentItems[index];
    if (!item) return;

    const lb = document.querySelector<HTMLElement>("#lightbox");
    const img = document.querySelector<HTMLImageElement>("#lb-img");
    const cat = document.querySelector<HTMLElement>("#lb-cat");
    const title = document.querySelector<HTMLElement>("#lb-title");
    const desc = document.querySelector<HTMLElement>("#lb-desc");

    if (img) {
      img.src = item.img;
      img.alt = item.title;
    }
    if (cat) {
      cat.textContent = `${item.category} · ${String(index + 1).padStart(2, "0")} / ${String(currentItems.length).padStart(2, "0")}`;
    }
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.desc;
    if (lb) lb.classList.add("is-open");
  }

  function closeLightbox(): void {
    const lb = document.querySelector<HTMLElement>("#lightbox");
    if (lb) lb.classList.remove("is-open");
  }

  function setFilter(category: string): void {
    currentFilter = category;
    renderGallery();
  }

  // Setup gallery track drag, wheel, touch
  const track = document.querySelector<HTMLElement>("#gallery-track");
  if (track) {
    track.addEventListener("scroll", updateGalleryProgress, { passive: true });
    track.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      },
      { passive: false },
    );

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) hasDragged = true;
      track.scrollLeft = dragStartScroll - dx;
    });

    const endDrag = (e: PointerEvent): void => {
      if (isDragging) {
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {
          // pointer capture release fallback
        }
      }
      isDragging = false;
      setTimeout(() => (hasDragged = false), 0);
    };

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    track.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const card = target.closest<HTMLElement>("[data-open]");
      if (card && card.dataset.open) {
        openLightbox(Number(card.dataset.open));
      }
    });
  }

  // Lightbox navigation buttons
  document.querySelector("#lb-close")?.addEventListener("click", closeLightbox);
  document.querySelector("#lightbox")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "lightbox") closeLightbox();
  });
  document.querySelector("#lb-prev")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox((lightboxIndex - 1 + currentItems.length) % currentItems.length);
  });
  document.querySelector("#lb-next")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox((lightboxIndex + 1) % currentItems.length);
  });

  window.addEventListener("keydown", (e) => {
    const lb = document.querySelector("#lightbox");
    if (!lb?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") openLightbox((lightboxIndex + 1) % currentItems.length);
    if (e.key === "ArrowLeft")
      openLightbox((lightboxIndex - 1 + currentItems.length) % currentItems.length);
  });

  return {
    renderGallery,
    scrollGallery,
    openLightbox,
    closeLightbox,
    setFilter,
  };
}
