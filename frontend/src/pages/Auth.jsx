import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useApp } from "../context/AppContext";
import { CITIES, SERVICES } from "../lib/types";
import { Logo } from "../components/Layout";
import { Button, Field, Icon, Input, Select, Textarea } from "../components/ui";
import { cn } from "../utils/cn";

const DEMO = [
  { label: "Customer", email: "anya@demo.in" },
  { label: "Professional", email: "ravi@demo.in" },
  { label: "Admin", email: "admin@trustconnect.in" },
];

export default function Auth() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user, login, adoptSession, toast } = useApp();

  const initial = params.get("mode") === "professional" ? "professional" : params.get("mode") === "register" ? "customer" : "login";
  const [tab, setTab] = useState(initial);
  const next = params.get("next") ?? "/dashboard";

  const [form, setForm] = useState({ city: "Bengaluru", service: SERVICES[0], experience_years: "3", price_from: "299" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);

  if (user) return <Navigate to={next} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fail = (e) => setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(form.email ?? "", form.password ?? "");
      toast(`Welcome back, ${u.first_name}!`);
      nav(next);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function onCustomer(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.registerCustomer(form);
      adoptSession(res.token, res.user);
      toast("Account created. Welcome to trust_connect!");
      nav(next);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function onProfessionalStep1(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.registerProfessional(form);
      adoptSession(res.token, res.user);
      setBusy(false);
      setStep(2);
    } catch (err) {
      fail(err);
      setBusy(false);
    }
  }

  async function onUpload() {
    setError("");
    if (!files.length) {
      setError("Attach at least one document (ID, certificate or licence).");
      return;
    }
    setBusy(true);
    try {
      const t = localStorage.getItem("trust_connect_token");
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      await api.uploadDocuments(t ?? "", fd);
      toast("Documents uploaded — verification usually takes 48 hours.");
      setStep(3);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-[5fr_6fr]">
      {/* -------- brand panel -------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            One account for every home service, in both directions.
          </h2>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-paper/60">
            Book verified professionals as a customer, or grow your own service business as a professional — same login, different toolkit.
          </p>
          <ul className="mt-8 space-y-3 text-[13.5px] font-medium text-paper/80">
            {["No advance payments for visits", "Documents stay encrypted with admin", "Ratings you own, reviews you can answer"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-paper/25"><Icon name="check" className="h-3 w-3" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-paper/40">
          POST /auth/login · POST /auth/register/customer · POST /auth/register/professional
        </p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-paper/10" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full border border-paper/5" />
      </aside>

      {/* -------- forms -------- */}
      <section className="px-4 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-md">
          <div className="lg:hidden"><Logo /></div>

          {step < 3 && (
            <>
              <div className="mt-6 flex rounded-xl border border-line bg-shell p-1 lg:mt-0">
                {[["login", "Log in"], ["customer", "Join as customer"], ["professional", "Join as professional"]].map(([t, l]) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-2 text-[12.5px] font-bold transition-all",
                      tab === t ? "bg-paper text-ink shadow-card" : "text-muted hover:text-ink",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <h1 className="mt-8 text-2xl font-extrabold">
                {tab === "login" ? "Welcome back" : tab === "customer" ? "Create your customer account" : "Grow your service business"}
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {tab === "login"
                  ? "Log in to book, track and review services."
                  : tab === "customer"
                    ? "Two minutes to set up, a lifetime of sorted weekends."
                    : "Step 1 of 2 — your details. Documents come next."}
              </p>

              {error && (
                <div className="anim-fade-in mt-5 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] font-medium text-danger">
                  <Icon name="alert" className="mt-0.5 h-4 w-4" /> {error}
                </div>
              )}

              {tab === "login" && (
                <form onSubmit={onLogin} className="mt-6 space-y-4">
                  <Field label="Email"><Input type="email" required value={form.email ?? ""} onChange={set("email")} placeholder="you@example.com" /></Field>
                  <Field label="Password"><Input type="password" required value={form.password ?? ""} onChange={set("password")} placeholder="••••••••" /></Field>
                  <Button type="submit" full size="lg" loading={busy}>Log in</Button>
                  <div className="rounded-xl border border-dashed border-line bg-shell/60 p-3.5">
                    <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted">Demo accounts · password demo123</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DEMO.map((d) => (
                        <button
                          type="button"
                          key={d.email}
                          onClick={() => setForm((f) => ({ ...f, email: d.email, password: "demo123" }))}
                          className="rounded-full border border-line bg-paper px-3 py-1 text-[12px] font-bold text-soft transition-colors hover:border-ink/40 hover:text-ink"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {tab === "customer" && (
                <form onSubmit={onCustomer} className="mt-6 space-y-4">
                  <Field label="Full name"><Input required value={form.name ?? ""} onChange={set("name")} placeholder="Ananya Sharma" /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email"><Input type="email" required value={form.email ?? ""} onChange={set("email")} placeholder="you@example.com" /></Field>
                    <Field label="Phone"><Input required value={form.phone ?? ""} onChange={set("phone")} placeholder="+91 …" /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City">
                      <Select value={form.city} onChange={set("city")}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
                    </Field>
                    <Field label="Password" hint="min 6 chars"><Input type="password" required minLength={6} value={form.password ?? ""} onChange={set("password")} placeholder="••••••••" /></Field>
                  </div>
                  <Button type="submit" full size="lg" loading={busy}>Create account</Button>
                </form>
              )}

              {tab === "professional" && step === 1 && (
                <form onSubmit={onProfessionalStep1} className="mt-6 space-y-4">
                  <Field label="Full name"><Input required value={form.name ?? ""} onChange={set("name")} placeholder="Ravi Kumar" /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email"><Input type="email" required value={form.email ?? ""} onChange={set("email")} placeholder="you@example.com" /></Field>
                    <Field label="Phone"><Input required value={form.phone ?? ""} onChange={set("phone")} placeholder="+91 …" /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City">
                      <Select value={form.city} onChange={set("city")}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
                    </Field>
                    <Field label="Primary service">
                      <Select value={form.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</Select>
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Experience (yrs)"><Input type="number" min={0} max={50} value={form.experience_years} onChange={set("experience_years")} /></Field>
                    <Field label="Price from (₹)"><Input type="number" min={49} step={50} value={form.price_from} onChange={set("price_from")} /></Field>
                    <Field label="Password" hint="min 6"><Input type="password" required minLength={6} value={form.password ?? ""} onChange={set("password")} placeholder="••••••••" /></Field>
                  </div>
                  <Field label="Short bio"><Textarea value={form.bio ?? ""} onChange={set("bio")} placeholder="What do you specialise in? Tools you carry? Areas you cover?" /></Field>
                  <Button type="submit" full size="lg" loading={busy}>Continue to documents</Button>
                </form>
              )}

              {tab === "professional" && step === 2 && (
                <div className="mt-6">
                  <div
                    className="rounded-2xl border border-dashed border-line bg-shell/60 p-8 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFiles((f) => [...f, ...Array.from(e.dataTransfer.files)]);
                    }}
                  >
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line bg-paper"><Icon name="doc" /></span>
                    <p className="mt-3 text-sm font-bold">Drop documents here</p>
                    <p className="mt-1 text-[12.5px] text-muted">Aadhaar / ID, trade certificate, licence — PDF, JPG or PNG</p>
                    <label className="mt-4 inline-flex cursor-pointer">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? [])])}
                      />
                      <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-[13px] font-bold transition-colors hover:border-ink/40">
                        <Icon name="plus" className="h-4 w-4" /> Choose files
                      </span>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <li key={f.name + i} className="flex items-center gap-3 rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[13px]">
                          <Icon name="doc" className="h-4 w-4 text-muted" />
                          <span className="flex-1 truncate font-medium">{f.name}</span>
                          <span className="font-mono text-[11px] text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                          <button onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label={`Remove ${f.name}`}>
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {error && (
                    <div className="anim-fade-in mt-4 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] font-medium text-danger">
                      <Icon name="alert" className="mt-0.5 h-4 w-4" /> {error}
                    </div>
                  )}
                  <div className="mt-5 flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button full loading={busy} onClick={() => void onUpload()}>Upload & submit application</Button>
                  </div>
                  <p className="mt-3 text-center font-mono text-[10.5px] text-muted">POST /upload-documents · multipart/form-data</p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <div className="anim-pop mt-10">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-paper"><Icon name="badgeCheck" className="h-7 w-7" /></span>
              <h1 className="mt-5 text-2xl font-extrabold">Application submitted</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Our admin team reviews documents within 48 hours. You'll get a notification the moment your profile goes live.
              </p>
              <ol className="mt-7 space-y-4">
                {[
                  ["Application created", "done"],
                  ["Documents received", "done"],
                  ["Admin verification", "active"],
                  ["Profile live for bookings", "todo"],
                ].map(([label, state]) => (
                  <li key={label} className="flex items-center gap-3 text-[13.5px] font-semibold">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full border",
                        state === "done" && "border-ink bg-ink text-paper",
                        state === "active" && "border-ink text-ink",
                        state === "todo" && "border-line text-muted",
                      )}
                    >
                      {state === "done" ? <Icon name="check" className="h-3 w-3" /> : state === "active" ? <span className="live-dot h-1.5 w-1.5 rounded-full bg-ink" /> : <span className="h-1.5 w-1.5 rounded-full bg-line" />}
                    </span>
                    <span className={state === "todo" ? "text-muted" : ""}>{label}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex gap-2">
                <Link to="/dashboard" className="flex-1"><Button full>Go to dashboard</Button></Link>
                <Link to="/services" className="flex-1"><Button variant="outline" full>Browse marketplace</Button></Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
