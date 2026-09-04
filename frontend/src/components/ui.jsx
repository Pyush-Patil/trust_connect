import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const PATHS = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="M16.8 16.8 21 21" /></>),
  bell: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  menu: (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>),
  close: (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  arrowRight: (<><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></>),
  arrowLeft: (<><path d="M20 12H4" /><path d="m11 19-7-7 7-7" /></>),
  check: <path d="m4.5 12.5 5 5L20 6.5" />,
  badgeCheck: (<><circle cx="12" cy="12" r="9" /><path d="m8.4 12.2 2.4 2.4 4.8-5" /></>),
  lock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  spark: (<><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M18.7 16.2l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.8" /></>),
  pin: (<><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>),
  shield: <path d="M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6z" />,
  doc: (<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6" /><path d="M10 17h6" /></>),
  bolt: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5z" />,
  scissors: (<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8.2 7.6 20 18" /><path d="M8.2 16.4 20 6" /></>),
  sparkle: (<><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="m18.5 15 .8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" /></>),
  droplet: <path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z" />,
  hammer: (<><path d="m13 5 6 6-3 3-6-6z" /><path d="M10 8 3.5 14.5a2.12 2.12 0 0 0 3 3L13 11" /></>),
  snowflake: (<><path d="M12 2v20" /><path d="M3.5 7l17 10" /><path d="M20.5 7l-17 10" /></>),
  roller: (<><path d="M4 4h12v5H4z" /><path d="M16 6.5h4v6h-9v2.5" /><path d="M9.75 15h2.5v6h-2.5z" /></>),
  bug: (<><rect x="8" y="8" width="8" height="10" rx="4" /><path d="M8 12H4" /><path d="M8 16H5" /><path d="M16 12h4" /><path d="M16 16h3" /><path d="M9.5 8 7.5 5" /><path d="M14.5 8 16.5 5" /><path d="M12 8v10" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  alert: (<><path d="M12 3 22 21H2z" /><path d="M12 10v5" /><path d="M12 18h.01" /></>),
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />,
  phone: <path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M16 14.5h2" /></>),
  refresh: (<><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v4h-4" /></>),
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>),
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>),
  leaf: (<><path d="M4 20c0-9 5-15 16-16 0 11-5 16-13 16" /><path d="M4 20c3-6 7-10 12-12" /></>),
};

export function Icon({ name, className, filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0.6 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Buttons                                                            */
/* ------------------------------------------------------------------ */
export function Button({ variant = "primary", size = "md", loading, full, className, children, disabled, ...rest }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3.5 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-[15px]",
        variant === "primary" && "bg-ink text-paper hover:bg-soft active:scale-[0.98] shadow-[0_1px_0_rgb(255_255_255/0.15)_inset]",
        variant === "outline" && "border border-line bg-paper text-ink hover:border-ink/40 hover:bg-shell active:scale-[0.98]",
        variant === "ghost" && "text-ink hover:bg-shell",
        variant === "danger" && "border border-danger/30 bg-paper text-danger hover:bg-danger/5",
        variant === "light" && "bg-paper text-ink hover:bg-shell active:scale-[0.98]",
        full && "w-full",
        className,
      )}
    >
      {loading && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.4">
          <circle cx="12" cy="12" r="9" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Small bits                                                         */
/* ------------------------------------------------------------------ */
export function Stars({ value, className, starClass }) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" filled={i <= rounded} className={cn("h-3.5 w-3.5", i <= rounded ? "text-ink" : "text-line", starClass)} />
      ))}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: "text-warning bg-warning/10 border-warning/25",
    confirmed: "text-ink bg-ink/5 border-ink/15",
    completed: "text-success bg-success/10 border-success/25",
    cancelled: "text-danger bg-danger/10 border-danger/25",
    verified: "text-success bg-success/10 border-success/25",
    rejected: "text-danger bg-danger/10 border-danger/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", map[status] ?? "text-muted bg-shell border-line")}>
      {status}
    </span>
  );
}

export function MethodChip({ method }) {
  return (
    <span
      className={cn(
        "inline-flex w-14 justify-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide",
        method === "GET" && "border-ink/25 bg-paper text-ink",
        method === "POST" && "border-ink bg-ink text-paper",
        method === "PATCH" && "border-ink/40 bg-ink/10 text-ink",
      )}
    >
      {method}
    </span>
  );
}

export function Initials({ name = "", className }) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const txt = (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
  return (
    <span className={cn("grid place-items-center rounded-xl border border-line bg-shell font-display font-semibold text-ink", className)}>
      {txt.toUpperCase()}
    </span>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function EmptyState({ icon = "info", title, desc, action }) {
  return (
    <div className="anim-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-shell/60 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-paper text-muted">
        <Icon name={icon} />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {desc && <p className="mt-1.5 max-w-sm text-sm text-muted">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form controls                                                      */
/* ------------------------------------------------------------------ */
export const fieldCls =
  "h-11 w-full rounded-lg border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-ink focus:outline-none";

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-soft">
        {label}
        {hint && <span className="text-[11px] font-medium text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Input({ className, ...rest }) {
  return <input {...rest} className={cn(fieldCls, className)} />;
}

export function Select({ className, children, ...rest }) {
  return (
    <select {...rest} className={cn(fieldCls, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23141414%22%20stroke-width%3D%221.8%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }) {
  return <textarea {...rest} className={cn(fieldCls, "h-auto min-h-[88px] py-2.5 leading-relaxed", className)} />;
}

/* ------------------------------------------------------------------ */
/*  Overlays                                                           */
/* ------------------------------------------------------------------ */
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="anim-fade-in absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("anim-pop relative max-h-[88vh] w-full overflow-y-auto thin-scroll rounded-2xl border border-line bg-paper p-6 shadow-lift", wide ? "max-w-2xl" : "max-w-md")}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-shell hover:text-ink" aria-label="Close">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div className="anim-fade-in absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="anim-slide-left absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-lift">
        <header className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-base font-bold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-shell hover:text-ink" aria-label="Close">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto thin-scroll">{children}</div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll reveal                                                      */
/* ------------------------------------------------------------------ */
export function Reveal({ children, className, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toaster                                                            */
/* ------------------------------------------------------------------ */
export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="anim-rise pointer-events-auto flex w-full items-start gap-2.5 rounded-xl bg-ink px-4 py-3 text-left text-[13px] font-medium text-paper shadow-lift"
        >
          <Icon
            name={t.kind === "success" ? "badgeCheck" : t.kind === "error" ? "alert" : "info"}
            className={cn("mt-px h-4 w-4", t.kind === "error" ? "text-danger" : "text-paper")}
          />
          <span className="leading-snug">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
