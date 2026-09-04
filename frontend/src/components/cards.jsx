import { Link } from "react-router-dom";
import { Icon, Initials, Skeleton, Stars } from "./ui";
import { cn } from "../utils/cn";

export const SERVICE_META = {
  "AC & Appliance": { icon: "snowflake", blurb: "AC service, gas top-up, fridge & washing machine" },
  Electrician: { icon: "bolt", blurb: "Wiring, switches, fans, inverters & short circuits" },
  Plumber: { icon: "droplet", blurb: "Leaks, fittings, jets & water tank maintenance" },
  Carpenter: { icon: "hammer", blurb: "Furniture repair, doors, hinges & polishing" },
  Painting: { icon: "roller", blurb: "Interior, exterior, waterproofing & texture" },
  "Deep Cleaning": { icon: "sparkle", blurb: "Full-home deep clean, kitchen, bathroom & sofa" },
};

const sx = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=600`;

/** Trade photography per service line */
export const SERVICE_IMAGES = {
  "AC & Appliance": sx(33671149),
  Electrician: sx(7285965),
  Plumber: sx(6419128),
  Carpenter: sx(5974413),
  Painting: sx(7218683),
  "Deep Cleaning": sx(6197121),
};

export function ServiceIcon({ service, className }) {
  const meta = SERVICE_META[service];
  return <Icon name={meta ? meta.icon : "shield"} className={className} />;
}

export function ProfessionalCard({ pro, className }) {
  return (
    <Link
      to={`/professional/${pro.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-shell">
        {pro.avatar_url ? (
          <img
            src={pro.avatar_url}
            alt={pro.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Initials name={pro.name} className="h-full w-full rounded-none text-2xl" />
        )}
        {pro.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-bold text-ink shadow-card">
            <Icon name="badgeCheck" className="h-3.5 w-3.5 text-success" />
            Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold leading-tight">{pro.name}</h3>
          <span className="inline-flex items-center gap-1 rounded-md bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-paper">
            <Icon name="star" filled className="h-2.5 w-2.5" />
            {pro.rating > 0 ? pro.rating.toFixed(1) : "New"}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] font-medium text-muted">{pro.service}</p>
        <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-semibold", pro.is_available ? "text-success" : "text-warning")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", pro.is_available ? "bg-success" : "bg-warning")} />
          {pro.is_available ? "Available now" : pro.available_from ? `Available ${new Date(pro.available_from).toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "Currently unavailable"}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Stars value={pro.rating} />
          <span>{pro.reviews_count} reviews</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px]">
          <span className="inline-flex items-center gap-1 text-muted">
            <Icon name="pin" className="h-3.5 w-3.5" />
            {pro.city} · {pro.experience_years} yrs
          </span>
          <span className="font-display font-bold">
            <span className="text-[11px] font-medium text-muted">from </span>₹{pro.price_from}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
