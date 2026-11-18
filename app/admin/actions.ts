"use server";

import { del } from "@vercel/blob";
import { refresh } from "next/cache";
import {
  authConfigured,
  clearSession,
  createSession,
  isAdmin,
  passwordsMatch,
} from "@/lib/auth";
import { isCategory } from "@/lib/categories";
import {
  deleteVideoRow,
  insertVideo,
  moveVideoRow,
  updateVideoRow,
} from "@/lib/db";
import type { ActionResult } from "@/lib/types";

const ok: ActionResult = { error: "" };

function cleanTitle(value: FormDataEntryValue | null) {
  const title = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (title.length < 1 || title.length > 120) return null;
  return title;
}

function isBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith("blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function isPathname(value: string) {
  return (
    value.startsWith("videos/") &&
    value.length < 500 &&
    !value.includes("..") &&
    !value.includes("\\")
  );
}

async function gate(): Promise<ActionResult | null> {
  if (!(await isAdmin())) return { error: "Sign in again to change the reel." };
  return null;
}

export async function login(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!authConfigured()) {
    return { error: "Add ADMIN_PASSWORD and AUTH_SECRET before signing in." };
  }

  const expected = process.env.ADMIN_PASSWORD ?? "";
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password, expected)) {
    return { error: "That password is not right." };
  }

  await createSession();
  return ok;
}

export async function logout() {
  await clearSession();
}

export async function createVideo(input: {
  title: string;
  category: string;
  blobUrl: string;
  blobPathname: string;
}): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  if (!process.env.DATABASE_URL) {
    return { error: "Add DATABASE_URL before saving a film." };
  }

  const title = input.title.trim().replace(/\s+/g, " ");
  if (title.length < 1 || title.length > 120) {
    return { error: "Give the film a title, up to 120 characters." };
  }
  if (!isCategory(input.category)) {
    return { error: "Pick a category." };
  }
  if (!isBlobUrl(input.blobUrl) || !isPathname(input.blobPathname)) {
    return { error: "That upload did not come back as a video file." };
  }

  try {
    await insertVideo({
      title,
      category: input.category,
      blobUrl: input.blobUrl,
      blobPathname: input.blobPathname,
    });
  } catch (error) {
    try {
      await del(input.blobPathname);
    } catch (cleanupError) {
      console.error("Could not remove the uploaded file", cleanupError);
    }
    console.error("Could not save video", error);
    return {
      error:
        "The file uploaded, then the catalog rejected it. Run db/schema.sql in Neon if the videos table is missing.",
    };
  }

  refresh();
  return ok;
}

export async function saveVideo(formData: FormData): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;

  const id = String(formData.get("id") ?? "");
  const title = cleanTitle(formData.get("title"));
  const category = String(formData.get("category") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "That film could not be found." };
  if (!title) return { error: "Give the film a title, up to 120 characters." };
  if (!isCategory(category)) return { error: "Pick a category." };

  try {
    await updateVideoRow({ id, title, category });
  } catch (error) {
    console.error("Could not update video", error);
    return { error: "The catalog could not save that change." };
  }

  refresh();
  return ok;
}

export async function removeVideo(id: string): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "That film could not be found." };

  try {
    const pathname = await deleteVideoRow(id);
    if (pathname) {
      await del(pathname);
    }
  } catch (error) {
    console.error("Could not delete video", error);
    return { error: "The film could not be removed." };
  }

  refresh();
  return ok;
}

export async function reorderVideo(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "That film could not be found." };

  try {
    await moveVideoRow(id, direction);
  } catch (error) {
    console.error("Could not reorder video", error);
    return { error: "The reel order could not be changed." };
  }

  refresh();
  return ok;
}
