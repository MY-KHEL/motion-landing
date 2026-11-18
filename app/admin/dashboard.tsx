"use client";

import { startTransition, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  createVideo,
  logout,
  removeVideo,
  reorderVideo,
  saveVideo,
} from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import type { Video } from "@/lib/types";

const MAX_BYTES = 500 * 1024 * 1024;
const FIELD =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-blue";

export function Dashboard({
  videos,
  catalogError,
  uploadsReady,
}: {
  videos: Video[];
  catalogError: string | null;
  uploadsReady: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a video file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 500 MB.");
      return;
    }
    const extension = file.name.toLowerCase().split(".").pop() ?? "";
    const contentType =
      file.type ||
      (extension === "webm"
        ? "video/webm"
        : extension === "mov"
          ? "video/quicktime"
          : "video/mp4");
    const allowedType = ["video/mp4", "video/webm", "video/quicktime"].includes(contentType);
    const allowedExt = ["mp4", "webm", "mov"].includes(extension);
    if (!allowedType || !allowedExt) {
      setError("Use an mp4, webm, or QuickTime file.");
      return;
    }

    setBusy(true);
    setError(null);
    setStatus("Uploading…");

    try {
      const blob = await upload(uploadPath(file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType,
        multipart: file.size > 4 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          setStatus(`Uploading ${Math.round(percentage)}%`);
        },
      });

      setStatus("Saving to the catalog…");
      const result = await runAction(() =>
        createVideo({
          title,
          category,
          blobUrl: blob.url,
          blobPathname: blob.pathname,
        }),
      );

      if (result.error) {
        setError(result.error);
        setStatus(null);
      } else {
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
        setStatus(null);
      }
    } catch (uploadError) {
      setStatus(null);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function run(task: () => Promise<{ error: string }>) {
    setError(null);
    void runAction(task).then((result) => {
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-blue-soft">
            MOTION DESIGNER
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Studio</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Films you publish here play in Selected work, in this order.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="press inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      {!uploadsReady ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
          Add DATABASE_URL and BLOB_READ_WRITE_TOKEN before uploading. Run{" "}
          <code className="text-white">db/schema.sql</code> in the Neon SQL editor.
        </p>
      ) : null}

      {catalogError ? (
        <p className="mt-4 rounded-2xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          The catalog could not be read. If the videos table is missing, run{" "}
          db/schema.sql in Neon. {catalogError}
        </p>
      ) : null}

      <form onSubmit={onUpload} className="mt-10 grid gap-4 rounded-[28px] border border-white/8 bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Upload a film</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block font-medium">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={120}
              className={FIELD}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={FIELD}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-2 block font-medium">Video file</span>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            required
            className="block w-full text-sm text-muted file:mr-4 file:h-11 file:rounded-full file:border-0 file:bg-white file:px-4 file:text-sm file:font-semibold file:text-black"
          />
        </label>
        {status ? <p className="text-sm text-blue-soft">{status}</p> : null}
        {error ? (
          <p className="text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !uploadsReady}
          className="press inline-flex h-12 items-center justify-center rounded-full bg-blue px-6 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Working…" : "Publish"}
        </button>
      </form>

      <ul className="mt-10 space-y-4">
        {videos.length === 0 ? (
          <li className="text-sm text-muted">No films published yet.</li>
        ) : (
          videos.map((video, index) => (
            <li
              key={video.id}
              className="grid gap-4 rounded-[28px] border border-white/8 bg-card p-4 sm:grid-cols-[180px_1fr] sm:p-5"
            >
              <video
                src={video.blobUrl}
                muted
                playsInline
                preload="metadata"
                className="aspect-video w-full rounded-2xl bg-black object-cover"
              />
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  run(() => saveVideo(data));
                }}
              >
                <input type="hidden" name="id" value={video.id} />
                <input name="title" defaultValue={video.title} required maxLength={120} className={FIELD} />
                <select name="category" defaultValue={video.category} className={FIELD}>
                  {CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="press inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-black"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => run(() => reorderVideo(video.id, "up"))}
                    className="press inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-sm disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === videos.length - 1}
                    onClick={() => run(() => reorderVideo(video.id, "down"))}
                    className="press inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-sm disabled:opacity-40"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => removeVideo(video.id))}
                    className="press inline-flex h-11 items-center rounded-full px-4 text-sm text-coral"
                  >
                    Remove
                  </button>
                </div>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function runAction(task: () => Promise<{ error: string }>) {
  return new Promise<{ error: string }>((resolve, reject) => {
    startTransition(() => {
      task().then(resolve, reject);
    });
  });
}

function uploadPath(file: File) {
  const cleaned = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `videos/${cleaned || "film.mp4"}`;
}
