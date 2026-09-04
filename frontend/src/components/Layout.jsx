import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SERVICES } from "../lib/types";
import { cn } from "../utils/cn";
import { Button, Icon, Initials, Toaster } from "./ui";
import { ApiDrawer } from "./ApiDrawer";
import { AiHelp } from "./AiHelp";

export function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="trust_connect home">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg font-display text-[13px] font-bold", light ? "bg-paper text-ink" : "bg-ink text-paper")}>
        tc
      </span>
      <span className={cn("font-display text-lg font-bold tracking-tight", light ? "text-paper" : "text-ink")}>
        trust<span className={light ? "text-paper/60" : "text-muted"}>_connect</span>
      </span>
    </Link>
  );
}

function ConnPill({ onClick }) {
  const { conn } = useApp();
  const label = conn.status === "live" ? "Live API" : conn.status === "fallback" ? "API offline · demo" : "Demo data";
  return (
    <button
      onClick={onClick}
      className="hidden items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[11px] font-medium text-muted transition-colors hover:border-ink/30 hover:text-ink sm:inline-flex"
      title="API connection settings"
    >
      <span className={cn("live-dot h-1.5 w-1.5 rounded-full", conn.status === "live" ? "bg-success" : conn.status === "fallback" ? "bg-warning" : "bg-muted")} />
      {label}
    </button>
  );
}

export default function Layout() {
  const { user, unread, logout, toast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [loc.pathname, loc.search]);

  const navLink = ({ isActive }) =>
    cn(
      "rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
      isActive ? "bg-shell text-ink" : "text-muted hover:bg-shell hover:text-ink",
    );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              <NavLink to="/services" className={navLink}>Services</NavLink>
              <button onClick={() => setAiOpen(true)} className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-muted transition-colors hover:bg-shell hover:text-ink">
                Fix my problem
              </button>
              <NavLink to="/auth?mode=professional" className={navLink}>Become a professional</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ConnPill onClick={() => setApiOpen(true)} />
            {user && (
              <Link
                to="/dashboard?tab=notifications"
                className="relative grid h-10 w-10 place-items-center rounded-lg text-soft transition-colors hover:bg-shell"
                aria-label={`Notifications (${unread} unread)`}
              >
                <Icon name="bell" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                    {unread}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-shell"
                >
                  <Initials name={user.name} className="h-8 w-8 text-xs" />
                  <span className="hidden text-[13.5px] font-semibold sm:block">{user.name.split(" ")[0]}</span>
                  <Icon name="chevronDown" className="h-3.5 w-3.5 text-muted" />
                </button>
                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                    <div className="anim-pop absolute right-0 top-full z-20 mt-2 w-60 rounded-xl border border-line bg-paper p-1.5 shadow-lift">
                      <div className="border-b border-line px-3 py-2.5">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="truncate font-mono text-[11px] text-muted">{user.email}</p>
                        <span className="mt-1.5 inline-block rounded-full border border-ink/15 bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          {user.role}
                        </span>
                      </div>
                      <Link to="/dashboard" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold hover:bg-shell">
                        <Icon name="calendar" className="h-4 w-4" /> Dashboard
                      </Link>
                      {user.role === "admin" && (
                        <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold hover:bg-shell">
                          <Icon name="shield" className="h-4 w-4" /> Admin console
                        </Link>
                      )}
                      <button
                        onClick={() => setApiOpen(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-shell"
                      >
                        <Icon name="doc" className="h-4 w-4" /> API connection
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                          toast("Signed out. See you soon.", "info");
                          nav("/");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-danger hover:bg-danger/5"
                      >
                        <Icon name="logout" className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/auth?mode=register"><Button size="sm">Sign up</Button></Link>
              </div>
            )}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-lg text-soft transition-colors hover:bg-shell lg:hidden"
              aria-label="Menu"
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="anim-fade-in border-t border-line bg-paper px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink to="/services" className={navLink}>Services</NavLink>
              <button onClick={() => { setAiOpen(true); setMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-[13.5px] font-semibold text-muted hover:bg-shell">
                Fix my problem
              </button>
              <NavLink to="/auth?mode=professional" className={navLink}>View all Bookings</NavLink>
              {user?.role === "admin" && <NavLink to="/admin" className={navLink}>Admin console</NavLink>}
              <button onClick={() => { setApiOpen(true); setMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-[13.5px] font-semibold text-muted hover:bg-shell">
                API connection
              </button>
              {!user && (
                <div className="mt-2 flex gap-2">
                  <Link to="/auth" className="flex-1"><Button variant="outline" full>Log in</Button></Link>
                  <Link to="/auth?mode=register" className="flex-1"><Button full>Sign up</Button></Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet context={{ openApi: () => setApiOpen(true), openAi: () => setAiOpen(true) }} />
      </main>

      <footer className="border-t border-line bg-shell">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
                Verified home service professionals across 7 Indian cities. Booked in minutes, serviced at home, paid after the job.
              </p>
              <button
                onClick={() => setApiOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                <Icon name="doc" className="h-3.5 w-3.5" /> GET /db-test
              </button>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted">Services</h4>
              <ul className="mt-4 space-y-2.5">
                {SERVICES.slice(0, 6).map((s) => (
                  <li key={s}>
                    <Link to={`/services?service=${encodeURIComponent(s)}`} className="text-sm font-medium text-soft transition-colors hover:text-ink">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-soft">
                <li><Link to="/#how" className="transition-colors hover:text-ink">How it works</Link></li>
                <li><Link to="/auth?mode=professional" className="transition-colors hover:text-ink">Become a pro</Link></li>
                <li><Link to="/admin" className="transition-colors hover:text-ink">Admin console</Link></li>
                <li><Link to="/dashboard" className="transition-colors hover:text-ink">Dashboard</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted">Support</h4>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-soft">
                <li><button onClick={() => setAiOpen(true)} className="transition-colors hover:text-ink">AI troubleshoot</button></li>
                <li><button onClick={() => setApiOpen(true)} className="transition-colors hover:text-ink">API reference</button></li>
                <li><Link to="/dashboard?tab=notifications" className="transition-colors hover:text-ink">Notifications</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[12.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 trust_connect Technologies Pvt Ltd · Bengaluru, India</p>
            <p className="font-mono text-[11px]">POST /ai/troubleshoot · PATCH /notification/{"{id}"}/read</p>
          </div>
        </div>
      </footer>

      <ApiDrawer open={apiOpen} onClose={() => setApiOpen(false)} />
      <AiHelp open={aiOpen} onClose={() => setAiOpen(false)} />
      <Toaster />
    </div>
  );
}
