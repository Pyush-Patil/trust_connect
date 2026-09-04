import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Button, EmptyState, Icon, Initials, Modal, Skeleton, StatusBadge } from "../components/ui";
import { ServiceIcon } from "../components/cards";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Admin() {
  const { user, token, booting, toast } = useApp();
  const [pending, setPending] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [verifiedCount, setVerifiedCount] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = useCallback(() => {
    if (!token) return;
    setPending(null);
    setBookings(null);
    api.pendingProfessionals(token).then(setPending).catch((e) => {
      toast(e instanceof ApiError ? e.message : "Could not load queue.", "error");
      setPending([]);
    });
    api.adminBookings(token).then(setBookings).catch(() => setBookings([]));
    api.search({}).then((l) => setVerifiedCount(l.length)).catch(() => setVerifiedCount(0));
  }, [token, toast]);

  useEffect(load, [load]);

  if (booting) return <div className="mx-auto w-full max-w-6xl px-4 py-12"><Skeleton className="h-10 w-72" /><Skeleton className="mt-6 h-24 w-full rounded-2xl" /></div>;
  if (!user || !token) return <Navigate to="/auth?next=/admin" replace />;
  if (user.role !== "admin") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          icon="lock"
          title="Admin access required"
          desc="This console is behind PATCH/GET /admin/* routes. Log in with the admin demo account (admin@trustconnect.in · demo123) to review verification queues."
          action={<Link to="/auth"><Button>Switch account</Button></Link>}
        />
      </div>
    );
  }

  async function decide(pro, ok) {
    if (!token) return;
    setBusyId(pro.id + (ok ? "y" : "n"));
    try {
      await api.verifyProfessional(token, pro.id, ok);
      toast(ok ? `${pro.name} is now verified and live.` : `${pro.name}'s application was rejected.`, ok ? "success" : "info");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Action failed.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const revenue = (bookings ?? []).filter((b) => b.status === "completed").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="font-mono text-[11px] text-muted">GET /admin/professional/pending · GET /admin/bookings</p>
        <h1 className="mt-1 text-3xl font-extrabold">Admin console</h1>
        <p className="mt-1.5 text-sm text-muted">Verify applications, watch the booking flow, keep the marketplace trustworthy.</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-y-6 rounded-2xl border border-line bg-shell/70 px-6 py-6 md:grid-cols-4">
        {[
          [pending === null ? "…" : String(pending.length), "applications pending"],
          [verifiedCount === null ? "…" : String(verifiedCount), "verified professionals"],
          [bookings === null ? "…" : String(bookings.length), "total bookings"],
          [`₹${revenue.toLocaleString("en-IN")}`, "completed revenue"],
        ].map(([v, l], i) => (
          <div key={l} className={i > 0 ? "md:border-l md:border-line md:pl-6" : ""}>
            <p className="font-display text-2xl font-extrabold">{v}</p>
            <p className="mt-1 text-[12.5px] font-medium text-muted">{l}</p>
          </div>
        ))}
      </div>

      {/* ---------- verification queue ---------- */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Verification queue</h2>
          <Button size="sm" variant="outline" onClick={load}><Icon name="refresh" className="h-3.5 w-3.5" /> Refresh</Button>
        </div>
        <div className="mt-4 space-y-3">
          {pending === null ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : pending.length === 0 ? (
            <EmptyState icon="badgeCheck" title="Queue is clear" desc="Every application has been reviewed. New registrations will appear here instantly." />
          ) : (
            pending.map((p, i) => (
              <article key={p.id} className="anim-fade-up rounded-2xl border border-line bg-paper p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.name} className="h-14 w-14 rounded-xl border border-line object-cover" />
                    ) : (
                      <Initials name={p.name} className="h-14 w-14 text-sm" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-display text-[15px] font-bold">{p.name}</h3>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                        <ServiceIcon service={p.service} className="h-4 w-4" />
                        {p.service} · {p.city} · {p.experience_years} yrs · from ₹{p.price_from}
                      </p>
                      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-soft">{p.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.documents.map((d) => (
                          <span key={d} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-shell px-2.5 py-1 font-mono text-[11px] text-soft">
                            <Icon name="doc" className="h-3 w-3" /> {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReviewTarget(p)}>
                      <Icon name="user" className="h-3.5 w-3.5" /> Review profile
                    </Button>
                    <Button
                      size="sm"
                      loading={busyId === p.id + "n"}
                      variant="danger"
                      disabled={busyId !== null}
                      onClick={() => void decide(p, false)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      loading={busyId === p.id + "y"}
                      disabled={busyId !== null}
                      onClick={() => void decide(p, true)}
                    >
                      <Icon name="badgeCheck" className="h-3.5 w-3.5" /> Verify
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <p className="mt-3 font-mono text-[10.5px] text-muted">PATCH /admin/professional/{"{professional_id}"}/verify · {"{ verified: boolean }"}</p>
      </section>

      <Modal open={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title="Review professional profile">
        {reviewTarget && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              {reviewTarget.avatar_url ? (
                <img src={reviewTarget.avatar_url} alt={reviewTarget.name} className="h-24 w-24 rounded-xl border border-line object-cover" />
              ) : (
                <Initials name={reviewTarget.name} className="h-24 w-24 text-xl" />
              )}
              <div>
                <h3 className="font-display text-xl font-bold">{reviewTarget.name}</h3>
                <p className="mt-1 text-sm text-muted">{reviewTarget.email}</p>
                <p className="mt-1 text-sm text-muted">{reviewTarget.phone_no}</p>
                <StatusBadge status={reviewTarget.status} />
              </div>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Category", reviewTarget.service],
                ["Experience", `${reviewTarget.experience_years} years`],
                ["Hourly rate", `₹${reviewTarget.price_from}`],
                ["Location", `${reviewTarget.city}, ${reviewTarget.state}`],
                ["Pincode", reviewTarget.pincode || "Not provided"],
                ["Address", reviewTarget.address || "Not provided"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-line p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="mt-1 font-semibold text-soft">{value}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">About</h4>
              <p className="mt-1 text-sm leading-relaxed text-soft">{reviewTarget.bio || "No bio provided."}</p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {reviewTarget.government_id ? (
                <a href={reviewTarget.government_id} target="_blank" rel="noreferrer"><Button variant="outline"><Icon name="doc" className="h-4 w-4" /> View government ID</Button></a>
              ) : (
                <p className="text-sm text-warning">Government ID not uploaded.</p>
              )}
              <Button variant="outline" onClick={() => setReviewTarget(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- bookings ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">All bookings</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[760px] border-collapse bg-paper text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-shell/70 text-[11px] uppercase tracking-wider text-muted">
                {["Booking", "Customer", "Professional", "Service", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings === null ? (
                <tr><td colSpan={7} className="px-4 py-8"><Skeleton className="h-16 w-full" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No bookings in the system yet.</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0 transition-colors hover:bg-shell/60">
                    <td className="px-4 py-3.5 font-mono text-[12px] font-medium">{b.id}</td>
                    <td className="px-4 py-3.5 font-semibold">{b.customer_name}</td>
                    <td className="px-4 py-3.5">
                      <Link to={`/professional/${b.professional_id}`} className="font-semibold underline-offset-2 hover:underline">{b.professional_name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-soft">{b.service}</td>
                    <td className="px-4 py-3.5 text-soft">{fmtDate(b.date)}<span className="block font-mono text-[11px] text-muted">{b.slot}</span></td>
                    <td className="px-4 py-3.5 font-bold">₹{b.amount}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
