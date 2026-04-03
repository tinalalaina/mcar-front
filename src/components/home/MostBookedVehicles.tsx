import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import VehicleCard from "@/components/VehicleCard";
import VehicleCardSkeleton from "@/components/VehicleCardSkeleton";
import { AnimatedSection, AnimatedItem } from "@/components/animations";
import { useMostBookedVehicles } from "@/useQuery/vehiculeStatsUseQuery";
import { useCurrentUserQuery } from "@/useQuery/useCurrentUserQuery";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

export const MostBookedVehicles = () => {
  const { data: vehicles = [], isLoading } = useMostBookedVehicles();
  const { data: currentUser } = useCurrentUserQuery();

  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const skeletonCount = 8;
  const hasVehicles = vehicles.length > 0;
  const showControls = vehicles.length > 4;
  const isAuthenticated = Boolean(currentUser);

  const itemClass =
    "pl-3 md:pl-4 basis-full sm:basis-1/2 xl:basis-1/4 pb-3 pt-2";

  useEffect(() => {
    if (!api) return;

    const updateControls = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateControls();
    api.on("select", updateControls);
    api.on("reInit", updateControls);

    return () => {
      api.off("select", updateControls);
      api.off("reInit", updateControls);
    };
  }, [api]);

  if (!isLoading && !hasVehicles) return null;

  return (
    <AnimatedSection className="pb-2 pt-1" delay={0}>
      <div className="mb-5">
        <span className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700/90">
          <span className="h-[3px] w-10 rounded-full bg-gradient-to-r from-sky-600 to-blue-400" />
          Réservations
        </span>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.8rem]">
          Les véhicules qui enregistrent le plus de réservations
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
          Parcourez les annonces les plus demandées par les clients pour repérer
          rapidement les véhicules les plus attractifs.
        </p>
      </div>

      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: false,
            slidesToScroll: 1,
            containScroll: "trimSnaps",
            dragFree: false,
          }}
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {isLoading &&
              Array.from({ length: skeletonCount }).map((_, index) => (
                <CarouselItem key={index} className={itemClass}>
                  <VehicleCardSkeleton />
                </CarouselItem>
              ))}

            {!isLoading &&
              vehicles.map((vehicle, index) => {
                const brand =
                  vehicle.marque?.nom ?? vehicle.marque_nom ?? "Marque inconnue";

                const model =
                  vehicle.modele?.label ??
                  (vehicle.modele as { nom?: string } | null)?.nom ??
                  vehicle.modele_label ??
                  vehicle.titre ??
                  "Modèle non spécifié";

                const transmission =
                  vehicle.transmission?.label ??
                  (vehicle.transmission as { nom?: string } | null)?.nom ??
                  vehicle.transmission_nom ??
                  "Transmission inconnue";

                const fuel =
                  vehicle.type_carburant?.label ??
                  (vehicle.type_carburant as { nom?: string } | null)?.nom ??
                  vehicle.type_carburant_nom ??
                  "Carburant inconnu";

                const trips = Number(vehicle.nombre_locations ?? 0);
                const favoriteCount = Number((vehicle as any).nombre_favoris ?? 0);
                const isCurrentlyReserved = toBoolean(
                  (vehicle as any).is_currently_reserved
                );
                const isReservable =
                  typeof (vehicle as any).is_reservable === "boolean"
                    ? (vehicle as any).is_reservable
                    : !isCurrentlyReserved;

                return (
                  <CarouselItem
                    key={`${vehicle.id}-${isCurrentlyReserved ? "reserved" : "free"}-${
                      isReservable ? "reservable" : "locked"
                    }`}
                    className={itemClass}
                  >
                    <AnimatedItem delay={index * 35}>
                      <Link
                        to={`/vehicule/${vehicle.id}`}
                        className="block h-full rounded-[24px]"
                      >
                        <VehicleCard
                          image={vehicle.photo_principale ?? ""}
                          year={vehicle.annee}
                          brand={brand}
                          model={model}
                          rating={vehicle.note_moyenne ? Number(vehicle.note_moyenne) : 0}
                          trips={trips}
                          price={Number(vehicle.prix_jour) || 0}
                          seats={vehicle.nombre_places ?? 0}
                          transmission={transmission}
                          fuel={fuel}
                          certified={Boolean(vehicle.est_certifie)}
                          deliveryAvailable={
                            Boolean(vehicle.est_disponible) &&
                            !isCurrentlyReserved &&
                            isReservable
                          }
                          sponsored={Boolean((vehicle as any).est_sponsorise)}
                          featured={Boolean((vehicle as any).est_coup_de_coeur)}
                          popular
                          reserved={isCurrentlyReserved}
                          reservable={isReservable}
                          newListing={Boolean((vehicle as any).is_new_listing)}
                          city={vehicle.ville ?? null}
                          favoriteCount={favoriteCount}
                          superHost={trips >= 7}
                          showFavoriteButton={isAuthenticated}
                          className="h-full"
                        />
                      </Link>
                    </AnimatedItem>
                  </CarouselItem>
                );
              })}
          </CarouselContent>

          {showControls && canScrollPrev && (
            <CarouselPrevious className="absolute left-[-10px] top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white shadow-md transition-all duration-150 hover:bg-slate-900 hover:text-white" />
          )}

          {showControls && canScrollNext && (
            <CarouselNext className="absolute right-[-10px] top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white shadow-md transition-all duration-150 hover:bg-slate-900 hover:text-white" />
          )}
        </Carousel>
      </div>
    </AnimatedSection>
  );
};