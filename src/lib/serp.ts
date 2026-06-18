export type Device = "desktop" | "mobile";

export type SerpQuery = {
  keyword: string;
  /** Two-letter country code, e.g. "us", "gb", "ca". */
  gl?: string;
  /** Interface language, e.g. "en". */
  hl?: string;
  /** Free-text location, e.g. "New York, United States". Optional. */
  location?: string;
  device?: Device;
};

export type SerpResult = {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  snippet?: string;
};

export type SerpResponse = {
  keyword: string;
  results: SerpResult[];
  source: "serper" | "mock";
};

function toDisplayUrl(href: string): string {
  try {
    const u = new URL(href);
    const path = u.pathname === "/" ? "" : u.pathname;
    return u.hostname.replace(/^www\./, "") + path;
  } catch {
    return href;
  }
}

/**
 * Live results via Serper.dev (https://serper.dev).
 *
 * Requires SERPER_API_KEY in the environment. Serper natively supports country
 * (gl), language (hl) and free-text location targeting. There is no "device"
 * field on Serper; we keep the desktop/mobile choice in the UI because it's a
 * meaningful ranking dimension, and shape the request for it here (mobile maps
 * to a mobile-leaning query). Swap providers by replacing only this function.
 */
type SerperOrganic = {
  title?: string;
  link?: string;
  position?: number;
  snippet?: string;
};

/** Fetch a single Serper page (10 results). Returns null on any failure. */
async function fetchSerperPage(
  q: SerpQuery,
  apiKey: string,
  page: number
): Promise<SerperOrganic[] | null> {
  const body: Record<string, unknown> = {
    q: q.keyword,
    gl: q.gl || "us",
    hl: q.hl || "en",
    page,
  };
  if (q.location) body.location = q.location;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { organic?: SerperOrganic[] };
    return json.organic ?? [];
  } catch {
    return null;
  }
}

async function fetchFromSerper(q: SerpQuery): Promise<SerpResult[] | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  // Serper returns 10 organic results per page. Fetch pages 1 and 2 in
  // parallel to assemble 20, then de-duplicate and re-number sequentially.
  const [p1, p2] = await Promise.all([
    fetchSerperPage(q, apiKey, 1),
    fetchSerperPage(q, apiKey, 2),
  ]);

  if (p1 === null) return null; // page 1 must succeed; page 2 is best-effort
  const organic = [...p1, ...(p2 ?? [])];
  if (organic.length === 0) return null;

  const seen = new Set<string>();
  const results: SerpResult[] = [];
  for (const o of organic) {
    if (!o.title || !o.link || seen.has(o.link)) continue;
    seen.add(o.link);
    results.push({
      position: results.length + 1,
      title: o.title.trim(),
      url: o.link,
      displayUrl: toDisplayUrl(o.link),
      snippet: o.snippet,
    });
    if (results.length >= 20) break;
  }

  return results;
}

/**
 * Mock results — used when no API key is set or the provider errors, so the
 * app always runs out-of-the-box during development.
 */
function mockResults(q: SerpQuery): SerpResult[] {
  const hosts = [
    "edubirdie.com",
    "allassignmenthelp.com",
    "reddit.com",
    "takemyclassonline.net",
    "eazyresearch.com",
    "boostmygrade.com",
    "scholarlyhelp.com",
    "acemycourse.net",
    "example.com",
    "wikipedia.org",
    "onlineclasshelp.com",
    "domyclass.com",
    "tutorbin.com",
    "studypool.com",
    "chegg.com",
    "coursehero.com",
    "quizlet.com",
    "transtutors.com",
    "24houranswers.com",
    "domyonlinecourse.com",
  ];
  const tag = [q.device, q.gl, q.location].filter(Boolean).join(" · ");
  return hosts.map((host, i) => ({
    position: i + 1,
    title: `${q.keyword} — result ${i + 1} on ${host}`,
    url: `https://${host}/`,
    displayUrl: host,
    snippet: tag ? `Demo result (${tag})` : "Demo result",
  }));
}

export async function fetchSerp(q: SerpQuery): Promise<SerpResponse> {
  const live = await fetchFromSerper(q);
  if (live && live.length > 0) {
    return { keyword: q.keyword, results: live, source: "serper" };
  }
  return { keyword: q.keyword, results: mockResults(q), source: "mock" };
}
