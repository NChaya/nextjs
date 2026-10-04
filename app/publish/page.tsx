import Link from "next/link";
import { LogoMark } from "../components/Logo";
import PublishForm from "./PublishForm";

export const metadata = {
  title: "Publish Article | ShareWise",
};

export default function PublishPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white font-sans text-zinc-800">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="ShareWise home">
          <LogoMark className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-indigo-600">Share</span>
            <span className="text-zinc-800">Wise</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-semibold sm:text-3xl">Publish an article</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Type or paste your content, add an image and tell us who you are.
        </p>
        <PublishForm />
      </main>
    </div>
  );
}
