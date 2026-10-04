"use client";

import { useState } from "react";
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

type Message = { from: "me" | "bot"; text: string };

export default function SearchResults({ query }: { query: string }) {
  const [selected, setSelected] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! Ask me anything about this article." },
  ]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { from: "me", text },
      { from: "bot", text: "Thanks! Chat replies aren't connected yet." },
    ]);
    setDraft("");
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

        <section className="relative flex-1 overflow-y-auto md:w-4/5">
          <article className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-8">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500">Dummy article #{selected + 1}</p>
            <p className="mt-6 leading-relaxed">
              This is placeholder content for <strong>{title}</strong>. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="mt-4 leading-relaxed">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
            <p className="mt-4 leading-relaxed">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
          </article>

          <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {chatOpen && (
              <div className="flex h-80 w-[calc(100vw-2rem)] max-w-xs flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                <div className="flex items-center justify-between bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
                  ShareWise Chat
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    aria-label="Close chat"
                    className="rounded-full p-1 hover:bg-indigo-500"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 text-sm">
                  {messages.map((m, i) => (
                    <p
                      key={i}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        m.from === "me"
                          ? "self-end bg-indigo-600 text-white"
                          : "self-start bg-zinc-100"
                      }`}
                    >
                      {m.text}
                    </p>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-zinc-200 p-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message"
                    aria-label="Message"
                    className="min-w-0 flex-1 rounded-full border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
            {!chatOpen && (
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                aria-label="Open chat"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                </svg>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
