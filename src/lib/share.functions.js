import { createServerFn } from "@tanstack/react-start";

import { createRevokeToken, createShareId } from "@/lib/share-id";
import { deleteShare, readShare, writeShare } from "@/lib/share-store.server";

/**
 * @param {unknown} value
 * @returns {string}
 */
function asNonEmptyString(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid input");
  }
  return value;
}

/** Public read — never returns the revoke token. */
export const getSharedNote = createServerFn({ method: "GET" })
  .validator((data) => ({ id: asNonEmptyString(data?.id) }))
  .handler(async ({ data }) => {
    const share = await readShare(data.id);
    if (!share) return null;
    return {
      id: share.id,
      body: share.body,
      title: share.title,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
    };
  });

/** Create a read-only snapshot and return the link credentials. */
export const createSharedNote = createServerFn({ method: "POST" })
  .validator((data) => ({
    body: asNonEmptyString(data?.body),
    title: typeof data?.title === "string" && data.title.trim() ? data.title.trim() : "Untitled note",
  }))
  .handler(async ({ data }) => {
    let id = createShareId();
    // Extremely unlikely collision — retry a few times.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await readShare(id);
      if (!existing) break;
      id = createShareId();
    }

    const now = Date.now();
    const revokeToken = createRevokeToken();
    await writeShare({
      id,
      body: data.body,
      title: data.title,
      createdAt: now,
      updatedAt: now,
      revokeToken,
    });

    return { id, revokeToken, createdAt: now };
  });

/** Refresh the snapshot at the same URL (author only). */
export const updateSharedNote = createServerFn({ method: "POST" })
  .validator((data) => ({
    id: asNonEmptyString(data?.id),
    revokeToken: asNonEmptyString(data?.revokeToken),
    body: asNonEmptyString(data?.body),
    title: typeof data?.title === "string" && data.title.trim() ? data.title.trim() : "Untitled note",
  }))
  .handler(async ({ data }) => {
    const share = await readShare(data.id);
    if (!share || share.revokeToken !== data.revokeToken) {
      throw new Error("Share not found or revoke token invalid");
    }

    const updatedAt = Date.now();
    await writeShare({
      ...share,
      body: data.body,
      title: data.title,
      updatedAt,
    });

    return { id: share.id, updatedAt };
  });

/** Invalidate the public link (author only). */
export const revokeSharedNote = createServerFn({ method: "POST" })
  .validator((data) => ({
    id: asNonEmptyString(data?.id),
    revokeToken: asNonEmptyString(data?.revokeToken),
  }))
  .handler(async ({ data }) => {
    const share = await readShare(data.id);
    if (!share || share.revokeToken !== data.revokeToken) {
      throw new Error("Share not found or revoke token invalid");
    }
    await deleteShare(data.id);
    return { ok: true };
  });
