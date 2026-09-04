import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useApp } from "../context/AppContext";
import { SLOTS } from "../lib/types";
import { ServiceIcon } from "../components/cards";
import { Button, EmptyState, Field, Icon, Initials, Modal, Skeleton, Stars, Textarea } from "../components/ui";
import { cn } from "../utils/cn";

const fmtDay = (d, i) => ({
  iso: d.toISOString().slice(0, 10),
  top: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
  sub: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
});

export default function ProfessionalDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { user, token, toast, reloadNotifications } = useApp();

  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState(null);
  const [failed, setFailed] = useState(false);

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(SLOTS[1]);
  const [address, setAddress] = useState("");
  const [booking, setBooking] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => fmtDay(new Date(Date.now() + i * 864e5), i)), []);

  const load = useCallback(() => {
    setPro(null);
    setReviews(null);
    setRating(null);
    setFailed(false);
    Promise.all([api.professional(id), api.reviews(id), api.rating(id)])
      .then(([p, r, g]) => {
        setPro(p);
        setReviews(r);
        setRating(g);
        setDate((d) => d || new Date(Date.now() + 864e5).toISOString().slice(0, 10));
      })
      .catch(() => setFailed(true));
  }, [id]);

  useEffect(load, [load]);

  if (failed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          icon="alert"
          title="Professional not found"
          desc="This profile may have been removed, or the ID in the link is wrong."
          action={<Link to="/services"><Button variant="outline">Browse professionals</Button></Link>}
        />
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  async function book() {
    if (!pro.is_available) {
      toast(pro.available_from ? `This professional is available ${new Date(pro.available_from).toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" })}.` : "This professional is currently unavailable.", "info");
      return;
    }
    if (!user || !token) {
      nav(`/auth?next=/professional/${id}`);
      return;
    }
    setBooking(true);
    try {
      const b = await api.createBooking(token, {
        professional_id: id,
        date,
        slot,
        address,
        description: `${pro.service} service request`,
      });
      toast(`Booking ${b.id} sent to ${pro.name}. Track it in your dashboard.`);
      await reloadNotifications();
      nav("/dashboard");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not create the booking.", "error");
    } finally {
      setBooking(false);
    }
  }

  async function submitReview() {
    if (!token) return;
    setSavingReview(true);
    try {
      const bookings = await api.myBookings(token, user?.role);
      const completedBooking = bookings.find(
        (b) =>
          String(b.professional_id) === String(id) &&
          String(b.status).toLowerCase() === "completed",
      );

      if (!completedBooking) {
        toast("You can review this professional after a completed booking.", "info");
        return;
      }

      await api.createReview(token, {
        booking_id: completedBooking.id,
        rating: myRating,
        comment,
      });
      toast("Review published. Thank you!");
      setReviewOpen(false);
      setComment("");
      setMyRating(5);
      const [r, g] = await Promise.all([api.reviews(id), api.rating(id)]);
      setReviews(r);
      setRating(g);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not publish the review.", "error");
    } finally {
      setSavingReview(false);
    }
  }

  const maxBar = rating ? Math.max(1, ...Object.values(rating.breakdown).map(Number)) : 1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted transition-colors hover:text-ink">
        <Icon name="arrowLeft" className="h-4 w-4" /> All professionals
      </Link>

      {pro.status !== "verified" && (
        <div className="anim-fade-in mt-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13.5px] text-warning">
          <Icon name="alert" className="mt-0.5 h-4 w-4" />
          <p>
            <span className="font-bold">Verification in progress.</span> This application is awaiting admin review
            (<span className="font-mono text-[12px]">PATCH /admin/professional/{"{id}"}/verify</span>), so bookings are disabled.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ---------------- left ---------------- */}
        <div className="space-y-6">
          <section className="anim-fade-up rounded-2xl border border-line bg-paper p-6">
            <div className="flex flex-wrap items-start gap-5">
              {pro.avatar_url ? (
                <img src={pro.avatar_url} alt={pro.name} className="h-24 w-24 rounded-2xl border border-line object-cover" />
              ) : (
                <Initials name={pro.name} className="h-24 w-24 text-2xl" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold">{pro.name}</h1>
                  {pro.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success">
                      <Icon name="badgeCheck" className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-muted">
                  <ServiceIcon service={pro.service} className="h-4 w-4" />
                  {pro.service} · {pro.city}
                </p>
                <p className={cn("mt-3 inline-flex items-center gap-2 text-[13px] font-bold", pro.is_available ? "text-success" : "text-warning")}>
                  <span className={cn("h-2 w-2 rounded-full", pro.is_available ? "bg-success" : "bg-warning")} />
                  {pro.is_available ? "Available now" : pro.available_from ? `Available ${new Date(pro.available_from).toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "Currently unavailable"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-soft">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Icon name="star" filled className="h-4 w-4 text-ink" />
                    {pro.rating > 0 ? pro.rating.toFixed(1) : "New"}
                    <span className="font-normal text-muted">({pro.reviews_count} reviews)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4 text-muted" />{pro.experience_years} yrs experience</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-4 w-4 text-muted" />{pro.jobs_done.toLocaleString("en-IN")} jobs</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="phone" className="h-4 w-4 text-muted" />{pro.languages.join(", ")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="anim-fade-up d1 rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-bold">About</h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-soft">{pro.bio}</p>
            <h3 className="mt-6 text-[13px] font-bold uppercase tracking-wider text-muted">Skills & services</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {pro.skills.map((s) => (
                <span key={s} className="rounded-full border border-line bg-shell px-3 py-1.5 text-[12.5px] font-semibold text-soft">
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section className="anim-fade-up d2 rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-bold">Verification & documents</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["shield", "ID verified", "Government ID matched"],
                ["badgeCheck", "Background check", "Police verification done"],
                ["doc", `${pro.documents.length} documents`, "On file with admin"],
              ].map(([icon, t, d]) => (
                <div key={t} className="flex gap-3 rounded-xl border border-line p-3.5">
                  <Icon name={icon} className="mt-0.5 h-4.5 w-4.5 text-success" />
                  <div>
                    <p className="text-[13px] font-bold">{t}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            {pro.documents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pro.documents.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-shell px-2.5 py-1 font-mono text-[11px] text-soft">
                    <Icon name="doc" className="h-3 w-3" /> {d}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="anim-fade-up d3 rounded-2xl border border-line bg-paper p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">Reviews</h2>
              {user && user.role === "customer" && (
                <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
                  <Icon name="plus" className="h-3.5 w-3.5" /> Write a review
                </Button>
              )}
            </div>

            {rating && (
              <div className="mt-5 grid gap-6 border-b border-line pb-6 sm:grid-cols-[auto_1fr]">
                <div className="text-center sm:pr-8">
                  <p className="font-display text-5xl font-extrabold">{rating.average > 0 ? rating.average.toFixed(1) : "—"}</p>
                  <Stars value={rating.average} className="mt-2 justify-center" starClass="h-4 w-4" />
                  <p className="mt-1.5 font-mono text-[11px] text-muted">{rating.count} ratings</p>
                </div>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = Number(rating.breakdown[star] ?? 0);
                    return (
                      <div key={star} className="flex items-center gap-3 text-[12px]">
                        <span className="w-8 font-mono text-muted">{star}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-shell">
                          <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${(n / maxBar) * 100}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-muted">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <ul className="mt-6 space-y-6">
              {reviews === null ? (
                <li className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </li>
              ) : reviews.length === 0 ? (
                <li><EmptyState icon="star" title="No reviews yet" desc="Be the first to review this professional after a completed booking." /></li>
              ) : (
                reviews.map((r) => (
                  <li key={r.id} className="flex gap-4">
                    <Initials name={r.customer_name} className="h-10 w-10 shrink-0 text-xs" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[13.5px] font-bold">{r.customer_name}</p>
                        <Stars value={r.rating} />
                        <span className="font-mono text-[11px] text-muted">
                          {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-soft">{r.comment}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* ---------------- booking card ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="anim-fade-up d2 rounded-2xl border border-line bg-paper p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl font-extrabold">₹{pro.price_from}</p>
              <p className="text-[12px] font-medium text-muted">starting price · pay after service</p>
            </div>

            <div className="mt-5">
              <p className="text-[13px] font-bold">Pick a day</p>
              <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => setDate(d.iso)}
                    className={cn(
                      "shrink-0 rounded-xl border px-3 py-2 text-center transition-colors",
                      date === d.iso ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/40",
                    )}
                  >
                    <span className="block text-[12px] font-bold">{d.top}</span>
                    <span className={cn("block font-mono text-[10.5px]", date === d.iso ? "text-paper/70" : "text-muted")}>{d.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[13px] font-bold">Time slot</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 font-mono text-[11.5px] font-medium transition-colors",
                      slot === s ? "border-ink bg-ink text-paper" : "border-line text-soft hover:border-ink/40",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <Field label="Service address">
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no, street, locality, city…"
                />
              </Field>
            </div>

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
              <div className="flex justify-between text-soft"><span>Service from</span><span className="font-semibold">₹{pro.price_from}</span></div>
              <div className="flex justify-between text-soft"><span>Booking fee</span><span className="font-semibold">₹49</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-bold"><span>To pay now</span><span>₹0</span></div>
            </div>

            <Button full size="lg" className="mt-5" loading={booking} disabled={pro.status !== "verified" || !pro.is_available} onClick={() => void book()}>
              {!booking && <Icon name="calendar" className="h-4 w-4" />} Book this professional
            </Button>
            {!pro.is_available && <p className="mt-2 text-center text-[12px] font-medium text-warning">Bookings are unavailable until this professional is available.</p>}
            <p className="mt-3 text-center font-mono text-[10.5px] text-muted">POST /bookings · auth required</p>
          </div>
        </aside>
      </div>

      {/* ---------------- review modal ---------------- */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`Review ${pro.name}`}>
        <p className="text-[13.5px] text-muted">Your review is published to <span className="font-mono text-[12px]">POST /reviews</span> and updates this profile's rating instantly.</p>
        <div className="mt-5 flex items-center justify-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onMouseEnter={() => setHoverRating(i)}
              onClick={() => setMyRating(i)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              className="p-1 transition-transform hover:scale-110"
            >
              <Icon name="star" filled={(hoverRating || myRating) >= i} className={cn("h-7 w-7", (hoverRating || myRating) >= i ? "text-ink" : "text-line")} />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-muted">{myRating}/5</p>
        <div className="mt-4">
          <Field label="Your experience">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Punctuality, quality of work, cleanliness…" />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" full onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button full loading={savingReview} onClick={() => void submitReview()}>Publish review</Button>
        </div>
      </Modal>
    </div>
  );
}
