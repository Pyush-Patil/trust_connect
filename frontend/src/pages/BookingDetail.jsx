import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Button, EmptyState, Icon, Skeleton, StatusBadge } from "../components/ui";

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function BookingDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { user, token, booting, toast } = useApp();
  const [booking, setBooking] = useState(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setFailed(false);
    api.booking(token, id).then(setBooking).catch(() => setFailed(true));
  }, [id, token]);

  useEffect(load, [load]);

  if (booting) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-12"><Skeleton className="h-8 w-48" /><Skeleton className="h-80 w-full rounded-2xl" /></div>;
  if (!user || !token) return <Navigate to={`/auth?next=/booking/${id}`} replace />;
  if (failed) return <div className="mx-auto max-w-3xl px-4 py-20"><EmptyState icon="alert" title="Booking not found" desc="This booking could not be loaded or you are not allowed to view it." action={<Link to="/dashboard"><Button variant="outline">Back to dashboard</Button></Link>} /></div>;
  if (!booking) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-12"><Skeleton className="h-8 w-48" /><Skeleton className="h-80 w-full rounded-2xl" /></div>;

  async function update(action) {
    setBusy(true);
    try {
      if (action === "accept") await api.acceptBooking(token, booking.id);
      if (action === "cancel") await api.cancelBooking(token, booking.id);
      toast(action === "accept" ? "Booking accepted." : "Booking cancelled.");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update booking.", "error");
    } finally {
      setBusy(false);
    }
  }

  const isProfessional = user.role === "professional";
  const otherParty = isProfessional ? booking.customer_name : booking.professional_name;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-ink"><Icon name="arrowLeft" className="h-4 w-4" /> Back to dashboard</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-muted">GET /bookings/{booking.id}</p>
          <h1 className="mt-1 text-3xl font-extrabold">Booking details</h1>
          <p className="mt-1 text-sm text-muted">{otherParty} · {booking.service}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <section className="mt-7 rounded-2xl border border-line bg-paper p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Booking ID", booking.id],
            [isProfessional ? "Customer" : "Professional", otherParty],
            ["Service", booking.service],
            ["Date", fmtDate(booking.date)],
            ["Time", `${booking.slot} · ${booking.duration_hours}h`],
            ["Service address", booking.address],
            ["City", [booking.city, booking.state, booking.pincode].filter(Boolean).join(", ") || "Not provided"],
            ["Total amount", `₹${booking.total_amount || booking.amount}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-line p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1.5 text-[14px] font-semibold text-soft">{value || "Not provided"}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-line p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Request description</p>
          <p className="mt-1.5 text-sm leading-relaxed text-soft">{booking.description || "No description provided."}</p>
        </div>
        {booking.rejection_reason && (
          <div className="mt-4 rounded-xl border border-danger/25 bg-danger/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-danger">Rejection reason</p>
            <p className="mt-1.5 text-sm text-danger">{booking.rejection_reason}</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          {isProfessional && booking.status === "pending" && <Button loading={busy} onClick={() => void update("accept")}><Icon name="check" className="h-4 w-4" /> Accept booking</Button>}
          {!isProfessional && booking.status === "pending" && <Button variant="danger" loading={busy} onClick={() => void update("cancel")}>Cancel booking</Button>}
          <Link to={`/professional/${booking.professional_id}`}><Button variant="outline">View professional</Button></Link>
        </div>
      </section>
    </main>
  );
}
