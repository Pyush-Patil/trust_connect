/* ------------------------------------------------------------------ */
/*  Error type                                                         */
/* ------------------------------------------------------------------ */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const uid = (p) => p + Math.random().toString(36).slice(2, 8);

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */
const P = (
  id,
  user_id,
  name,
  service,
  city,
  experience_years,
  price_from,
  jobs_done,
  status,
  bio,
  skills,
  languages,
  avatar_url,
  breakdown,
  documents = [],
) => {
  const count = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const sum = Object.entries(breakdown).reduce((a, [k, v]) => a + Number(k) * v, 0);
  return {
    id, user_id, name, service, city, experience_years, price_from, jobs_done,
    status, bio, skills, languages, avatar_url, documents, breakdown,
    verified: status === "verified",
    reviews_count: count,
    rating: count ? Math.round((sum / count) * 10) / 10 : 0,
    created_at: daysAgo(200),
  };
};

const img = (id, w = 600, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

function seed() {
  const users = [
    { id: "u_cust", name: "Ananya Sharma", email: "anya@demo.in", phone: "+91 98450 11223", role: "customer", city: "Bengaluru", password: "demo123", created_at: daysAgo(420) },
    { id: "u_pro", name: "Ravi Kumar", email: "ravi@demo.in", phone: "+91 99020 44551", role: "professional", city: "Bengaluru", professional_id: "p1", password: "demo123", created_at: daysAgo(600) },
    { id: "u_admin", name: "trust_connect Admin", email: "admin@trustconnect.in", role: "admin", password: "demo123", created_at: daysAgo(900) },
  ];

  const professionals = [
    P("p1", "u_pro", "Ravi Kumar", "Electrician", "Bengaluru", 8, 299, 1240, "verified",
      "Licensed electrician handling wiring, switchboard upgrades, inverter setup and fan/light installations. I carry my own testing kit and leave the workspace cleaner than I found it.",
      ["Switchboard & wiring", "Inverter setup", "Fan / light installation", "Short-circuit repair"],
      ["Hindi", "English", "Kannada"], img(9271168), { 5: 176, 4: 28, 3: 7, 2: 2, 1: 1 },
      ["Aadhaar ID", "Electrician licence", "Background check"]),

    P("p3", undefined, "Imran Sheikh", "Plumber", "Hyderabad", 10, 249, 1510, "verified",
      "Plumber with a decade of experience in leak detection, bathroom fittings, jet-machine cleaning and water tank maintenance. Same-day emergency slots available.",
      ["Leakage repair", "Bathroom fittings", "Jet machine cleaning", "Water tank service"],
      ["Hindi", "Telugu", "Urdu"], img(7752850), { 5: 118, 4: 27, 3: 8, 2: 2, 1: 1 },
      ["Aadhaar ID", "Trade certificate", "Background check"]),
    P("p4", undefined, "Lakshmi Iyer", "Deep Cleaning", "Chennai", 5, 399, 860, "verified",
      "Deep-cleaning specialist for kitchens, bathrooms and full homes. Trained on eco-safe chemicals, steam machines and post-renovation cleanup protocols.",
      ["Full-home deep clean", "Kitchen & bathroom", "Sofa & carpet shampoo", "Post-renovation cleanup"],
      ["Tamil", "English"], img(27603433), { 5: 160, 4: 30, 3: 9, 2: 3, 1: 1 },
      ["Aadhaar ID", "Training certificate", "Background check"]),
    P("p5", undefined, "Gurpreet Singh", "Carpenter", "Delhi", 12, 349, 720, "verified",
      "Carpenter for furniture repair, door fitting, modular kitchen adjustments and polishing. I bring clamps, drills and patience in equal measure.",
      ["Furniture repair", "Door & hinge fitting", "Modular kitchen", "Polish & laminate"],
      ["Hindi", "Punjabi", "English"], img(5528969), { 5: 72, 4: 18, 3: 6, 2: 1, 1: 1 },
      ["Aadhaar ID", "Trade certificate", "Background check"]),

    P("p7", undefined, "Dinesh Verma", "AC & Appliance", "Pune", 7, 399, 1105, "verified",
      "HVAC technician for AC installation, jet-pump service and gas top-up, plus refrigerator and washing-machine repairs. Genuine spares with 90-day warranty.",
      ["AC service & install", "Gas top-up", "Refrigerator repair", "Washing machine repair"],
      ["Hindi", "Marathi"], img(7752846), { 5: 108, 4: 24, 3: 7, 2: 2, 1: 1 },
      ["Aadhaar ID", "HVAC certificate", "Background check"]),

    P("p9", undefined, "Suresh Pillai", "Painting", "Mumbai", 9, 599, 410, "verified",
      "Painter for interior repainting, exterior coats, waterproofing and texture finishes. Clean masking, spray machines and daily progress photos.",
      ["Interior repainting", "Exterior paint", "Waterproofing", "Texture finish"],
      ["Hindi", "Marathi", "Malayalam"], img(7752820), { 5: 55, 4: 14, 3: 5, 2: 1, 1: 1 },
      ["Aadhaar ID", "Trade certificate", "Background check"]),
    P("p10", undefined, "Vikram Rao", "Electrician", "Pune", 3, 199, 0, "pending",
      "Smart-home friendly electrician — CCTV, video door phones, smart switches and network cabling alongside regular electrical work.",
      ["Smart switches", "CCTV installation", "Network cabling", "Wiring"],
      ["Hindi", "Marathi", "English"], "", { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ["Aadhaar ID", "Electrician licence"]),
    P("p11", undefined, "Sandeep Kulkarni", "Deep Cleaning", "Pune", 4, 349, 0, "pending",
      "Two-person deep-cleaning crew with steam machines and eco-safe chemicals. Specialists in move-in / move-out and post-renovation cleanup.",
      ["Full-home deep clean", "Move-in / move-out", "Post-renovation cleanup", "Water tank cleaning"],
      ["Hindi", "Marathi"], "", { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ["Aadhaar ID", "Agency registration"]),
  ];

  const R = (id, professional_id, customer_name, rating, comment, d, customer_id) =>
    ({ id, professional_id, customer_id, customer_name, rating, comment, created_at: daysAgo(d) });

  const reviews = [
    R("r1", "p1", "Ananya Sharma", 5, "Fixed a stubborn short circuit in under an hour and explained what went wrong. Very tidy work.", 5, "u_cust"),
    R("r2", "p1", "Kunal Mehta", 5, "Punctual, carried all tools, replaced my switchboard neatly. Fair pricing.", 12),
    R("r3", "p1", "Divya R", 4, "Good work overall, arrived 20 minutes late but communicated clearly.", 26),
    R("r4", "p5", "Priya Nambiar", 5, "Rebuilt a sagging wardrobe and re-fitted every hinge in one visit. Superb finish.", 9),
    R("r7", "p3", "Rohit Desai", 5, "Found a leak two other plumbers missed. Jet-cleaned the bathroom too.", 7),
    R("r8", "p3", "Sana K", 4, "Solid repair work on the tap and flush tank. Recommended.", 30),
    R("r9", "p4", "Ananya Sharma", 5, "The kitchen looks brand new. Two-person team, finished ahead of schedule.", 18, "u_cust"),
    R("r10", "p4", "Meera J", 5, "Thorough deep clean, sofa shampoo included, and the team rechecked every room before leaving.", 33),
    R("r11", "p9", "Nandita P", 5, "Repainted our hall with zero mess — masking and drop cloths everywhere.", 6),
    R("r13", "p7", "Ananya Sharma", 4, "AC service was good, gas top-up priced slightly above estimate but explained beforehand.", 3, "u_cust"),
    R("r14", "p7", "Vivek T", 5, "Fridge compressor issue fixed same day with warranty paper. Great.", 15),
    R("r15", "p4", "Gayathri V", 5, "Kitchen grout looks white again after two years. Steam-machine magic.", 11),
    R("r16", "p9", "Farhan Q", 4, "Repainted two bedrooms in three days, masking was careful.", 28),
  ];

  const B = (id, customer_id, customer_name, professional_id, professional_name, service, date, slot, address, amount, status, created) =>
    ({ id, customer_id, customer_name, professional_id, professional_name, service, date, slot, address, amount, status, created_at: daysAgo(created) });

  const bookings = [
    B("BK-2401", "u_cust", "Ananya Sharma", "p1", "Ravi Kumar", "Electrician", daysAgo(6).slice(0, 10), "11:00 – 13:00", "221B, 4th Cross, Indiranagar, Bengaluru", 348, "completed", 8),
    B("BK-2402", "u_cust", "Ananya Sharma", "p5", "Gurpreet Singh", "Carpenter", daysAhead(1), "11:00 – 13:00", "221B, 4th Cross, Indiranagar, Bengaluru", 398, "confirmed", 2),
    B("BK-2403", "u_cust", "Ananya Sharma", "p7", "Dinesh Verma", "AC & Appliance", daysAhead(2), "15:00 – 17:00", "221B, 4th Cross, Indiranagar, Bengaluru", 448, "pending", 1),
    B("BK-2396", "u_kunal", "Kunal Mehta", "p4", "Lakshmi Iyer", "Deep Cleaning", daysAgo(3).slice(0, 10), "09:00 – 11:00", "14, Lotus Apts, Koramangala, Bengaluru", 448, "completed", 5),
    B("BK-2398", "u_priya", "Priya Nambiar", "p3", "Imran Sheikh", "Plumber", daysAhead(1), "17:00 – 19:00", "8-2-293, Jubilee Hills, Hyderabad", 298, "confirmed", 2),
    B("BK-2390", "u_rohit", "Rohit Desai", "p9", "Suresh Pillai", "Painting", daysAgo(2).slice(0, 10), "13:00 – 15:00", "Panampilly Nagar, Kochi", 648, "cancelled", 6),
  ];

  const notifications = [
    { id: "n1", user_id: "u_cust", title: "Booking confirmed", message: "Gurpreet Singh will arrive tomorrow for your Carpenter booking (BK-2402), 11:00 – 13:00.", read: false, created_at: daysAgo(1) },
    { id: "n2", user_id: "u_cust", title: "Rating request", message: "How was your Electrician service with Ravi Kumar? Leave a review to help neighbours choose.", read: false, created_at: daysAgo(4) },
    { id: "n3", user_id: "u_cust", title: "Welcome to trust_connect", message: "Your account is ready. Book verified professionals across 7 cities.", read: true, created_at: daysAgo(420) },
    { id: "n4", user_id: "u_pro", title: "Payout scheduled", message: "₹1,240 for BK-2401 will be credited to your account on Friday.", read: false, created_at: daysAgo(2) },
  ];

  return { users, professionals, bookings, reviews, notifications };
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */
const KEY = "trust_connect_db_v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const db = seed();
  persist(db);
  return db;
}

function persist(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
}

export function resetMockDb() {
  const db = seed();
  persist(db);
}

/* ------------------------------------------------------------------ */
/*  AI troubleshoot rules                                              */
/* ------------------------------------------------------------------ */
function aiReply(issue) {
  const t = issue.toLowerCase();
  if (/(ac|cool|fridge|refriger|washing machine|appliance)/.test(t))
    return {
      answer: "Appliance issues are usually one of three things: power, airflow or gas. Here's how to narrow it down before your technician arrives.",
      steps: [
        "Check the wall socket with another device to rule out a power fault.",
        "For ACs: clean the filter mesh and make sure the outdoor unit is not blocked.",
        "For fridges: confirm the door seal closes flat and the thermostat is at 3–4°C.",
        "Note any error code on the display — it speeds up the repair visit.",
        "If cooling is still weak, book an AC & Appliance professional; gas top-ups need certified tools.",
      ],
    };
  if (/(pay|refund|upi|charge|price|bill)/.test(t))
    return {
      answer: "Payments on trust_connect are collected after the service is complete. Refunds for cancelled bookings follow a simple timeline.",
      steps: [
        "Open Dashboard → Bookings and check the booking status.",
        "Cancelled bookings refund to the original payment method in 3–5 working days.",
        "Advance booking fees (₹49) are waived if the professional cancels.",
        "If a refund is delayed beyond 5 days, share the booking ID with support.",
      ],
    };
  if (/(late|not arrived|no show|didn'?t come|delay)/.test(t))
    return {
      answer: "Sorry about the wait — here's what you can do right now.",
      steps: [
        "Check the booking card for the professional's latest status update.",
        "Grace period is 30 minutes past the slot start.",
        "Beyond 30 minutes you can cancel free of cost from the booking card.",
        "Rebook instantly — priority slots open for affected customers.",
      ],
    };
  if (/(electric|spark|switch|power|shock|wiring)/.test(t))
    return {
      answer: "Electrical faults can be unsafe to touch. Please follow these precautions first.",
      steps: [
        "Switch off the main MCB for the affected room immediately.",
        "Do not touch wet walls or exposed wiring near the fault.",
        "Unplug sensitive devices on the same circuit.",
        "Book an Electrician and mention 'spark/short circuit' so we assign an emergency slot.",
      ],
    };
  if (/(book|reschedul|cancel|slot|time)/.test(t))
    return {
      answer: "Bookings can be managed entirely from your dashboard until 2 hours before the slot.",
      steps: [
        "Go to Dashboard → Bookings to view live status.",
        "Pending and confirmed bookings can be cancelled free of cost.",
        "To reschedule, cancel and rebook — your address is prefilled.",
        "Completed bookings accept reviews for 30 days.",
      ],
    };
  return {
    answer: "Thanks for describing the issue. Based on similar cases, here's a safe starting checklist while we route you to the right professional.",
    steps: [
      "Note when the issue started and what changed around that time.",
      "Take one photo or short video of the problem area.",
      "Search the matching service and pick a verified professional with 4.5★ or above.",
      "Mention these details in the booking address notes so the pro arrives prepared.",
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Mock router                                                        */
/* ------------------------------------------------------------------ */
const pub = (u) => {
  const { password: _pw, ...rest } = u;
  return rest;
};

function recompute(p) {
  const count = Object.values(p.breakdown).reduce((a, b) => a + b, 0);
  const sum = Object.entries(p.breakdown).reduce((a, [k, v]) => a + Number(k) * v, 0);
  p.reviews_count = count;
  p.rating = count ? Math.round((sum / count) * 10) / 10 : 0;
}

export async function mockRequest(method, rawPath, opts = {}) {
  await sleep(160 + Math.random() * 300);
  const db = load();
  const path = rawPath.split("?")[0].replace(/\/+$/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const q = opts.query ?? {};
  const body = opts.body ?? {};
  const token = opts.token ?? null;

  const requireUser = () => {
    const u = db.users.find((x) => "usk_" + x.id === token);
    if (!u) throw new ApiError(401, "Not authenticated. Please log in.");
    return u;
  };
  const requireAdmin = () => {
    const u = requireUser();
    if (u.role !== "admin") throw new ApiError(403, "Admin access required.");
    return u;
  };
  const notify = (user_id, title, message) => {
    db.notifications.unshift({ id: uid("n"), user_id, title, message, read: false, created_at: new Date().toISOString() });
  };

  /* ---------------- Authentication ---------------- */
  if (method === "POST" && path === "/auth/login") {
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const u = db.users.find((x) => x.email.toLowerCase() === email);
    if (!u || u.password !== password) throw new ApiError(401, "Invalid email or password.");
    return { token: "usk_" + u.id, user: pub(u) };
  }
  if (method === "POST" && path === "/auth/register/customer") {
    const name = String(body.name ?? `${body.first_name ?? ""} ${body.last_name ?? ""}`).trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!name || !email || password.length < 6) throw new ApiError(422, "Name, email and a 6+ character password are required.");
    if (db.users.some((x) => x.email.toLowerCase() === email)) throw new ApiError(409, "An account with this email already exists.");
    const u = { id: uid("u"), name, email, phone: String(body.phone ?? body.phone_no ?? ""), role: "customer", city: String(body.city ?? ""), password, created_at: new Date().toISOString() };
    db.users.push(u);
    notify(u.id, "Welcome to trust_connect", "Your account is ready. Book verified professionals across 7 cities.");
    persist(db);
    return { token: "usk_" + u.id, user: pub(u) };
  }
  if (method === "POST" && path === "/auth/register/professional") {
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!name || !email || password.length < 6) throw new ApiError(422, "Name, email and a 6+ character password are required.");
    if (db.users.some((x) => x.email.toLowerCase() === email)) throw new ApiError(409, "An account with this email already exists.");
    const proId = uid("p");
    const u = { id: uid("u"), name, email, phone: String(body.phone ?? ""), role: "professional", city: String(body.city ?? ""), professional_id: proId, password, created_at: new Date().toISOString() };
    db.users.push(u);
    db.professionals.push(
      P(proId, u.id, name, String(body.service ?? "Electrician"), String(body.city ?? ""), Number(body.experience_years ?? 0), Number(body.price_from ?? 199), 0, "pending",
        String(body.bio ?? ""), Array.isArray(body.skills) ? body.skills : [], ["Hindi", "English"], "", { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }),
    );
    notify(u.id, "Application received", "Upload your documents — our team verifies applications within 48 hours.");
    persist(db);
    return { token: "usk_" + u.id, user: pub(u) };
  }
  if (method === "GET" && path === "/auth/me") {
    return pub(requireUser());
  }

  /* ---------------- Professionals ---------------- */
  if (method === "GET" && path === "/professionals") {
    requireUser();
    return db.professionals.filter((p) => p.status === "verified");
  }
  if (method === "GET" && path === "/search") {
    let list = db.professionals.filter((p) => p.status === "verified");
    const term = String(q.q ?? "").toLowerCase().trim();
    if (term)
      list = list.filter((p) =>
        [p.name, p.service, p.city, ...p.skills].join(" ").toLowerCase().includes(term),
      );
    if (q.service || q.category) list = list.filter((p) => p.service === (q.service ?? q.category));
    if (q.city) list = list.filter((p) => p.city === q.city);
    if (q.min_rating) list = list.filter((p) => p.rating >= Number(q.min_rating));
    const sort = q.sort ?? "rating";
    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return a.price_from - b.price_from;
      if (sort === "price_desc") return b.price_from - a.price_from;
      if (sort === "experience") return b.experience_years - a.experience_years;
      return b.rating - a.rating || b.reviews_count - a.reviews_count;
    });
    return list;
  }
  if (method === "GET" && seg[0] === "professionals" && seg.length === 2) {
    const p = db.professionals.find((x) => x.id === seg[1]);
    if (!p) throw new ApiError(404, "Professional not found.");
    return p;
  }
  if (method === "POST" && path === "/upload-documents") {
    const u = requireUser();
    let names = [];
    if (opts.formData) {
      names = opts.formData.getAll("files").map((f) => (f instanceof File ? f.name : String(f)));
    } else if (Array.isArray(body.documents)) {
      names = body.documents;
    }
    if (!names.length) throw new ApiError(422, "Attach at least one document.");
    let pro = db.professionals.find((x) => x.user_id === u.id);
    if (!pro) {
      const proId = uid("p");
      u.professional_id = proId;
      pro = P(proId, u.id, u.name, "Electrician", u.city ?? "", 0, 199, 0, "pending", "", [], ["Hindi"], "", { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      db.professionals.push(pro);
    }
    pro.documents = Array.from(new Set([...pro.documents, ...names]));
    persist(db);
    return { message: "Documents uploaded successfully.", documents: pro.documents };
  }

  /* ---------------- Bookings ---------------- */
  if (method === "POST" && path === "/bookings") {
    const u = requireUser();
    const pro = db.professionals.find((x) => x.id === String(body.professional_id));
    if (!pro) throw new ApiError(404, "Professional not found.");
    if (pro.status !== "verified") throw new ApiError(409, "This professional is not open for bookings yet.");
    if (!(body.date ?? body.booking_date) || !(body.slot ?? body.start_time) || !String(body.address ?? "").trim()) throw new ApiError(422, "Date, slot and address are required.");
    const booking = {
      id: "BK-" + (2400 + db.bookings.length + 1),
      customer_id: u.id,
      customer_name: u.name,
      professional_id: pro.id,
      professional_name: pro.name,
      service: pro.service,
      date: String(body.date ?? body.booking_date),
      slot: String(body.slot ?? body.start_time),
      address: String(body.address),
      amount: pro.price_from + 49,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    db.bookings.unshift(booking);
    notify(u.id, "Booking request sent", `${pro.name} (${pro.service}) on ${booking.date}, ${booking.slot}. You'll be notified once confirmed.`);
    persist(db);
    return booking;
  }
  if (method === "GET" && (path === "/bookings" || path === "/bookings/my" || path === "/bookings/professional")) {
    const u = requireUser();
    let list;
    if (u.role === "professional" || path === "/bookings/professional") {
      list = db.bookings.filter((b) => b.professional_id === u.professional_id);
    } else {
      list = db.bookings.filter((b) => b.customer_id === u.id);
    }
    return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  if (method === "PATCH" && seg[0] === "bookings" && seg[2] === "cancel") {
    const u = requireUser();
    const b = db.bookings.find((x) => x.id === seg[1]);
    if (!b) throw new ApiError(404, "Booking not found.");
    if (b.customer_id !== u.id && u.role !== "admin") throw new ApiError(403, "Not your booking.");
    if (b.status !== "pending" && b.status !== "confirmed") throw new ApiError(409, "Only pending or confirmed bookings can be cancelled.");
    b.status = "cancelled";
    notify(u.id, "Booking cancelled", `${b.id} with ${b.professional_name} was cancelled. Any payment will be refunded in 3–5 days.`);
    persist(db);
    return b;
  }

  if (method === "PATCH" && seg[0] === "bookings" && ["accept", "reject", "complete"].includes(seg[2])) {
    const u = requireUser();
    const b = db.bookings.find((x) => x.id === seg[1]);
    if (!b) throw new ApiError(404, "Booking not found.");

    if (u.role !== "professional" || b.professional_id !== u.professional_id) {
      throw new ApiError(403, "Not your booking.");
    }

    if (seg[2] === "accept") {
      if (b.status !== "pending") throw new ApiError(409, "Only pending bookings can be accepted.");
      b.status = "confirmed";
    } else if (seg[2] === "reject") {
      if (b.status !== "pending") throw new ApiError(409, "Only pending bookings can be rejected.");
      b.status = "rejected";
      b.rejection_reason = String(body.rejection_reason ?? "");
    } else {
      if (b.status !== "confirmed" && b.status !== "accepted") {
        throw new ApiError(409, "Only accepted bookings can be completed.");
      }
      b.status = "completed";
    }

    persist(db);
    return b;
  }

  /* ---------------- Admin ---------------- */
  if (method === "PATCH" && seg[0] === "admin" && seg[1] === "professional" && seg[3] === "verify") {
    requireAdmin();
    const pro = db.professionals.find((x) => x.id === seg[2]);
    if (!pro) throw new ApiError(404, "Professional not found.");
    const ok = Boolean(body.verified);
    pro.verified = ok;
    pro.status = ok ? "verified" : "rejected";
    if (pro.user_id) {
      notify(pro.user_id, ok ? "You're verified ✅" : "Application update",
        ok ? "Congratulations! Your profile is live and open for bookings." : "We couldn't verify your documents. Support will contact you.");
    }
    persist(db);
    return pro;
  }
  if (method === "GET" && path === "/admin/professional/pending") {
    requireAdmin();
    return db.professionals.filter((p) => p.status === "pending");
  }
  if (method === "GET" && path === "/admin/bookings") {
    requireAdmin();
    return [...db.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  /* ---------------- Reviews ---------------- */
  if (method === "POST" && path === "/reviews") {
    const u = requireUser();
    const booking = body.booking_id
      ? db.bookings.find((x) => x.id === String(body.booking_id))
      : null;
    const pro = booking
      ? db.professionals.find((x) => x.id === String(booking.professional_id))
      : db.professionals.find((x) => x.id === String(body.professional_id));
    if (!pro) throw new ApiError(404, "Professional not found.");
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) throw new ApiError(422, "Rating must be between 1 and 5.");
    const review = {
      id: uid("r"),
      booking_id: booking?.id,
      professional_id: pro.id,
      customer_id: u.id,
      customer_name: u.name,
      rating,
      comment: String(body.comment ?? "").trim() || "Rated the service.",
      created_at: new Date().toISOString(),
    };
    db.reviews.unshift(review);
    pro.breakdown[rating] = (pro.breakdown[rating] ?? 0) + 1;
    recompute(pro);
    persist(db);
    return review;
  }
  if (method === "GET" && seg[0] === "professionals" && seg[2] === "reviews") {
    return db.reviews
      .filter((r) => r.professional_id === seg[1])
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  if (method === "GET" && seg[0] === "professionals" && seg[2] === "rating") {
    const pro = db.professionals.find((x) => x.id === seg[1]);
    if (!pro) throw new ApiError(404, "Professional not found.");
    return { average: pro.rating, count: pro.reviews_count, breakdown: pro.breakdown };
  }

  /* ---------------- Notifications ---------------- */
  if (method === "GET" && path === "/notification") {
    const u = requireUser();
    return db.notifications
      .filter((n) => n.user_id === u.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  if (method === "PATCH" && seg[0] === "notification" && seg[2] === "read") {
    const u = requireUser();
    const n = db.notifications.find((x) => x.id === seg[1]);
    if (!n) throw new ApiError(404, "Notification not found.");
    if (n.user_id !== u.id) throw new ApiError(403, "Not your notification.");
    n.read = true;
    persist(db);
    return n;
  }

  /* ---------------- AI & default ---------------- */
  if (method === "POST" && path === "/ai/troubleshoot") {
    const issue = String(body.issue ?? body.problem ?? "").trim();
    if (!issue) throw new ApiError(422, "Describe the issue first.");
    return aiReply(issue);
  }
  if (method === "GET" && path === "/db-test") {
    return {
      status: "ok",
      store: "mock-store",
      professionals: db.professionals.length,
      bookings: db.bookings.length,
      server_time: new Date().toISOString(),
    };
  }

  throw new ApiError(404, `No route for ${method} ${path}`);
}
