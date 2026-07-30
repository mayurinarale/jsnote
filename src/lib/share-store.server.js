import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {Object} SharedSnapshot
 * @property {string} id
 * @property {string} body
 * @property {string} title
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} revokeToken
 */

const DIR = path.join(process.cwd(), ".data", "shares");

/** @param {string} id */
function fileFor(id) {
  // Guard path traversal — ids are alphabet-only from createShareId.
  if (!/^[A-Za-z0-9]+$/.test(id)) {
    throw new Error("Invalid share id");
  }
  return path.join(DIR, `${id}.json`);
}

async function ensureDir() {
  await mkdir(DIR, { recursive: true });
}

/**
 * @param {SharedSnapshot} share
 * @returns {Promise<void>}
 */
export async function writeShare(share) {
  await ensureDir();
  await writeFile(fileFor(share.id), JSON.stringify(share), "utf8");
}

/**
 * @param {string} id
 * @returns {Promise<SharedSnapshot|null>}
 */
export async function readShare(id) {
  try {
    const raw = await readFile(fileFor(id), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteShare(id) {
  try {
    await unlink(fileFor(id));
  } catch {
    // Already gone.
  }
}
