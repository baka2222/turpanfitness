import type {
  Advantage,
  ClubCard,
  LeadCreate,
  NewsDetail,
  NewsListItem,
  PaginatedNews,
  Review,
  ScheduleSession,
  SiteSettings,
  SocialMedia,
  Trainer,
  TrainerDetail,
  Zone,
  ZoneDetail,
} from "@/types";

// Replace absolute media URLs (http://...:8000/media/) with relative /media/
// so images load correctly from any device (phone, tablet) via Next.js proxy.
function rewriteMediaUrls<T>(data: T): T {
  const json = JSON.stringify(data).replace(/http:\/\/[^"]+:8000\/media\//g, "/media/");
  return JSON.parse(json);
}

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side (SSR/RSC): always reach backend directly via loopback
    return process.env.API_URL ?? "http://127.0.0.1:8000";
  }
  // Client-side (browser): default to the SAME origin the page was served from,
  // so requests go through nginx (and Cloudflare) to /api on whatever domain is
  // in front. Override with NEXT_PUBLIC_API_URL only for split-origin setups.
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
}

async function get<T>(path: string, lang = "ru", params?: Record<string, string>): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}/api${path}`);
  url.searchParams.set("lang", lang);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  let res;
  try {
    res = await fetch(url.toString(), { next: { revalidate: 60 } });
  } catch (e: any) {
    throw new Error(`Network error fetching ${url.toString()}: ${e?.message ?? e}`);
  }
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return rewriteMediaUrls(await res.json());
}

export const api = {
  settings: (lang?: string) => get<SiteSettings>("/settings", lang),
  socialMedia: (lang?: string) => get<SocialMedia[]>("/social-media", lang),
  advantages: (lang?: string) => get<Advantage[]>("/advantages", lang),
  reviews: (lang?: string) => get<Review[]>("/reviews", lang),

  zones: (lang?: string) => get<Zone[]>("/zones/", lang),
  zone: (id: number, lang?: string) => get<ZoneDetail>(`/zones/${id}`, lang),

  trainers: (lang?: string, params?: Record<string, string>) =>
    get<Trainer[]>("/trainers/", lang, params),
  trainer: (id: number, lang?: string) => get<TrainerDetail>(`/trainers/${id}`, lang),
  specializations: (lang?: string) => get<{ id: number; name: string; icon: string; order: number }[]>("/trainers/specializations", lang),

  schedule: (lang?: string, params?: Record<string, string>) =>
    get<ScheduleSession[]>("/schedule", lang, params),

  cards: (lang?: string) => get<ClubCard[]>("/club-cards/", lang),

  news: (lang?: string, page = 1, pageSize = 9) =>
    get<PaginatedNews>("/news/", lang, { page: String(page), page_size: String(pageSize) }),
  newsItem: (slug: string, lang?: string) => get<NewsDetail>(`/news/${slug}`, lang),

  submitLead: async (data: LeadCreate) => {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/leads/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Ошибка отправки");
    return res.json();
  },
};

export type { NewsListItem };
