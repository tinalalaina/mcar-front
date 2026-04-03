import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  XCircle,
  ArrowUpDown,
} from "lucide-react";

import VehicleCard from "@/components/VehicleCard";
import VehiculeCardSkeleton from "@/components/VehicleCardSkeleton";
import { searchVehicles } from "@/Actions/vehiculeApi";
import { useQuery } from "@tanstack/react-query";
import type { VehicleSearchItem } from "@/types/vehicleSearchType";

type SortOption =
  | "relevance"
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

const normalizeSearchResponse = (data: unknown): VehicleSearchItem[] => {
  if (Array.isArray(data)) return data;

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as { results?: unknown[] }).results)
  ) {
    return (data as { results: VehicleSearchItem[] }).results;
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
  ) {
    return (data as { items: VehicleSearchItem[] }).items;
  }

  if (
    data &&
    typeof data === "object" &&
    "vehicles" in data &&
    Array.isArray((data as { vehicles?: unknown[] }).vehicles)
  ) {
    return (data as { vehicles: VehicleSearchItem[] }).vehicles;
  }

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown[] }).data)
  ) {
    return (data as { data: VehicleSearchItem[] }).data;
  }

  return [];
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const filters = useMemo(
    () => ({
      ville: searchParams.get("ville") || "",
      categorie: searchParams.get("categorie") || "",
      start_date: searchParams.get("start_date") || "",
      end_date: searchParams.get("end_date") || "",
      type_vehicule: searchParams.get("type_vehicule") || "",
    }),
    [searchParams]
  );

  const activeSummary = useMemo(() => {
    const items: string[] = [];
    if (filters.ville) items.push(filters.ville);
    if (filters.categorie) items.push("Catégorie sélectionnée");
    if (filters.start_date && filters.end_date) {
      items.push("Période définie");
    }
    if (filters.type_vehicule) {
      items.push(filters.type_vehicule === "TOURISME" ? "Tourisme" : filters.type_vehicule);
    }
    return items;
  }, [filters]);

  const {
    data: rawResults = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicle-search-results", filters],
    queryFn: async () => {
      const data = await searchVehicles(filters);
      return normalizeSearchResponse(data);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const results = useMemo(() => {
    const base = [...rawResults];

    switch (sortBy) {
      case "newest":
        return base.sort((a, b) => {
          const aTime = new Date(String(a.published_at ?? a.created_at ?? "")).getTime();
          const bTime = new Date(String(b.published_at ?? b.created_at ?? "")).getTime();
          return bTime - aTime;
        });

      case "popular":
        return base.sort(
          (a, b) => Number(b.nombre_locations ?? 0) - Number(a.nombre_locations ?? 0)
        );

      case "price-asc":
        return base.sort(
          (a, b) => Number(a.prix_jour ?? 0) - Number(b.prix_jour ?? 0)
        );

      case "price-desc":
        return base.sort(
          (a, b) => Number(b.prix_jour ?? 0) - Number(a.prix_jour ?? 0)
        );

      case "rating-desc":
        return base.sort(
          (a, b) => Number(b.note_moyenne ?? 0) - Number(a.note_moyenne ?? 0)
        );

      case "relevance":
      default:
        return base;
    }
  }, [rawResults, sortBy]);

  const queryErrorMessage =
    error instanceof Error ? error.message : "Impossible de charger les résultats.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_24%),linear-gradient(to_bottom,#fbfdff,#f5f9ff,#fbfdff)]">
      <section className="border-b border-slate-200/70 bg-[linear-gradient(to_bottom,#ffffff,#f7fbff)]">
        <div className="mx-auto max-w-[1520px] px-4 py-8 sm:px-6 lg:px-10 2xl:px-12">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Search className="h-3.5 w-3.5" />
                Résultats de recherche publics
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Trouvez le véhicule qui vous convient
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                Nous affichons uniquement des véhicules publics, validés et publiés,
                avec une présentation uniforme et claire.
              </p>

              {activeSummary.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeSummary.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
                Trier les résultats
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="newest">Plus récents</option>
                  <option value="popular">Plus populaires</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating-desc">Meilleure note</option>
                </select>

                <div className="flex h-12 items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 text-sm text-slate-600">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  <span>{results.length} résultat{results.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1520px] px-4 py-8 sm:px-6 lg:px-10 2xl:px-12">
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <VehiculeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.9rem] border border-destructive/30 bg-white/85 p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Impossible de charger les résultats
            </h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              {queryErrorMessage}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              Réessayer
            </button>
          </motion.div>
        )}

        {!isLoading && !isError && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.9rem] border border-border/60 bg-white/85 p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Aucun résultat trouvé
            </h3>
            <p className="mx-auto max-w-md text-muted-foreground">
              Aucun véhicule public ne correspond à votre recherche actuelle.
            </p>
          </motion.div>
        )}

        {!isLoading && !isError && results.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {results.map((vehicle, index) => {
              const brand = vehicle.marque?.nom ?? vehicle.marque_nom ?? "Marque inconnue";
              const model =
                vehicle.modele?.label ??
                vehicle.modele_label ??
                vehicle.titre ??
                "Modèle non spécifié";
              const transmission =
                vehicle.transmission?.nom ?? vehicle.transmission_nom ?? "Transmission inconnue";
              const fuel =
                vehicle.type_carburant?.nom ??
                vehicle.type_carburant_nom ??
                "Carburant inconnu";

              const trips = Number(vehicle.nombre_locations ?? 0);
              const favoriteCount = Number(vehicle.nombre_favoris ?? 0);

              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Link to={`/vehicule/${vehicle.id}`} className="block h-full">
                    <VehicleCard
                      image={vehicle.photo_principale ?? ""}
                      year={vehicle.annee}
                      brand={brand}
                      model={model}
                      rating={Number(vehicle.note_moyenne ?? 0)}
                      trips={trips}
                      price={Number(vehicle.prix_jour ?? 0)}
                      seats={vehicle.nombre_places ?? 0}
                      transmission={transmission}
                      fuel={fuel}
                      certified={Boolean(vehicle.est_certifie)}
                      deliveryAvailable={
                        Boolean(vehicle.est_disponible) &&
                        !Boolean(vehicle.is_currently_reserved)
                      }
                      sponsored={Boolean(vehicle.est_sponsorise)}
                      featured={Boolean(vehicle.est_coup_de_coeur)}
                      popular={Boolean(vehicle.is_popular) || trips >= 3}
                      reserved={Boolean(vehicle.is_currently_reserved)}
                      reservable={Boolean(vehicle.is_reservable)}
                      newListing={Boolean(vehicle.is_new_listing)}
                      city={vehicle.ville ?? null}
                      favoriteCount={favoriteCount}
                      superHost={trips >= 7}
                      className="h-full"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;