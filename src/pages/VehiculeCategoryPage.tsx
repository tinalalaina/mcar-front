import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers3, Search, Sparkles, XCircle } from "lucide-react";

import VehicleCard from "@/components/VehicleCard";
import VehiculeCardSkeleton from "@/components/VehicleCardSkeleton";
import { useCategoryVehiculesQuery } from "@/useQuery/vehiculeUseQuery";

const VehiculeCategoryPage = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCategoryVehiculesQuery(id);

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return vehicles;

    return vehicles.filter((vehicle) => {
      const searchable = [
        vehicle.titre,
        vehicle.marque_nom,
        vehicle.modele_label,
        vehicle.ville,
        vehicle.transmission_nom,
        vehicle.type_carburant_nom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [vehicles, searchTerm]);

  const queryErrorMessage =
    error instanceof Error ? error.message : "Impossible de charger les véhicules.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_24%),linear-gradient(to_bottom,#fbfdff,#f5f9ff,#fbfdff)]">
      <section className="border-b border-slate-200/70 bg-[linear-gradient(to_bottom,#ffffff,#f7fbff)]">
        <div className="mx-auto max-w-[1520px] px-4 py-8 sm:px-6 lg:px-10 2xl:px-12">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Layers3 className="h-3.5 w-3.5" />
                Véhicules par catégorie
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Explorez les véhicules de cette catégorie
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                Cette liste affiche uniquement des véhicules publics, cohérents et
                validés, avec un rendu harmonisé sur toute la plateforme.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                {filteredVehicles.length} véhicule
                {filteredVehicles.length > 1 ? "s" : ""} affiché
                {filteredVehicles.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Rechercher dans cette catégorie
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Marque, modèle, ville, carburant..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
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
              Impossible de charger cette catégorie
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

        {!isLoading && !isError && filteredVehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.9rem] border border-border/60 bg-white/85 p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Aucun véhicule trouvé
            </h3>
            <p className="mx-auto max-w-md text-muted-foreground">
              Aucun véhicule public ne correspond à votre filtre actuel dans cette catégorie.
            </p>
          </motion.div>
        )}

        {!isLoading && !isError && filteredVehicles.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filteredVehicles.map((vehicle, index) => {
              const brand =
                (typeof vehicle.marque === "object" && vehicle.marque?.nom) ||
                vehicle.marque_data?.nom ||
                vehicle.marque_nom ||
                "Marque inconnue";

              const model =
                (typeof vehicle.modele === "object" && vehicle.modele?.label) ||
                vehicle.modele_data?.label ||
                vehicle.modele_label ||
                vehicle.titre ||
                "Modèle non spécifié";

              const transmission =
                (typeof vehicle.transmission === "object" &&
                  (vehicle.transmission?.nom || vehicle.transmission?.label)) ||
                vehicle.transmission_data?.nom ||
                vehicle.transmission_nom ||
                "Transmission inconnue";

              const fuel =
                (typeof vehicle.type_carburant === "object" &&
                  (vehicle.type_carburant?.nom || vehicle.type_carburant?.label)) ||
                vehicle.type_carburant_data?.nom ||
                vehicle.type_carburant_nom ||
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

export default VehiculeCategoryPage;