import { ApiError, mockRequest } from "./mock";

export { ApiError };

/*
 * The UI uses friendly field names (name, service, price_from, etc.).
 * The FastAPI backend uses its real schema names (first_name, category,
 * hourly_rate, booking_date, etc.).  All conversion is kept here so the
 * React pages don't need to know backend implementation details.
 */

function normalizeUser(user) {
  if (!user) return null;

  const first_name = user.first_name ?? "";
  const last_name = user.last_name ?? "";

  return {
    ...user,
    first_name,
    last_name,
    name: user.name ?? `${first_name} ${last_name}`.trim(),
    phone: user.phone ?? user.phone_no ?? "",
    phone_no: user.phone_no ?? user.phone ?? "",
    email: user.email ?? "",
    role: user.role ?? "",
    professional_id: user.professional_id ?? null,
    profile_image: normalizeUploadUrl(user.profile_image),
  };
}

function normalizeUploadUrl(value) {
  if (!value) return "";
  const path = String(value).replace(/\\/g, "/").replace(/^\.\//, "");
  if (/^https?:\/\//i.test(path)) return path;
  const apiBase = base || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  if (path.startsWith("/uploads/")) return `${apiBase}${path}`;
  if (path.startsWith("uploads/")) return `${apiBase}/${path}`;
  return path;
}

function normalizeProfessional(p) {
  if (!p) return null;

  const first = p.first_name ?? "";
  const last = p.last_name ?? "";

  return {
    ...p,
    name: p.name ?? `${first} ${last}`.trim(),
    service: p.service ?? p.category ?? "Professional",
    skills: Array.isArray(p.skills) ? p.skills : [],
    city: p.city ?? "",
    state: p.state ?? "",
    experience_years: Number(p.experience_years ?? p.experience ?? 0),
    price_from: Number(p.price_from ?? p.hourly_rate ?? 0),
    hourly_rate: Number(p.hourly_rate ?? p.price_from ?? 0),
    rating: Number(p.rating ?? 0),
    reviews_count: Number(p.reviews_count ?? 0),
    jobs_done: Number(p.jobs_done ?? 0),
    avatar_url: normalizeUploadUrl(p.avatar_url ?? p.profile_image),
    profile_image: normalizeUploadUrl(p.profile_image ?? p.avatar_url),
    government_id: normalizeUploadUrl(p.government_id),
    verified: p.verified ?? p.verification_status === "verified",
    status: p.status ?? p.verification_status ?? "pending",
    documents: Array.isArray(p.documents) ? p.documents : [],
    languages: Array.isArray(p.languages) ? p.languages : [],
    address: p.address ?? "",
    state: p.state ?? "",
    pincode: p.pincode ?? "",
    is_available: Boolean(p.is_available ?? false),
    available_from: p.available_from ?? null,
    breakdown: p.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
}

function normalizeBooking(b) {
  if (!b) return null;

  const status = String(b.status ?? "pending").toLowerCase();

  return {
    ...b,
    customer_id: b.customer_id,
    customer_name: b.customer_name ?? "Customer",
    professional_id: b.professional_id,
    professional_name: b.professional_name ?? "Professional",
    service: b.service ?? "Home service",
    date: b.date ?? b.booking_date ?? "",
    slot:
      b.slot ??
      (b.start_time
        ? `${String(b.start_time).slice(0, 5)}${b.duration_hours ? ` · ${b.duration_hours}h` : ""}`
        : ""),
    start_time: b.start_time ?? "",
    duration_hours: b.duration_hours ?? 0,
    address: b.address ?? "",
    city: b.city ?? "",
    state: b.state ?? "",
    pincode: b.pincode ?? "",
    amount: Number(b.amount ?? b.total_amount ?? 0),
    total_amount: Number(b.total_amount ?? b.amount ?? 0),
    status: status === "accepted" ? "confirmed" : status,
    rejection_reason: b.rejection_reason ?? "",
    created_at: b.created_at ?? new Date().toISOString(),
  };
}

function normalizeReview(r) {
  if (!r) return null;
  return {
    ...r,
    customer_name:
      r.customer_name ??
      `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() ??
      "Customer",
    rating: Number(r.rating ?? 0),
    comment: r.comment ?? "",
  };
}

function normalizeRating(r) {
  return {
    average: Number(r?.average ?? r?.average_rating ?? 0),
    count: Number(r?.count ?? r?.review_count ?? 0),
    breakdown: r?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
}

function normalizeNotification(n) {
  if (!n) return null;
  return {
    ...n,
    read: Boolean(n.read ?? n.is_read ?? false),
  };
}

function normalizeAuthResponse(res) {
  if (!res) return res;

  const access_token = res.access_token ?? res.token;

  return {
    ...res,
    access_token,
    token: access_token,
    user: res.user ? normalizeUser(res.user) : undefined,
  };
}

function splitName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? "",
    last_name: parts.slice(1).join(" "),
  };
}

function customerRegistrationBody(body = {}) {
  const { first_name, last_name } = splitName(body.name);
  return {
    first_name: body.first_name ?? first_name,
    last_name: body.last_name ?? last_name,
    email: body.email,
    phone_no: body.phone_no ?? body.phone ?? "",
    password: body.password,
    address: body.address ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    pincode: body.pincode ?? "",
  };
}

function professionalRegistrationBody(body = {}) {
  const { first_name, last_name } = splitName(body.name);
  return {
    first_name: body.first_name ?? first_name,
    last_name: body.last_name ?? last_name,
    email: body.email,
    phone_no: body.phone_no ?? body.phone ?? "",
    password: body.password,
    category: body.category ?? body.service,
    category_id: body.category_id,
    bio: body.bio ?? "",
    experience: Number(body.experience ?? body.experience_years ?? 0),
    hourly_rate: Number(body.hourly_rate ?? body.price_from ?? 0),
    address: body.address ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    pincode: body.pincode ?? "",
  };
}

function normalizeList(data, normalizer) {
  if (!Array.isArray(data)) return [];
  return data.map(normalizer);
}

/* ------------------------------------------------------------------ */
/* Endpoint map                                                       */
/* ------------------------------------------------------------------ */
export const ENDPOINTS = [
  { group: "Authentication", method: "POST", path: "/auth/register/customer", name: "Register Customer Api" },
  { group: "Authentication", method: "POST", path: "/auth/register/professional", name: "Register Professional Api" },
  { group: "Authentication", method: "POST", path: "/auth/login", name: "Login Api" },
  { group: "Authentication", method: "GET", path: "/auth/me", name: "Get My Profile", auth: "user" },

  { group: "Professionals", method: "GET", path: "/professionals", name: "Get Professional Api", auth: "user" },
  { group: "Professionals", method: "GET", path: "/search", name: "Search Professional Api" },
  { group: "Professionals", method: "GET", path: "/professionals/{professional_id}", name: "Get Professional By Id Api" },
  { group: "Professionals", method: "POST", path: "/upload-documents", name: "Upload Documents", auth: "user" },

  { group: "Bookings", method: "POST", path: "/bookings", name: "Create Booking Api", auth: "user" },
  { group: "Bookings", method: "GET", path: "/bookings/my", name: "Get My Bookings Api", auth: "user" },
  { group: "Bookings", method: "GET", path: "/bookings/professional", name: "Get Professional Bookings Api", auth: "user" },
  { group: "Bookings", method: "GET", path: "/bookings/{booking_id}", name: "Get Booking By Id Api", auth: "user" },
  { group: "Bookings", method: "PATCH", path: "/bookings/{booking_id}/accept", name: "Accept Booking Api", auth: "user" },
  { group: "Bookings", method: "PATCH", path: "/bookings/{booking_id}/reject", name: "Reject Booking Api", auth: "user" },
  { group: "Bookings", method: "PATCH", path: "/bookings/{booking_id}/complete", name: "Complete Booking Api", auth: "user" },
  { group: "Bookings", method: "PATCH", path: "/bookings/{booking_id}/cancel", name: "Cancel Booking Api", auth: "user" },

  { group: "Admin", method: "PATCH", path: "/admin/professional/{professional_id}/verify", name: "Verify Professional Api", auth: "admin" },
  { group: "Admin", method: "GET", path: "/admin/professional/pending", name: "Get Pending Professional Api", auth: "admin" },
  { group: "Admin", method: "GET", path: "/admin/bookings", name: "Get All Bookings Api", auth: "admin" },

  { group: "Review", method: "POST", path: "/reviews", name: "Create Review Api", auth: "user" },
  { group: "Review", method: "GET", path: "/professionals/{professional_id}/reviews", name: "Get Professional Reviews Api" },
  { group: "Review", method: "GET", path: "/professionals/{professional_id}/rating", name: "Get Professional Rating Api" },

  { group: "Notifications", method: "GET", path: "/notification", name: "Get User Notification Api", auth: "user" },
  { group: "Notifications", method: "PATCH", path: "/notification/{notification_id}/read", name: "Mark Notification As Read Api", auth: "user" },

  { group: "AI", method: "POST", path: "/ai/troubleshoot", name: "Troubleshoot" },
  { group: "default", method: "GET", path: "/db-test", name: "Db Test" },
];

const LS_BASE = "trust_connect_api_base";
const LS_FORCE = "trust_connect_force_demo";
const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

let base = (() => {
  try { return localStorage.getItem(LS_BASE) ?? DEFAULT_BASE; } catch { return DEFAULT_BASE; }
})();
let forceDemo = (() => {
  try { return localStorage.getItem(LS_FORCE) === "1"; } catch { return false; }
})();
let status = base && !forceDemo ? "live" : "demo";

const listeners = new Set();

function emit() {
  listeners.forEach((l) => l(status));
}

function setStatus(s) {
  if (s !== status) {
    status = s;
    emit();
  }
}

export function getConn() {
  return { base, forceDemo, status };
}

export function subscribeConn(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setBase(next) {
  base = next.trim().replace(/\/+$/, "");
  try { localStorage.setItem(LS_BASE, base); } catch {}
  status = base && !forceDemo ? "live" : "demo";
  emit();
}

export function setForceDemo(v) {
  forceDemo = v;
  try { localStorage.setItem(LS_FORCE, v ? "1" : "0"); } catch {}
  status = base && !forceDemo ? "live" : "demo";
  emit();
}

/* ------------------------------------------------------------------ */
/* Core request                                                       */
/* ------------------------------------------------------------------ */
async function request(method, path, opts = {}) {
  const useLive = Boolean(base) && !forceDemo;

  if (!useLive) {
    setStatus("demo");
    return mockRequest(method, path, opts);
  }

  const qs = opts.query
    ? "?" + Object.entries(opts.query)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";

  const headers = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  // Do NOT set Content-Type for FormData. Browser sets multipart boundary.
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(base + path + qs, {
      method,
      headers,
      body: opts.formData
        ? opts.formData
        : opts.body !== undefined
          ? JSON.stringify(opts.body)
          : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map((x) => x.msg).join(", ")
            : data?.message ?? `Request failed (${res.status})`;

      throw new ApiError(res.status, msg);
    }

    setStatus("live");
    return data;
  } catch (e) {
    // HTTP errors are real API errors. Only network/server failures use demo.
    if (e instanceof ApiError) throw e;

    setStatus("fallback");
    return mockRequest(method, path, opts);
  }
}

/* ------------------------------------------------------------------ */
/* API surface                                                        */
/* ------------------------------------------------------------------ */
export const api = {
  login: async (body) => {
    const res = normalizeAuthResponse(await request("POST", "/auth/login", { body }));

    if (!res?.access_token) {
      throw new ApiError(500, "Login response did not contain an access token.");
    }

    // Backend login returns the JWT only, so fetch the actual user.
    const user = res.user
      ? normalizeUser(res.user)
      : normalizeUser(await request("GET", "/auth/me", { token: res.access_token }));

    return { ...res, token: res.access_token, user };
  },

  registerCustomer: async (body) => {
    const res = normalizeAuthResponse(
      await request("POST", "/auth/register/customer", { body: customerRegistrationBody(body) }),
    );

    const user = res.user
      ? normalizeUser(res.user)
      : res.access_token
        ? normalizeUser(await request("GET", "/auth/me", { token: res.access_token }))
        : null;

    return {
      ...res,
      token: res.access_token,
      user,
    };
  },

  registerProfessional: async (body) => {
    const res = normalizeAuthResponse(
      await request("POST", "/auth/register/professional", { body: professionalRegistrationBody(body) }),
    );

    const user = res.user
      ? normalizeUser(res.user)
      : res.access_token
        ? normalizeUser(await request("GET", "/auth/me", { token: res.access_token }))
        : null;

    return {
      ...res,
      token: res.access_token,
      user,
    };
  },

  me: async (token) => normalizeUser(await request("GET", "/auth/me", { token })),

  professionals: async (token) =>
    normalizeList(await request("GET", "/professionals", { token }), normalizeProfessional),

  search: async (query = {}) => {
    const data = await request("GET", "/search", {
      query: {
        q: query.q,
        category: query.category ?? query.service,
        city: query.city,
        state: query.state,
        min_rate: query.min_rate,
        max_rate: query.max_rate,
      },
    });

    let list = normalizeList(data, normalizeProfessional);

    // Backend currently exposes rate/category/city/state filters.
    // Rating and UI sorting are applied here because they are presentation filters.
    if (query.min_rating) {
      list = list.filter((p) => p.rating >= Number(query.min_rating));
    }

    if (query.sort === "price_asc") list.sort((a, b) => a.price_from - b.price_from);
    else if (query.sort === "price_desc") list.sort((a, b) => b.price_from - a.price_from);
    else if (query.sort === "experience") list.sort((a, b) => b.experience_years - a.experience_years);
    else list.sort((a, b) => b.rating - a.rating || b.reviews_count - a.reviews_count);

    return list;
  },

  professional: async (id) =>
    normalizeProfessional(await request("GET", `/professionals/${id}`)),

  uploadDocuments: (token, formData) =>
    request("POST", "/upload-documents", { token, formData }),

  updateProfessionalProfile: async (token, body) =>
    normalizeProfessional(await request("PATCH", "/professionals/me/profile", { token, body })),

  createBooking: async (token, body) => {
    // UI fields: date + slot + address.
    // Backend fields: booking_date + start_time + duration_hours + address.
    const slot = String(body.slot ?? "").trim();
    const match = slot.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);

    let start_time = body.start_time;
    let duration_hours = body.duration_hours;

    if (!start_time && match) {
      start_time = `${match[1].padStart(2, "0")}:${match[2]}`;
    }

    if (!duration_hours && match) {
      const start = Number(match[1]) + Number(match[2]) / 60;
      const end = Number(match[3]) + Number(match[4]) / 60;
      duration_hours = end - start;
    }

    const payload = {
      professional_id: Number(body.professional_id),
      booking_date: body.booking_date ?? body.date,
      start_time,
      duration_hours: Number(duration_hours ?? 2),
      description: body.description ?? "Home service request",
      address: body.address ?? "",
      city: body.city ?? "",
      state: body.state ?? "",
      pincode: body.pincode ?? "",
    };

    return normalizeBooking(await request("POST", "/bookings", { token, body: payload }));
  },

  myBookings: async (token, role = "customer") => {
    const path = role === "professional" ? "/bookings/professional" : "/bookings/my";
    return normalizeList(await request("GET", path, { token }), normalizeBooking);
  },

  professionalBookings: async (token) =>
    normalizeList(await request("GET", "/bookings/professional", { token }), normalizeBooking),

  booking: async (token, id) =>
    normalizeBooking(await request("GET", `/bookings/${id}`, { token })),

  acceptBooking: async (token, id) =>
    normalizeBooking(await request("PATCH", `/bookings/${id}/accept`, { token })),

  rejectBooking: async (token, id, reason) =>
    normalizeBooking(await request("PATCH", `/bookings/${id}/reject`, {
      token,
      body: { reason },
    })),

  completeBooking: async (token, id) =>
    normalizeBooking(await request("PATCH", `/bookings/${id}/complete`, { token })),

  cancelBooking: async (token, id) =>
    normalizeBooking(await request("PATCH", `/bookings/${id}/cancel`, { token })),

  verifyProfessional: async (token, id, verified) =>
    normalizeProfessional(
      await request("PATCH", `/admin/professional/${id}/verify`, {
        token,
        body: { verified },
      }),
    ),

  pendingProfessionals: async (token) =>
    normalizeList(await request("GET", "/admin/professional/pending", { token }), normalizeProfessional),

  adminBookings: async (token) =>
    normalizeList(await request("GET", "/admin/bookings", { token }), normalizeBooking),

  createReview: async (token, body) => {
    // Backend review API intentionally uses booking_id, not a client-supplied professional_id.
    const payload = {
      booking_id: Number(body.booking_id),
      rating: Number(body.rating),
      comment: body.comment ?? "",
    };

    return normalizeReview(await request("POST", "/reviews", { token, body: payload }));
  },

  reviews: async (professionalId) =>
    normalizeList(
      await request("GET", `/professionals/${professionalId}/reviews`),
      normalizeReview,
    ),

  rating: async (professionalId) =>
    normalizeRating(await request("GET", `/professionals/${professionalId}/rating`)),

  notifications: async (token) =>
    normalizeList(await request("GET", "/notification", { token }), normalizeNotification),

  markRead: async (token, id) =>
    normalizeNotification(await request("PATCH", `/notification/${id}/read`, { token })),

  troubleshoot: async (issue) =>
    await request("POST", "/ai/troubleshoot", { body: { problem: issue } }),

  dbTest: () => request("GET", "/db-test"),
};
