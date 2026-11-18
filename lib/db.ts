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
    const rows = await sql`
      select id, title, category, blob_url, blob_pathname, sort_order
      from videos
      order by sort_order asc, created_at asc
    `;

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

export async function moveVideoRow(id: string, direction: "up" | "down") {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  const rows = await sql`
    select id
    from videos
    order by sort_order asc, created_at asc
  `;
  const ids = rows.map((row) => String(row.id));
  const index = ids.indexOf(id);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= ids.length) return;

  const next = ids.slice();
  const current = next[index];
  const neighbor = next[swap];
  if (!current || !neighbor) return;
  next[index] = neighbor;
  next[swap] = current;

  for (let order = 0; order < next.length; order += 1) {
    const videoId = next[order];
    if (!videoId) continue;
    await sql`update videos set sort_order = ${order} where id = ${videoId}`;
  }
}
