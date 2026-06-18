"use client";

import { useState } from "react";
import type { SerpResponse } from "@/lib/serp";

const COUNTRIES = [
  { code: "us", label: "🇺🇸 United States" },
  { code: "gb", label: "🇬🇧 United Kingdom" },
  { code: "ca", label: "🇨🇦 Canada" },
  { code: "au", label: "🇦🇺 Australia" },
  { code: "in", label: "🇮🇳 India" },
  { code: "de", label: "🇩🇪 Germany" },
  { code: "fr", label: "🇫🇷 France" },
  { code: "ae", label: "🇦🇪 UAE" },
];

/** Wrap occurrences of `term` in <mark> for visual highlighting. */
function highlight(text: string, term: string) {
  if (!term) return text;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(term, i);
    if (idx === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(<mark key={key++}>{text.slice(idx, idx + term.length)}</mark>);
    i = idx + term.length;
  }
  return parts;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("us");
  const [device, setDevice] = useState("desktop");
  const [location, setLocation] = useState("");

  const [data, setData] = useState<SerpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlFilter, setUrlFilter] = useState("");

  async function lookup() {
    const q = keyword.trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setData(null);
    setUrlFilter("");

    const params = new URLSearchParams({ q, gl: country, device });
    if (location.trim()) params.set("location", location.trim());

    try {
      const res = await fetch(`/api/serp?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
      } else {
        setData(json as SerpResponse);
      }
    } catch {
      setError("Network error. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>SERP Checker</h1>
      <p className="subtitle">
        See where pages rank on Google for any keyword.
      </p>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Enter a keyword, e.g. take my online class"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
        />
        <button className="search-btn" onClick={lookup} disabled={loading}>
          {loading ? "Checking…" : "Look Up"}
        </button>
      </div>

      <div className="filters">
        <select
          className="filter"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label="Country"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          className="filter"
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          aria-label="Device"
        >
          <option value="desktop">🖥️ Desktop</option>
          <option value="mobile">📱 Mobile</option>
        </select>

        <input
          className="filter filter-location"
          placeholder="📍 Location (optional), e.g. New York"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <p className="meta">
            Results for <strong>&ldquo;{data.keyword}&rdquo;</strong>{" "}
            {data.source === "mock" ? (
              <span className="badge badge-mock">demo data</span>
            ) : (
              <span className="badge badge-live">live from Google</span>
            )}
          </p>

          {(() => {
            const term = urlFilter.trim().toLowerCase();
            const shown = term
              ? data.results.filter(
                  (r) =>
                    r.url.toLowerCase().includes(term) ||
                    r.title.toLowerCase().includes(term)
                )
              : data.results;

            return (
              <div className="results">
                <div className="results-toolbar">
                  <input
                    className="url-search"
                    placeholder="🔍 Search for URL"
                    value={urlFilter}
                    onChange={(e) => setUrlFilter(e.target.value)}
                  />
                  {term && (
                    <span className="match-count">
                      {shown.length} of {data.results.length}
                    </span>
                  )}
                </div>

                {shown.length === 0 ? (
                  <p className="no-match">No results match “{urlFilter}”.</p>
                ) : (
                  shown.map((r) => (
                    <div className="result-row" key={r.position}>
                      <span className="position">{r.position}</span>
                      <div>
                        <a
                          className="result-title"
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {highlight(r.title, term)}
                        </a>
                        <div className="result-url">
                          {highlight(r.displayUrl, term)}
                        </div>
                        {r.snippet && (
                          <p className="result-snippet">{r.snippet}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })()}
        </>
      )}
    </main>
  );
}
