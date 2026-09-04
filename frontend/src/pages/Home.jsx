import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SERVICES } from "../lib/types";
import { ProfessionalCard, ProCardSkeleton, SERVICE_IMAGES, SERVICE_META } from "../components/cards";
import { Button, Icon, Reveal, Stars } from "../components/ui";

const px = (id, w, h) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const HERO_MAIN = px(7647233, 1100, 850);
const HERO_SMALL = px(7641347, 500, 500);
const HOW_IMG = px(5591908, 900, 620);
const BAND_IMG = px(5974275, 1000, 760);

const STEPS = [
  {
    n: "01",
    title: "Search your service",
    text: "Pick from six service lines, tell us your city and choose a slot that fits your day — mornings to evenings.",
  },
  {
    n: "02",
    title: "Choose a verified pro",
    text: "Every professional is ID-checked and background-verified. Compare ratings, reviews, experience and transparent starting prices.",
  },
  {
    n: "03",
    title: "Relax at home",
    text: "Your pro arrives on time with the right tools. Pay after the service is done, then rate the experience for your neighbours.",
  },
];

export default function Home() {
  const nav = useNavigate();
  const [service, setService] = useState("");
  const [q, setQ] = useState("");
  const [pros, setPros] = useState(null);

  useEffect(() => {
    let alive = true;
    api.search({ sort: "rating" }).then((list) => alive && setPros(list)).catch(() => alive && setPros([]));
    return () => {
      alive = false;
    };
  }, []);

  const top = useMemo(() => (pros ?? []).slice(0, 4), [pros]);
  const counts = useMemo(() => {
    const m = {};
    (pros ?? []).forEach((p) => (m[p.service] = (m[p.service] ?? 0) + 1));
    return m;
  }, [pros]);

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (q.trim()) params.set("q", q.trim());
    nav(`/services?${params.toString()}`);
  }

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="border-b border-line bg-shell">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div>
            <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 font-mono text-[11px] font-medium text-muted">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
              GET /search · {pros === null ? "…" : pros.length} verified pros live near you
            </p>
            <h1 className="anim-fade-up d1 mt-5 text-[38px] font-extrabold leading-[1.04] sm:text-[52px]">
              Trusted pros for every corner of your home.
            </h1>
            <p className="anim-fade-up d2 mt-5 max-w-md text-[15.5px] leading-relaxed text-muted">
              Electricians, plumbers, carpenters, painters and AC technicians — ID-verified, rated by neighbours, and booked in under two minutes.
            </p>

            <form onSubmit={submit} className="anim-fade-up d3 mt-8 flex flex-col gap-2 rounded-2xl border border-line bg-paper p-2 shadow-card sm:flex-row sm:items-center">
              <div className="relative sm:w-44">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="h-12 w-full appearance-none bg-transparent px-4 text-sm font-semibold text-ink focus:outline-none"
                  aria-label="Service"
                >
                  <option value="">All services</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
              <span className="hidden h-8 w-px bg-line sm:block" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What do you need? e.g. AC service, deep clean…"
                className="h-12 flex-1 bg-transparent px-4 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
              />
              <Button type="submit" size="lg" className="sm:w-auto">
                <Icon name="search" className="h-4 w-4" /> Search
              </Button>
            </form>

            <div className="anim-fade-up d4 mt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="font-semibold text-muted">Popular:</span>
              {["AC & Appliance", "Deep Cleaning", "Electrician", "Plumber"].map((s) => (
                <Link
                  key={s}
                  to={`/services?service=${encodeURIComponent(s)}`}
                  className="rounded-full border border-line bg-paper px-3 py-1 font-medium text-soft transition-colors hover:border-ink/40 hover:text-ink"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div className="anim-fade-up d2 relative pb-10 pl-6 pr-4 sm:pl-10">
            <img
              src={HERO_MAIN}
              alt="Electrician fixing a wall socket at home"
              className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-card"
            />
            <img
              src={HERO_SMALL}
              alt="Professional cleaning a kitchen"
              className="absolute -bottom-2 left-0 hidden h-36 w-36 rounded-xl border-4 border-paper object-cover shadow-lift sm:block"
            />
            <div className="absolute -top-5 right-2 rounded-xl border border-line bg-paper px-4 py-3 shadow-lift">
              <div className="flex items-center gap-2">
                <Stars value={5} starClass="h-4 w-4" />
                <span className="font-display text-lg font-extrabold">4.8</span>
              </div>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted">38,400 reviews this month</p>
            </div>
            <span className="absolute bottom-14 right-6 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11.5px] font-bold text-paper shadow-lift">
              <Icon name="badgeCheck" className="h-3.5 w-3.5" /> Verified pros only
            </span>
          </div>
        </div>

        <div className="border-t border-line/80">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              ["1.2M+", "services completed"],
              ["38k", "verified professionals"],
              ["4.8★", "average rating"],
              ["7", "cities across India"],
            ].map(([v, l], i) => (
              <div key={l} className={i > 0 ? "md:border-l md:border-line md:pl-8" : ""}>
                <p className="font-display text-2xl font-extrabold sm:text-3xl">{v}</p>
                <p className="mt-1 text-[13px] font-medium text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- categories ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Browse by service</h2>
            <p className="mt-2 text-sm text-muted">Six service lines, one standard of verification.</p>
          </div>
          <Link to="/services" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition-colors hover:gap-2.5">
            View all <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s} delay={i * 40}>
              <Link
                to={`/services?service=${encodeURIComponent(s)}`}
                className="group relative block overflow-hidden rounded-xl border border-line bg-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/60 hover:shadow-lift"
              >
                <img
                  src={SERVICE_IMAGES[s]}
                  alt={`${s} service at home`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.05] group-hover:opacity-100"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/5" />
                <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-paper/95 text-ink shadow-card">
                  <ServiceGlyph service={s} />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block font-display text-[15px] font-bold text-paper">{s}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-paper/70">{SERVICE_META[s].blurb}</span>
                  <span className="mt-1.5 block font-mono text-[10.5px] text-paper/60">
                    {pros === null ? "loading…" : `${counts[s] ?? 0} pros live`}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- top pros ---------------- */}
      <section className="border-y border-line bg-shell">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Top rated this week</h2>
              <p className="mt-2 text-sm text-muted">Sorted live from <span className="font-mono text-[12px]">GET /search?sort=rating</span>.</p>
            </div>
            <Link to="/services?sort=rating" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition-colors hover:gap-2.5">
              See ranking <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pros === null
              ? Array.from({ length: 4 }).map((_, i) => <ProCardSkeleton key={i} />)
              : top.map((p, i) => (
                  <Reveal key={p.id} delay={i * 60}>
                    <ProfessionalCard pro={p} />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section id="how" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Three steps between you and a job well done.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                No phone tag, no haggling, no strangers without IDs. The whole journey lives in this app — search to review.
              </p>
              <img src={HOW_IMG} alt="Professional cleaning a kitchen counter" className="mt-8 hidden aspect-[3/2] w-full rounded-2xl border border-line object-cover lg:block" />
            </div>
          </div>
          <div className="lg:col-span-7">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="flex gap-6 border-t border-line py-8 first:border-t-0 first:pt-0 last:border-b">
                  <span className="font-mono text-sm font-semibold text-muted">{s.n}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["shield", "Background verified", "ID, address and police checks on every pro."],
                  ["wallet", "Pay after service", "Transparent pricing, no advance for visits."],
                  ["spark", "AI troubleshoot", "Free guidance before you spend a rupee."],
                ].map(([icon, t, d]) => (
                  <div key={t} className="flex gap-3 rounded-xl border border-line p-4">
                    <Icon name={icon} className="mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-[13.5px] font-bold">{t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- pro band ---------------- */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Your skills. Your schedule. Your earnings.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/65">
              Join 38,000 professionals who run their home-service business on trust_connect — with verified leads and weekly payouts.
            </p>
            <ul className="mt-6 space-y-3 text-[14.5px] font-medium">
              {["Keep up to 90% of every booking", "Weekly payouts, zero joining fee", "Free skill training and certification"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-paper/25">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/auth?mode=professional"><Button variant="light" size="lg">Register as professional</Button></Link>
              <Link to="/services" className="text-sm font-bold text-paper/70 underline-offset-4 transition-colors hover:text-paper hover:underline">
                Browse the marketplace
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] leading-relaxed text-paper/40">
              POST /auth/register/professional → POST /upload-documents → PATCH /admin/professional/{"{id}"}/verify
            </p>
          </Reveal>
          <Reveal delay={120} className="relative">
            <img src={BAND_IMG} alt="Carpenter cutting a joint with a chisel" className="aspect-[4/3] w-full rounded-2xl object-cover opacity-95" />
            <div className="absolute -bottom-6 left-6 rounded-xl border border-line bg-paper px-5 py-4 text-ink shadow-lift">
              <p className="font-display text-2xl font-extrabold">₹18,400</p>
              <p className="mt-0.5 text-xs font-medium text-muted">avg monthly earnings, verified pros</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ServiceGlyph({ service }) {
  const meta = SERVICE_META[service];
  return <Icon name={meta.icon} className="h-5 w-5" />;
}
