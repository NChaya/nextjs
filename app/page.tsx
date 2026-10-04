import Link from "next/link";
import { Logo } from "./components/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white font-sans text-zinc-800">
      <header className="flex justify-end px-4 py-3 sm:px-6">
        <Link
          href="/publish"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Publish Article
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
        <Logo />

        <form
          action="/search"
          method="get"
          role="search"
          className="mt-8 w-full max-w-xl sm:mt-10"
        >
          <div className="flex items-center gap-3 rounded-full border border-zinc-300 px-5 py-3 shadow-sm transition focus-within:border-transparent focus-within:shadow-md hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 text-zinc-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="search"
              name="q"
              aria-label="Search the web"
              placeholder="Search the web"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
            />
          </div>
        </form>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-between">
          <span>&copy; {new Date().getFullYear()} ShareWise</span>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
