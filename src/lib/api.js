import axios from "axios";

/**
 * API layer scaffold.
 *
 * The Spring Boot backend does not exist yet — nothing here is called by the
 * UI. The client, interceptors and endpoint surface are defined now so that
 * wiring sync later is a one-file change rather than an architecture change.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/** Device identity precedes accounts: v1 sync is anonymous, per-device. */
let deviceId = null;

/** @param {string} id */
export function setDeviceId(id) {
  deviceId = id;
}

apiClient.interceptors.request.use((config) => {
  if (deviceId) config.headers["X-Device-Id"] = deviceId;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

/**
 * Normalises transport failures into a shape the UI error states understand.
 * @param {unknown} error
 * @returns {{ code: string, message: string, status: number|null }}
 */
export function normalizeError(error) {
  const status = error?.response?.status ?? null;
  if (!status) {
    return { code: "network", message: "You're offline. Changes are saved on this device.", status };
  }
  if (status >= 500) {
    return { code: "server", message: "The server had a problem. We'll retry automatically.", status };
  }
  return { code: "request", message: error?.response?.data?.message ?? "Request failed.", status };
}

/**
 * Endpoint contract mirroring the blueprint's sync API.
 * Intentionally not invoked in this phase.
 */
export const notesApi = {
  /** @returns {Promise<import("./db").Note[]>} */
  list: () => apiClient.get("/notes").then((r) => r.data),
  /** @param {string} id */
  get: (id) => apiClient.get(`/notes/${id}`).then((r) => r.data),
  /** @param {import("./db").Note} note */
  create: (note) => apiClient.post("/notes", note).then((r) => r.data),
  /** @param {string} id @param {Partial<import("./db").Note>} patch */
  update: (id, patch) => apiClient.patch(`/notes/${id}`, patch).then((r) => r.data),
  /** @param {string} id */
  remove: (id) => apiClient.delete(`/notes/${id}`).then((r) => r.data),
  /** @param {import("./db").PendingOperation[]} operations */
  sync: (operations) => apiClient.post("/notes/sync", { operations }).then((r) => r.data),
};