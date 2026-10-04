"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "../components/Logo";

const topics = [
  "Getting started with ShareWise",
  "How to write a great article",
  "Understanding shared knowledge",
  "Top 10 productivity tips",
  "Beginner's guide to investing",
  "Remote work best practices",
  "Learning web development",
  "Healthy habits for developers",
  "Introduction to open source",
  "Mastering time management",
  "Design principles that matter",
  "Public speaking made simple",
  "Building a personal brand",
  "Research methods explained",
  "The future of online learning",
];

// Index in `topics` -> image shown under the article title.
const topicImages: Record<number, string> = {
  0: "/articles/getting-started.svg",
  1: "/articles/writing.svg",
  3: "/articles/productivity.svg",
  6: "/articles/web-development.svg",
  10: "/articles/design.svg",
};

type Message = { from: "me" | "bot"; text: string; files?: string[] };

export default function SearchResults({ query }: { query: string }) {
  const [selected, setSelected] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [evidence, setEvidence] = useState<File[]>([]);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "I'm the AI Judge. Challenge this verdict with your argument or upload evidence exhibits.",
    },
  ]);

  function onEvidenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setEvidence((ev) => [...ev, ...picked]);
    e.target.value = "";
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text && evidence.length === 0) return;
    setMessages((m) => [
      ...m,
      { from: "me", text, files: evidence.map((f) => f.name) },
      { from: "bot", text: "Thanks! Judge replies aren't connected yet." },
    ]);
    setDraft("");
    setEvidence([]);
  }

  const title = topics[selected];

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-zinc-800">
      <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="Toggle links"
          className="rounded-md p-1.5 hover:bg-zinc-100 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <Link href="/" aria-label="ShareWise home" className="hidden sm:block">
          <LogoMark className="h-8 w-8" />
        </Link>
        <form action="/search" method="get" role="search" className="min-w-0 flex-1 sm:max-w-xs">
          <input
            type="search"
            name="q"
            defaultValue={query}
            aria-label="Search"
            placeholder="Search"
            autoComplete="off"
            className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          />
        </form>
        <Link
          href="/"
          className="ml-auto flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </Link>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={`absolute inset-y-0 left-0 z-20 w-64 overflow-y-auto border-r border-zinc-200 bg-zinc-50 transition-transform md:static md:w-1/5 md:translate-x-0 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {query ? `Results for “${query}”` : "Results"}
          </p>
          <ul className="py-2">
            {topics.map((topic, i) => (
              <li key={topic}>
                <a
                  href={`#topic-${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelected(i);
                    setDrawerOpen(false);
                  }}
                  aria-current={i === selected ? "page" : undefined}
                  className={`block border-l-4 px-4 py-2 text-sm ${
                    i === selected
                      ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-700"
                      : "border-transparent hover:bg-zinc-100"
                  }`}
                >
                  {topic}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {drawerOpen && (
          <div
            className="absolute inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto md:w-4/5 md:flex-row md:overflow-hidden">
          <article className="px-4 py-8 sm:px-8 md:w-[65%] md:overflow-y-auto">
            <div className="mx-auto max-w-2xl">
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
                {title}
              </h1>
              {topicImages[selected] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={topicImages[selected]}
                  alt=""
                  className="mt-8 aspect-[2/1] w-full rounded-lg object-cover"
                />
              )}
              <div className="mt-8 space-y-6 font-serif text-lg leading-8 text-zinc-800 sm:text-xl sm:leading-9">
                <p>
                  This is placeholder content for <strong>{title}</strong>. Lorem
                  ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </article>

          <aside
            aria-label="Chat with the AI Judge"
            className="flex h-[32rem] shrink-0 flex-col border-t border-zinc-200 bg-zinc-50 md:h-auto md:w-[35%] md:border-l md:border-t-0"
          >
            <div className="border-b border-zinc-200 bg-white px-4 py-4">
              <h2 className="text-lg font-semibold italic leading-snug text-indigo-700">
                Don&apos;t just comment, contribute and let the truth thrive.
              </h2>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    m.from === "me"
                      ? "self-end bg-indigo-600 text-white"
                      : "self-start bg-white shadow-sm ring-1 ring-zinc-200"
                  }`}
                >
                  {m.text && <p>{m.text}</p>}
                  {m.files?.map((f) => (
                    <p key={f} className="mt-1 text-xs opacity-80">
                      📎 {f}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="border-t border-zinc-200 bg-white p-2">
              {evidence.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-2">
                  {evidence.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-3 pr-1 text-xs text-indigo-700"
                    >
                      <span className="max-w-[10rem] truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setEvidence((ev) => ev.filter((_, j) => j !== i))}
                        aria-label={`Remove ${f.name}`}
                        className="rounded-full px-1.5 hover:bg-indigo-100"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={evidenceInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={onEvidenceChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => evidenceInputRef.current?.click()}
                  aria-label="Upload evidence"
                  title="Upload evidence"
                  className="rounded-full border border-zinc-300 p-2 text-zinc-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 0 1-2.6-2.6l8.3-8.3" />
                  </svg>
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Challenge the verdict…"
                  aria-label="Message"
                  className="min-w-0 flex-1 rounded-full border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </form>
          </aside>
        </section>
      </div>
    </div>
  );
}
