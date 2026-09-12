import "./styles/main.css";
import { setupUI } from "./modules/ui";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupUI();
  });
} else {
  setupUI();
}
