import { neon } from "@neondatabase/serverless";
import { io } from "next/cache";
import { isCategory, type CategoryId } from "@/lib/categories";
import type { Video } from "@/lib/types";

export type VideoCatalog = {
  videos: Video[];
  error: string | null;
};

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listVideos(): Promise<VideoCatalog> {
  await io();

  const url = process.env.DATABASE_URL;
  if (!url) return { videos: [], error: null };

  try {
    const sql = neon(url);
    const rows = await selectVideoRows(sql);

    const videos: Video[] = [];
    for (const row of rows) {
      const category = String(row.category);
      if (!isCategory(category)) continue;
      videos.push({
        id: String(row.id),
        title: String(row.title),
        category,
        blobUrl: String(row.blob_url),
        blobPathname: String(row.blob_pathname),
        sortOrder: Number(row.sort_order),
        isHero: Boolean(row.is_hero),
      });
    }

    return { videos, error: null };
  } catch (error) {
    console.error("Could not load videos", error);
    return {
      videos: [],
      error: error instanceof Error ? error.message : "Could not load videos",
    };
  }
}

export async function insertVideo(input: {
  title: string;
  category: CategoryId;
  blobUrl: string;
  blobPathname: string;
}) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = neon(url);
  const existing = await sql`select coalesce(max(sort_order), -1) as max_order from videos`;
  const sortOrder = Number(existing[0]?.max_order ?? -1) + 1;

  await sql`
    insert into videos (title, category, blob_url, blob_pathname, sort_order)
    values (${input.title}, ${input.category}, ${input.blobUrl}, ${input.blobPathname}, ${sortOrder})
  `;
}

export async function updateVideoRow(input: {
  id: string;
  title: string;
  category: CategoryId;
}) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  await sql`
    update videos
    set title = ${input.title}, category = ${input.category}
    where id = ${input.id}
  `;
}

export async function deleteVideoRow(id: string) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  const rows = await sql`
    delete from videos
    where id = ${id}
    returning blob_pathname
  `;
  return rows[0] ? String(rows[0].blob_pathname) : null;
}

export async function orderVideoRows(ids: string[]) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  const rows = await sql`select id from videos`;
  const existing = rows.map((row) => String(row.id));
  const sameSet =
    ids.length === existing.length && ids.every((id) => existing.includes(id));
  if (!sameSet) throw new Error("That order does not match the catalog.");

  for (let order = 0; order < ids.length; order += 1) {
    const videoId = ids[order];
    if (!videoId) continue;
    await sql`update videos set sort_order = ${order} where id = ${videoId}`;
  }
}

export async function setHeroVideo(id: string) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  const current = await sql`select is_hero from videos where id = ${id}`;
  await sql`update videos set is_hero = false`;
  if (!current[0]?.is_hero) {
    await sql`update videos set is_hero = true where id = ${id}`;
  }
}

type VideoRow = {
  id: unknown;
  title: unknown;
  category: unknown;
  blob_url: unknown;
  blob_pathname: unknown;
  sort_order: unknown;
  is_hero: unknown;
};

async function selectVideoRows(sql: ReturnType<typeof neon<false, false>>): Promise<VideoRow[]> {
  try {
    return (await sql`
      select id, title, category, blob_url, blob_pathname, sort_order, is_hero
      from videos
      order by sort_order asc, created_at asc
    `) as VideoRow[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/is_hero/i.test(message)) throw error;
    const rows = await sql`
      select id, title, category, blob_url, blob_pathname, sort_order
      from videos
      order by sort_order asc, created_at asc
    `;
    return rows.map((row) => ({ ...row, is_hero: false })) as VideoRow[];
  }
}
