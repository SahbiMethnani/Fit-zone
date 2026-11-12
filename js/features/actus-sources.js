import { getJSON } from "../core/http.js";
import { nettoyer } from "../core/dom.js";

const reddit = (sub) => async () => {
  const d = await getJSON(`https://www.reddit.com/r/${sub}/hot.json?limit=15`);
  return d.data.children
    .map((c) => c.data)
    .filter((p) => !p.stickied)
    .map((p) => ({
      titre: p.title,
      resume: p.selftext || "",
      image: /^https?:/.test(p.thumbnail) ? p.thumbnail : "",
      lien: "https://www.reddit.com" + p.permalink,
      date: p.created_utc * 1000,
      extra: `👍 ${p.ups} · 💬 ${p.num_comments}`,
    }));
};

const rss = (feed) => async () => {
  const d = await getJSON("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed));
  if (d.status !== "ok") throw new Error("rss");
  return d.items.map((i) => ({
    titre: i.title,
    resume: nettoyer(i.description || ""),
    image: i.thumbnail || (i.enclosure && i.enclosure.link) || "",
    lien: i.link,
    date: Date.parse(i.pubDate) || 0,
    extra: "",
  }));
};

const devto = (tag) => async () => {
  const d = await getJSON(`https://dev.to/api/articles?tag=${tag}&per_page=12`);
  return d.map((a) => ({
    titre: a.title,
    resume: a.description || "",
    image: a.cover_image || a.social_image || "",
    lien: a.url,
    date: Date.parse(a.published_at) || 0,
    extra: `❤️ ${a.positive_reactions_count}`,
  }));
};

export const SOURCES = {
  muscu: [
    { nom: "Reddit r/bodybuilding", get: reddit("bodybuilding") },
    { nom: "Muscle & Fitness", get: rss("https://www.muscleandfitness.com/feed/") },
    { nom: "Generation Iron", get: rss("https://generationiron.com/feed/") },
    { nom: "DEV.to #fitness", get: devto("fitness") },
  ],
  mma: [
    { nom: "Reddit r/MMA", get: reddit("MMA") },
    { nom: "Reddit r/UFC", get: reddit("UFC") },
    { nom: "MMA Fighting", get: rss("https://www.mmafighting.com/rss/current") },
    { nom: "MMA Junkie", get: rss("https://mmajunkie.usatoday.com/feed") },
  ],
};