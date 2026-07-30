/**
 * @typedef {Object} SharedSnapshot
 * @property {string} id
 * @property {string} body
 * @property {string} title
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} revokeToken
 */

/** @param {string} id */
function assertId(id) {
  if (!/^[A-Za-z0-9]{1,64}$/.test(id)) {
    throw new Error("Invalid share id");
  }
  return id;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * @param {SharedSnapshot} share
 * @returns {Promise<void>}
 */
export async function writeShare(share) {
  const db = await admin();
  const { error } = await db.from("shared_notes").upsert({
    id: assertId(share.id),
    title: share.title,
    body: share.body,
    revoke_token: share.revokeToken,
    created_at: new Date(share.createdAt).toISOString(),
    updated_at: new Date(share.updatedAt).toISOString(),
  });
  if (error) throw new Error(error.message);
}

/**
 * @param {string} id
 * @returns {Promise<SharedSnapshot|null>}
 */
export async function readShare(id) {
  const db = await admin();
  const { data, error } = await db
    .from("shared_notes")
    .select("id, title, body, revoke_token, created_at, updated_at")
    .eq("id", assertId(id))
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    body: data.body,
    revokeToken: data.revoke_token,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteShare(id) {
  const db = await admin();
  await db.from("shared_notes").delete().eq("id", assertId(id));
}
