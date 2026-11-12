import { $ } from "./dom.js";

export function afficherOnglet(nom) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === nom));
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === nom));
}

export function activerOnglet(nom) {
  const btn = document.querySelector(`.tab[data-tab="${nom}"]`);
  const premier = !document.querySelector(".tab:not(.hidden)");
  btn.classList.remove("hidden");
  btn.onclick = () => afficherOnglet(nom);
  $("etat").classList.add("hidden");
  if (premier) afficherOnglet(nom);
}