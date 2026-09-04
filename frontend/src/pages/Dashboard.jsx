import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Button, EmptyState, Field, Icon, Initials, Input, Modal, Skeleton, StatusBadge, Textarea } from "../components/ui";
import { cn } from "../utils/cn";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function Dashboard() {
  const { user, token, booting, toast, reloadNotifications, logout, conn } = useApp();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const tab = params.get("tab") || "bookings";

  const [bookings, setBookings] = useState(null);
  const [notifs, setNotifs] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [profileForm, setProfileForm] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [governmentId, setGovernmentId] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const loadBookings = useCallback(() => {
    if (!token) return;
    setBookings(null);
    api.myBookings(token, user.role).then(setBookings).catch((e) => {
      toast(e instanceof ApiError ? e.message : "Could not load bookings.", "error");
      setBookings([]);
    });
  }, [token, toast]);

  const loadNotifs = useCallback(() => {
    if (!token) return;
    setNotifs(null);
    api.notifications(token).then(setNotifs).catch(() => setNotifs([]));
  }, [token]);

  useEffect(() => {
    if (tab === "bookings") loadBookings();
    if (tab === "notifications") loadNotifs();
  }, [tab, loadBookings, loadNotifs]);

  useEffect(() => {
    if (tab !== "profile" || !user || user.role !== "professional" || !user.professional_id) return;
    api.professional(user.professional_id).then((profile) => setProfileForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_no: user.phone_no ?? "",
      bio: profile.bio ?? "",
      hourly_rate: profile.hourly_rate ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      pincode: profile.pincode ?? "",
    })).catch(() => toast("Could not load your professional profile.", "error"));
  }, [tab, user, toast]);

  if (booting) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }
  if (!user || !token) return <Navigate to="/auth?next=/dashboard" replace />;

  function setTab(t) {
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p, { replace: true });
  }

  async function doCancel() {
    if (!cancelTarget || !token) return;
    setBusy(true);
    try {
      await api.cancelBooking(token, cancelTarget.id);
      toast(`Booking ${cancelTarget.id} cancelled.`);
      setCancelTarget(null);
      loadBookings();
      await reloadNotifications();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not cancel.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function decideBooking(action, booking) {
    if (!token) return;
    setBusy(true);
    try {
      if (action === "accept") {
        await api.acceptBooking(token, booking.id);
        toast(`Booking ${booking.id} accepted.`);
      } else {
        const reason = rejectionReason.trim();
        if (!reason) {
          toast("Please enter a reason for rejecting this booking.", "error");
          return;
        }
        await api.rejectBooking(token, booking.id, reason);
        toast(`Booking ${booking.id} rejected.`, "info");
        setRejectTarget(null);
        setRejectionReason("");
      }
      loadBookings();
      await reloadNotifications();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update booking.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function doReview() {
    if (!reviewTarget || !token) return;
    setBusy(true);
    try {
      await api.createReview(token, { booking_id: reviewTarget.id, rating: myRating, comment });
      toast("Review published — thank you!");
      setReviewTarget(null);
      setComment("");
      setMyRating(5);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not publish review.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function markRead(n) {
    if (!token || n.read) return;
    const optimistic = (notifs ?? []).map((x) => (x.id === n.id ? { ...x, read: true } : x));
    setNotifs(optimistic);
    try {
      await api.markRead(token, n.id);
      await reloadNotifications();
    } catch {
      setNotifs((cur) => (cur ?? []).map((x) => (x.id === n.id ? { ...x, read: false } : x)));
    }
  }

  async function markAll() {
    if (!token || !notifs) return;
    const unread = notifs.filter((n) => !n.read);
    if (!unread.length) return;
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
    try {
      await Promise.all(unread.map((n) => api.markRead(token, n.id)));
      await reloadNotifications();
      toast("All notifications marked as read.");
    } catch {
      loadNotifs();
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileBusy(true);
    try {
      await api.updateProfessionalProfile(token, {
        ...profileForm,
        hourly_rate: Number(profileForm.hourly_rate),
      });
      toast("Profile updated successfully.");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update profile.", "error");
    } finally {
      setProfileBusy(false);
    }
  }

  async function uploadProfileFiles() {
    if (!profilePhoto || !governmentId) {
      toast("Choose both a profile photo and government ID.", "error");
      return;
    }
    setProfileBusy(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", profilePhoto);
      formData.append("government_id", governmentId);
      await api.uploadDocuments(token, formData);
      toast("Photo and document uploaded successfully.");
      setProfilePhoto(null);
      setGovernmentId(null);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not upload files.", "error");
    } finally {
      setProfileBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-muted">GET /auth/me</p>
          <h1 className="mt-1 text-3xl font-extrabold">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {user.role === "customer" && "Track bookings, answer rating requests and manage your profile."}
            {user.role === "professional" && "Bookings customers place with you will appear here."}
            {user.role === "admin" && "You're signed in as an admin — verification queue is in the console."}
          </p>
        </div>
        {user.role === "admin" && (
          <Link to="/admin"><Button variant="outline"><Icon name="shield" className="h-4 w-4" /> Open admin console</Button></Link>
        )}
      </header>

      <div className="mt-8 flex gap-1 border-b border-line">
        {[["bookings", "Bookings", "calendar"], ["notifications", "Notifications", "bell"], ["profile", "Profile", "user"]].map(([t, l, icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[13.5px] font-bold transition-colors",
              tab === t ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            <Icon name={icon} className="h-4 w-4" /> {l}
          </button>
        ))}
      </div>

      {/* ---------------- bookings ---------------- */}
      {tab === "bookings" && (
        <div className="mt-6 space-y-4">
          {bookings === null ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
          ) : bookings.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={user.role === "professional" ? "No bookings received yet" : "No bookings yet"}
              desc={user.role === "professional" ? "Once admin verifies your profile, customers can book you." : "Your next great home service is one search away."}
              action={user.role === "customer" ? <Link to="/services"><Button>Browse professionals</Button></Link> : undefined}
            />
          ) : (
            bookings.map((b, i) => (
              <article key={b.id} className="anim-fade-up rounded-2xl border border-line bg-paper p-5 transition-shadow hover:shadow-card" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex cursor-pointer items-start gap-4" onClick={() => nav(`/booking/${b.id}`)} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") nav(`/booking/${b.id}`); }}>
                    <Initials name={b.professional_name} className="h-12 w-12 text-sm" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link to={`/professional/${b.professional_id}`} onClick={(e) => e.stopPropagation()} className="font-display text-[15px] font-bold hover:underline">
                          {user.role === "professional" ? `${b.customer_name} · ${b.service}` : b.professional_name}
                        </Link>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-muted">{b.id} · booked {fmtDate(b.created_at)}</p>
                      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-soft">
                        <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="h-3.5 w-3.5 text-muted" />{fmtDate(b.date)}</span>
                        <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5 text-muted" />{b.slot}</span>
                        <span className="inline-flex items-center gap-1.5"><Icon name="pin" className="h-3.5 w-3.5 text-muted" />{b.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold">₹{b.amount}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {b.status === "pending" && user.role === "professional" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => void decideBooking("accept", b)}>Accept</Button>
                          <Button size="sm" variant="danger" onClick={() => setRejectTarget(b)}>Reject</Button>
                        </>
                      )}
                      {b.status === "pending" && user.role === "customer" && (
                        <Button size="sm" variant="danger" onClick={() => setCancelTarget(b)}>Cancel</Button>
                      )}
                      {b.status === "completed" && user.role === "customer" && (
                        <Button size="sm" variant="outline" onClick={() => setReviewTarget(b)}>
                          <Icon name="star" className="h-3.5 w-3.5" /> Review
                        </Button>
                      )}
                      {user.role === "customer" && b.status !== "cancelled" && (
                        <Link to={`/professional/${b.professional_id}`}><Button size="sm" variant="ghost">Rebook</Button></Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
          {bookings !== null && bookings.length > 0 && user.role === "customer" && (
            <p className="pt-1 text-center font-mono text-[10.5px] text-muted">GET /bookings · PATCH /bookings/{"{id}"}/cancel · POST /reviews</p>
          )}
        </div>
      )}

      {/* ---------------- notifications ---------------- */}
      {tab === "notifications" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{notifs === null ? "Loading…" : `${notifs.filter((n) => !n.read).length} unread`}</p>
            <Button size="sm" variant="outline" onClick={() => void markAll()} disabled={!notifs?.some((n) => !n.read)}>
              <Icon name="check" className="h-3.5 w-3.5" /> Mark all as read
            </Button>
          </div>
          <ul className="mt-4 space-y-2.5">
            {notifs === null ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : notifs.length === 0 ? (
              <li><EmptyState icon="bell" title="Nothing here yet" desc="Booking updates and verification news will land in this inbox." /></li>
            ) : (
              notifs.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => void markRead(n)}
                    className={cn(
                      "flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-colors",
                      n.read ? "border-line bg-paper" : "border-ink/20 bg-shell hover:border-ink/35",
                    )}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "live-dot bg-ink")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-[13.5px] font-bold">{n.title}</span>
                        <span className="font-mono text-[10.5px] text-muted">{fmtDate(n.created_at)}</span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-soft">{n.message}</span>
                    </span>
                    {!n.read && <Icon name="chevronRight" className="mt-1 h-4 w-4 text-muted" />}
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="mt-4 text-center font-mono text-[10.5px] text-muted">GET /notification · PATCH /notification/{"{id}"}/read</p>
        </div>
      )}

      {/* ---------------- profile ---------------- */}
      {tab === "profile" && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-line bg-paper p-6">
            <div className="flex items-center gap-4">
              <Initials name={user.name} className="h-16 w-16 text-lg" />
              <div>
                <h2 className="font-display text-lg font-bold">{user.name}</h2>
                <p className="text-sm text-muted">{user.email}</p>
                <span className="mt-1.5 inline-block rounded-full border border-ink/15 bg-ink/5 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide">{user.role}</span>
              </div>
            </div>
            {user.role === "professional" && profileForm ? (
              <form onSubmit={saveProfile} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name"><Input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} required /></Field>
                  <Field label="Last name"><Input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} required /></Field>
                </div>
                <Field label="Phone"><Input value={profileForm.phone_no} onChange={(e) => setProfileForm({ ...profileForm, phone_no: e.target.value })} required /></Field>
                <Field label="Bio"><Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hourly rate"><Input type="number" min="0" value={profileForm.hourly_rate} onChange={(e) => setProfileForm({ ...profileForm, hourly_rate: e.target.value })} required /></Field>
                  <Field label="Pincode"><Input value={profileForm.pincode} onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })} required /></Field>
                </div>
                <Field label="Address"><Textarea value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} required /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City"><Input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} required /></Field>
                  <Field label="State"><Input value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} required /></Field>
                </div>
                <Button type="submit" loading={profileBusy}><Icon name="check" className="h-4 w-4" /> Save profile</Button>
              </form>
            ) : (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Phone", user.phone || "—"],
                ["City", user.city || "—"],
                ["Member since", user.created_at ? fmtDate(user.created_at) : "—"],
                ["User ID", user.id],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line p-3.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="mt-1 text-[13.5px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            )}
            {user.role === "professional" && (
              <div className="mt-6 border-t border-line pt-5">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted">Photo and documents</h3>
                <div className="mt-3 space-y-3 text-[13px]">
                  <label className="block font-semibold text-soft">Profile photo<Input type="file" accept="image/*" className="mt-1" onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)} /></label>
                  <label className="block font-semibold text-soft">Government ID<Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1" onChange={(e) => setGovernmentId(e.target.files?.[0] ?? null)} /></label>
                </div>
                <Button className="mt-4" variant="outline" loading={profileBusy} onClick={() => void uploadProfileFiles()}>Upload files</Button>
              </div>
            )}
            <Button
              variant="danger"
              className="mt-6"
              onClick={() => {
                logout();
                toast("Signed out.", "info");
                nav("/");
              }}
            >
              <Icon name="logout" className="h-4 w-4" /> Sign out
            </Button>
          </section>
          <aside className="rounded-2xl border border-line bg-shell/70 p-5">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted">API connection</h3>
            <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-soft">
              mode: {conn.forceDemo ? "demo (forced)" : conn.base ? conn.status : "demo"}
              <br />
              base: {conn.base || "—"}
              <br />
              token: {token.slice(0, 10)}…
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Change the backend URL or inspect the endpoint map from the header pill or footer.
            </p>
          </aside>
        </div>
      )}

      {/* ---------------- modals ---------------- */}
      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancel this booking?">
        {cancelTarget && (
          <>
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-bold text-ink">{cancelTarget.id}</span> with {cancelTarget.professional_name} on {fmtDate(cancelTarget.date)}, {cancelTarget.slot}.
              Any payment made will be refunded in 3–5 working days.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" full onClick={() => setCancelTarget(null)}>Keep booking</Button>
              <Button variant="danger" full loading={busy} onClick={() => void doCancel()}>Cancel booking</Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} title="Reject this booking?">
        {rejectTarget && (
          <>
            <p className="text-sm leading-relaxed text-muted">
              Tell the customer why booking <span className="font-bold text-ink">{rejectTarget.id}</span> cannot be accepted.
            </p>
            <div className="mt-4">
              <Field label="Reason">
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="For example: unavailable at this time"
                  required
                />
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" full onClick={() => setRejectTarget(null)}>Keep booking</Button>
              <Button variant="danger" full loading={busy} onClick={() => void decideBooking("reject", rejectTarget)}>Reject booking</Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title={`Rate ${reviewTarget?.professional_name ?? ""}`}>
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setMyRating(i)} className="p-1 transition-transform hover:scale-110" aria-label={`${i} stars`}>
              <Icon name="star" filled={myRating >= i} className={cn("h-7 w-7", myRating >= i ? "text-ink" : "text-line")} />
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Comment">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the service?" />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" full onClick={() => setReviewTarget(null)}>Cancel</Button>
          <Button full loading={busy} onClick={() => void doReview()}>Publish</Button>
        </div>
      </Modal>
    </div>
  );
}
