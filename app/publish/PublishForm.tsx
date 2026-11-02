"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500";

const pickerButtonClass =
  "cursor-pointer rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100";

// JSON body sent to POST /api/publish.
type PublishPayload = {
  user_name: string;
  content: string;
  files: { name: string; content_type: string; data: string }[];
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

async function buildPayload(
  userName: string,
  content: string,
  files: File[],
): Promise<PublishPayload> {
  return {
    user_name: userName.trim(),
    content,
    files: await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        content_type: f.type || "application/octet-stream",
        data: await fileToBase64(f),
      })),
    ),
  };
}

// Calls the Python API (proxied by Next.js: /api/* -> FastAPI, see next.config.ts).
async function publishArticle(payload: PublishPayload): Promise<void> {
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : null;
    throw new Error(detail ?? `Publish failed (${res.status}).`);
  }
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublishForm() {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview URLs for image files; revoked whenever the file list changes.
  const previews = useMemo(
    () =>
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      ),
    [files],
  );
  useEffect(() => {
    return () => previews.forEach((url) => url && URL.revokeObjectURL(url));
  }, [previews]);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
    if (picked.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...picked.filter(
        (p) =>
          !prev.some(
            (f) => f.name === p.name && f.size === p.size && f.type === p.type,
          ),
      ),
    ]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await publishArticle(await buildPayload(userName, content, files));
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (published) {
    return (
      <article className="mt-8">
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your article is ready.
        </p>
        {files.length > 0 && (
          <ul className="mt-6 flex flex-col gap-3">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                {previews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previews[i]!}
                    alt={f.name}
                    className="max-h-96 w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-sm text-zinc-600">📎 {f.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-sm text-zinc-500">By {userName}</p>
        <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
          {content}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setPublished(false)}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm hover:bg-zinc-50"
          >
            Edit
          </button>
          <Link
            href="/"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Home
          </Link>
        </div>
      </article>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
      <div>
        <label htmlFor="userName" className="mb-1.5 block text-sm font-medium">
          Your name
        </label>
        <input
          id="userName"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="e.g. Jane Doe"
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
          Article
        </label>
        <textarea
          id="content"
          required
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type or paste your article here…"
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium">
          Files <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <input
          id="files"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFilesChange}
          className="sr-only"
        />

        {files.length === 0 ? (
          <label htmlFor="files" className={`${pickerButtonClass} inline-block`}>
            Choose file(s)
          </label>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2"
                >
                  {previews[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[i]!}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded bg-zinc-100 text-lg">
                      📎
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{f.name}</span>
                    <span className="block text-xs text-zinc-400">
                      {formatSize(f.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-red-50 hover:text-red-600"
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
                </li>
              ))}
            </ul>
            <label
              htmlFor="files"
              className={`${pickerButtonClass} mt-3 inline-block`}
            >
              + Upload File(s)
            </label>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
