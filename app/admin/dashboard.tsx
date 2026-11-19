"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  createVideo,
  discardUpload,
  logout,
  makeHero,
  orderVideos,
  removeVideo,
  saveVideo,
} from "@/app/admin/actions";
import { CheckIcon, TrashIcon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";
import type { Video } from "@/lib/types";

const MAX_BYTES = 500 * 1024 * 1024;
const FIELD =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-blue";
const SELECT =
  "field-select h-12 w-full rounded-2xl border border-white/10 bg-[#12121a] pl-4 text-sm text-foreground outline-none focus:border-blue";

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
  const uploadPercent = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    void clearControllingServiceWorker();
  }, []);

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

    const controller = new AbortController();
    abortRef.current = controller;
    stoppedRef.current = false;
    setBusy(true);
    setError(null);
    uploadPercent.current = 0;
    setStatus("Uploading 0%");

    try {
      const blob = await upload(uploadPath(file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType,
        multipart: file.size > 4 * 1024 * 1024,
        abortSignal: controller.signal,
        onUploadProgress: ({ percentage }) => {
          const next = Math.max(uploadPercent.current, Math.round(percentage));
          uploadPercent.current = next;
          setStatus(next >= 99 ? "Finishing the upload…" : `Uploading ${next}%`);
        },
      });

      if (stoppedRef.current || controller.signal.aborted) {
        await runAction(() => discardUpload(blob.pathname));
        setError(null);
        setStatus("Upload stopped.");
        return;
      }

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
      if (stoppedRef.current || controller.signal.aborted || isAbortError(uploadError)) {
        setError(null);
        setStatus("Upload stopped.");
      } else {
        setStatus(null);
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function stopUpload() {
    stoppedRef.current = true;
    abortRef.current?.abort();
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
              className={SELECT}
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
        {busy ? (
          <button
            type="button"
            onClick={stopUpload}
            className="press inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!uploadsReady}
            className="press inline-flex h-12 items-center justify-center rounded-full bg-blue px-6 text-sm font-semibold text-white disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </form>

      <FilmList
        videos={videos}
        onSave={(data) => run(() => saveVideo(data))}
        onOrder={(ids) => run(() => orderVideos(ids))}
        onHero={(id) => run(() => makeHero(id))}
        onRemove={(id) => run(() => removeVideo(id))}
      />
    </div>
  );
}

function FilmList({
  videos,
  onSave,
  onOrder,
  onHero,
  onRemove,
}: {
  videos: Video[];
  onSave: (data: FormData) => void;
  onOrder: (ids: string[]) => void;
  onHero: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const dragId = useRef<string | null>(null);
  const rowsRef = useRef(videos);
  const [rows, setRows] = useState(videos);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    rowsRef.current = videos;
    setRows(videos);
  }, [videos]);

  function moveTo(clientY: number) {
    const id = dragId.current;
    const list = listRef.current;
    if (!id || !list) return;
    const items = [...list.querySelectorAll<HTMLElement>("[data-film-id]")];
    let index = items.length - 1;
    for (let i = 0; i < items.length; i += 1) {
      const box = items[i]?.getBoundingClientRect();
      if (!box) continue;
      if (clientY < box.top + box.height / 2) {
        index = i;
        break;
      }
    }
    setRows((current) => {
      const from = current.findIndex((video) => video.id === id);
      if (from < 0 || from === index) return current;
      const next = current.slice();
      const [moved] = next.splice(from, 1);
      if (!moved) return current;
      next.splice(index, 0, moved);
      rowsRef.current = next;
      return next;
    });
  }

  function finishDrag() {
    const id = dragId.current;
    dragId.current = null;
    setDraggingId(null);
    if (!id) return;
    const next = rowsRef.current;
    const nextIds = next.map((video) => video.id).join(",");
    const savedIds = videos.map((video) => video.id).join(",");
    if (nextIds !== savedIds) onOrder(next.map((video) => video.id));
  }

  return (
    <ul ref={listRef} className="mt-8 space-y-2">
      {rows.length === 0 ? (
        <li className="text-sm text-muted">No films published yet.</li>
      ) : (
        rows.map((video) => (
          <FilmRow
            key={video.id}
            video={video}
            dragging={draggingId === video.id}
            onSave={onSave}
            onHero={() => onHero(video.id)}
            onRemove={() => onRemove(video.id)}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragId.current = video.id;
              setDraggingId(video.id);
            }}
            onPointerMove={(event) => {
              if (dragId.current !== video.id) return;
              moveTo(event.clientY);
            }}
            onPointerUp={finishDrag}
          />
        ))
      )}
    </ul>
  );
}

function FilmRow({
  video,
  dragging,
  onSave,
  onHero,
  onRemove,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  video: Video;
  dragging: boolean;
  onSave: (data: FormData) => void;
  onHero: () => void;
  onRemove: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [category, setCategory] = useState(video.category);
  const changed = title.trim() !== video.title || category !== video.category;

  useEffect(() => {
    setTitle(video.title);
    setCategory(video.category);
  }, [video.title, video.category]);

  return (
    <li
      data-film-id={video.id}
      className={`grid items-center gap-3 rounded-2xl border border-white/8 bg-card px-3 py-2 [grid-template-columns:2rem_5rem_minmax(0,14rem)_minmax(0,14rem)_2.75rem_7rem_2.75rem] ${dragging ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        aria-label={`Drag ${video.title}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="inline-flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted active:cursor-grabbing"
      >
        <span aria-hidden className="text-lg leading-none">
          ⋮⋮
        </span>
      </button>
      <video
        src={video.blobUrl}
        muted
        playsInline
        preload="metadata"
        className="h-12 w-20 shrink-0 rounded-lg bg-black object-cover"
      />
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          if (!changed) return;
          const data = new FormData();
          data.set("id", video.id);
          data.set("title", title);
          data.set("category", category);
          onSave(data);
        }}
      >
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
          aria-label="Title"
          className="h-11 w-full max-w-56 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-blue"
        />
        <select
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as Video["category"])}
          aria-label="Category"
          className="field-select h-11 w-full max-w-56 rounded-xl border border-white/10 bg-[#12121a] pl-3 text-sm text-foreground outline-none focus:border-blue"
        >
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!changed}
          aria-label="Save"
          className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
        >
          <CheckIcon />
        </button>
      </form>
      <button
        type="button"
        aria-pressed={video.isHero}
        onClick={onHero}
        className={`press inline-flex h-11 w-28 items-center justify-center rounded-full px-3 text-sm ${video.isHero ? "bg-blue text-white" : "border border-white/15"}`}
      >
        {video.isHero ? "Hero" : "Make hero"}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-coral"
      >
        <TrashIcon />
      </button>
    </li>
  );
}

async function clearControllingServiceWorker() {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  if (sessionStorage.getItem("md-sw-cleared") === "1") return;
  sessionStorage.setItem("md-sw-cleared", "1");
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  window.location.reload();
}

function runAction(task: () => Promise<{ error: string }>) {
  return new Promise<{ error: string }>((resolve, reject) => {
    startTransition(() => {
      task().then(resolve, reject);
    });
  });
}

function isAbortError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || error.name === "BlobRequestAbortedError";
}

function uploadPath(file: File) {
  const cleaned = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `videos/${cleaned || "film.mp4"}`;
}
