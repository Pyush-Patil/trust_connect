/**
 * Plain-JS constants (no TypeScript types/interfaces — JSDoc only, optional).
 *
 * Shapes for reference (previously TS interfaces):
 *
 * User: { id, name, email, phone?, role: "customer"|"professional"|"admin", city?, professional_id?, created_at? }
 * Professional: { id, user_id?, name, service, skills[], city, experience_years, price_from, rating,
 *   reviews_count, jobs_done, verified, status: "pending"|"verified"|"rejected", bio, avatar_url?,
 *   documents[], languages[], breakdown: { [star]: count }, created_at? }
 * Booking: { id, customer_id, customer_name, professional_id, professional_name, service, date, slot,
 *   address, amount, status: "pending"|"confirmed"|"completed"|"cancelled", created_at }
 * Review: { id, professional_id, customer_id?, customer_name, rating, comment, created_at }
 * RatingSummary: { average, count, breakdown }
 * AppNotification: { id, user_id, title, message, read, created_at }
 * AiReply: { answer, steps[] }
 */

export const SERVICES = [
  "AC & Appliance",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painting",
  "Deep Cleaning",
];

export const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kochi",
];

export const SLOTS = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];
