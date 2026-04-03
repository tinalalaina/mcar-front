import {
  Star,
  Users,
  Fuel,
  Settings,
  Heart,
  ShieldCheck,
  BadgeCheck,
  Flame,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { useState, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  image: string;
  year: number;
  brand: string;
  model: string;
  rating: number;
  trips: number;
  price: number;
  oldPrice?: number;
  seats?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  certified?: boolean;
  superHost?: boolean;
  newListing?: boolean;
  deliveryAvailable?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  sponsored?: boolean;
  featured?: boolean;
  popular?: boolean;
  reserved?: boolean;
  reservable?: boolean;
  city?: string | null;
  favoriteCount?: number;
  className?: string;
  dateLabel?: string | null;
  categoryLabel?: string | null;
  feature1?: string | null;
  feature2?: string | null;
  feature3?: string | null;
}

const VehicleCard = ({
  image,
  year,
  brand,
  model,
  rating,
  trips,
  price,
  oldPrice,
  seats,
  transmission,
  fuel,
  certified = false,
  superHost = false,
  newListing = false,
  deliveryAvailable = false,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
  sponsored = false,
  featured = false,
  popular = false,
  reserved = false,
  reservable = true,
  city,
  favoriteCount = 0,
  className,
  dateLabel,
  categoryLabel,
  feature1,
  feature2,
  feature3,
}: VehicleCardProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const title = `${brand} ${model}`.trim();
  const finalImage = image || "/placeholder-car.jpg";
  const metaDate = dateLabel?.trim() || `${year}`;

  const safePrice = Number(price || 0);
  const safeOldPrice = Number(oldPrice || 0);
  const safeRating = Number(rating || 0);

  const hasDiscount = safeOldPrice > safePrice && safePrice > 0;
  const discountPercentage = hasDiscount
    ? Math.round(((safeOldPrice - safePrice) / safeOldPrice) * 100)
    : 0;

  const isCurrentlyRented = Boolean(reserved);
  const isClickableReservation = Boolean(reservable);

  const topBadges = [
    sponsored ? "Sponsorisé" : null,
    featured ? "Coup de cœur" : null,
    popular ? "Populaire" : null,
    newListing ? "Nouveau" : null,
  ].filter(Boolean) as string[];

  const rawInfoItems = [
    feature1?.trim() || null,
    feature2?.trim() || null,
    feature3?.trim() || null,
  ].filter(Boolean) as string[];

  const fallbackInfoItems = [
    typeof seats === "number" && seats > 0 ? `${seats} places` : null,
    fuel?.trim() || null,
    transmission?.trim() || null,
  ].filter(Boolean) as string[];

  const displayInfoItems =
    rawInfoItems.length > 0
      ? rawInfoItems.slice(0, 3)
      : fallbackInfoItems.slice(0, 3);

  const getInfoIcon = (label: string) => {
    const value = label.toLowerCase();

    if (
      value.includes("place") ||
      value.includes("siège") ||
      value.includes("siege") ||
      value.includes("passager")
    ) {
      return <Users className="h-3.5 w-3.5 text-[#98A2B3]" />;
    }

    if (
      value.includes("diesel") ||
      value.includes("essence") ||
      value.includes("electrique") ||
      value.includes("électrique") ||
      value.includes("hybride") ||
      value.includes("carburant")
    ) {
      return <Fuel className="h-3.5 w-3.5 text-[#98A2B3]" />;
    }

    if (
      value.includes("manuel") ||
      value.includes("automatique") ||
      value.includes("boîte") ||
      value.includes("boite") ||
      value.includes("transmission")
    ) {
      return <Settings className="h-3.5 w-3.5 text-[#98A2B3]" />;
    }

    return <BadgeCheck className="h-3.5 w-3.5 text-[#98A2B3]" />;
  };

  return (
    <article
      className={cn(
        "group relative mx-auto flex h-[410px] w-full max-w-[282px] flex-col overflow-hidden rounded-[16px] border border-[#E7EAF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div className="relative h-[136px] overflow-hidden rounded-t-[16px] bg-slate-100 transform-gpu z-0">
        {isImageLoading && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        )}

        <img
          src={finalImage}
          alt={title}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setIsImageLoading(false)}
          onError={(e) => {
            setIsImageLoading(false);
            e.currentTarget.src = "/placeholder-car.jpg";
          }}
          className={cn(
            "h-full w-full object-cover transform-gpu transition-transform duration-500 ease-out",
            "group-hover:scale-[1.04]",
            isImageLoading ? "opacity-0" : "opacity-100"
          )}
        />

        {isCurrentlyRented && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 pointer-events-none">
            <div className="rotate-[-6deg] rounded-[8px] border-2 border-white bg-[#E52B2B] px-5 py-2 text-[14px] font-extrabold uppercase tracking-[0.02em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
              Actuellement loué
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 z-30 flex max-w-[82%] flex-wrap gap-2">
          {topBadges.map((badge, index) => (
            <div
              key={`${badge}-${index}`}
              className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.03em] text-slate-700 shadow-sm"
            >
              {badge}
            </div>
          ))}
        </div>

        {showFavoriteButton && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className={cn(
              "absolute right-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-500 shadow-md backdrop-blur transition-colors duration-150",
              "hover:bg-white hover:text-rose-500",
              isFavorite ? "text-rose-500" : ""
            )}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 min-h-[20px] text-[15px] font-extrabold leading-[1.25] text-[#0F172A]">
            {title}
          </h3>

          <div className="shrink-0 rounded-[8px] bg-[#FFF6D8] px-2 py-1">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[#F4B400] text-[#F4B400]" />
              <span className="text-[13px] font-bold leading-none text-[#D39B00]">
                {safeRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex min-h-[20px] items-center gap-1.5 text-[13px] text-[#667085]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
          <span className="truncate">{city || "Antananarivo"}</span>
          <span>•</span>
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
          <span className="truncate">{metaDate}</span>
        </div>

        <div className="mt-4 h-[58px]">
          <div className="flex flex-wrap gap-2">
            {displayInfoItems.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-[6px] border border-[#EAECF0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium leading-none text-[#667085]"
              >
                {getInfoIcon(item)}
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {(certified || superHost) && (
          <div className="mt-1 flex min-h-[28px] flex-wrap gap-2">
            {certified && (
              <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Certifié
              </div>
            )}

            {superHost && (
              <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Très demandé
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="h-px w-full bg-[#EEF2F6]" />

          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex min-h-[16px] items-center gap-2">
                {hasDiscount && (
                  <>
                    <span className="text-[11px] text-slate-400 line-through">
                      {safeOldPrice.toLocaleString()} Ar
                    </span>
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      <Flame className="mr-1 h-3 w-3" />
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-[11px] font-extrabold uppercase tracking-[0.03em] text-[#98A2B3]">
                À partir de
              </p>

              <div className="mt-0.5 flex items-end gap-1">
                <span className="text-[16px] font-extrabold leading-none text-[#2F5BFF]">
                  {safePrice.toLocaleString()}
                </span>
                <span className="text-[12px] font-medium text-[#667085]">
                  Ar/j
                </span>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex h-[34px] items-center justify-center rounded-[8px] px-4 text-[13px] font-semibold shadow-sm transition-all duration-200 cursor-pointer",
                isCurrentlyRented || !isClickableReservation
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : "bg-[#0B1736] text-white hover:bg-[#13224A] hover:shadow-md"
              )}
            >
              {isCurrentlyRented ? "Loué" : "Découvrir"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default memo(VehicleCard);