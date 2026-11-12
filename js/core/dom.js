export const $ = (id) => document.getElementById(id);

export const esc = (t = "") =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function nettoyer(html = "") {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent.trim();
}

export const tronquer = (t, max = 140) => (t.length > max ? t.slice(0, max) + "…" : t);

export const urlSure = (u) => (/^https?:\/\//.test(u || "") ? u : "");