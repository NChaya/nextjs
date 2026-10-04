"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-base outline-none placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500";

type Article = {
  userName: string;
  content: string;
  imageUrl: string | null;
};

export default function PublishForm() {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [published, setPublished] = useState<Article | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageUrl(file ? URL.createObjectURL(file) : null);
  }

  function removeImage() {
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPublished({ userName, content, imageUrl });
  }

  if (published) {
    return (
      <article className="mt-8">
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your article is ready.
        </p>
        {published.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={published.imageUrl}
            alt=""
            className="mt-6 max-h-96 w-full rounded-lg object-cover"
          />
        )}
        <p className="mt-6 text-sm text-zinc-500">By {published.userName}</p>
        <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
          {published.content}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setPublished(null)}
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
        <label htmlFor="image" className="mb-1.5 block text-sm font-medium">
          Image <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="image"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {imageUrl && (
          <div className="relative mt-3 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Selected preview"
              className="max-h-64 rounded-lg border border-zinc-200 object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow ring-1 ring-zinc-300 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-300"
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
        )}
      </div>

      <button
        type="submit"
        className="self-start rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Publish
      </button>
    </form>
  );
}
