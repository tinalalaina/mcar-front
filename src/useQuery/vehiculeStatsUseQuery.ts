import { vehiculeSearchAPI } from "@/Actions/vehiculeApi";
import { VehicleSearchItem } from "@/types/vehicleSearchType";
import { useQuery } from "@tanstack/react-query";

type QueryConfig = {
  enabled?: boolean;
};

type VehicleListResponse =
  | VehicleSearchItem[]
  | {
      data?:
        | VehicleSearchItem[]
        | {
            results?: VehicleSearchItem[];
            items?: VehicleSearchItem[];
            vehicles?: VehicleSearchItem[];
          };
      items?: VehicleSearchItem[];
      vehicles?: VehicleSearchItem[];
      results?: VehicleSearchItem[];
    };

const LIVE_REFETCH_INTERVAL_MS = 15000;

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
};

const normalizeVehicleList = (payload: VehicleListResponse): VehicleSearchItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.data) {
    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.data.results)) {
      return payload.data.results;
    }

    if (Array.isArray(payload.data.items)) {
      return payload.data.items;
    }

    if (Array.isArray(payload.data.vehicles)) {
      return payload.data.vehicles;
    }
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (payload && Array.isArray(payload.vehicles)) {
    return payload.vehicles;
  }

  return [];
};

const normalizeVehicleFlags = (vehicle: VehicleSearchItem): VehicleSearchItem => {
  const rawVehicle = vehicle as any;

  const isCurrentlyReserved = toBoolean(rawVehicle.is_currently_reserved);

  const isReservable =
    typeof rawVehicle.is_reservable === "boolean"
      ? rawVehicle.is_reservable
      : !isCurrentlyReserved;

  return {
    ...vehicle,
    is_currently_reserved: isCurrentlyReserved,
    is_reservable: isReservable,
  } as VehicleSearchItem;
};

const sortVehiclesForDisplay = (vehicles: VehicleSearchItem[]) => {
  return [...vehicles].sort((a, b) => {
    const aSponsored = Number(Boolean((a as { est_sponsorise?: boolean }).est_sponsorise));
    const bSponsored = Number(Boolean((b as { est_sponsorise?: boolean }).est_sponsorise));

    if (bSponsored !== aSponsored) {
      return bSponsored - aSponsored;
    }

    const aPopular = Number(Boolean((a as { is_popular?: boolean }).is_popular));
    const bPopular = Number(Boolean((b as { is_popular?: boolean }).is_popular));

    if (bPopular !== aPopular) {
      return bPopular - aPopular;
    }

    const aTrips = Number(a.nombre_locations ?? 0);
    const bTrips = Number(b.nombre_locations ?? 0);
    if (bTrips !== aTrips) {
      return bTrips - aTrips;
    }

    const aRating = Number(a.note_moyenne ?? 0);
    const bRating = Number(b.note_moyenne ?? 0);
    if (bRating !== aRating) {
      return bRating - aRating;
    }

    const aPublished = new Date(
      String((a as { published_at?: string }).published_at ?? a.created_at ?? "")
    ).getTime();

    const bPublished = new Date(
      String((b as { published_at?: string }).published_at ?? b.created_at ?? "")
    ).getTime();

    return bPublished - aPublished;
  });
};

const buildLiveQueryOptions = (enabled?: boolean) => ({
  staleTime: 0,
  gcTime: 1000 * 60 * 5,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  retry: 1,
  enabled,
});

export const usePopularVehicles = (config?: QueryConfig) => {
  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicles", "popular"],
    queryFn: async () => {
      const payload = await vehiculeSearchAPI.popular();
      const vehicles = normalizeVehicleList(payload).map(normalizeVehicleFlags);
      return sortVehiclesForDisplay(vehicles);
    },
    ...buildLiveQueryOptions(config?.enabled),
  });
};

export const useSponsoredVehicles = (config?: QueryConfig) => {
  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicles", "sponsored"],
    queryFn: async () => {
      const payload = await vehiculeSearchAPI.sponsored();
      const vehicles = normalizeVehicleList(payload).map(normalizeVehicleFlags);
      return sortVehiclesForDisplay(vehicles);
    },
    ...buildLiveQueryOptions(config?.enabled),
  });
};

export const useCoupDeCoeurVehicles = (config?: QueryConfig) => {
  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicles", "coup-de-coeur"],
    queryFn: async () => {
      const payload = await vehiculeSearchAPI.coupDeCoeur();
      const vehicles = normalizeVehicleList(payload).map(normalizeVehicleFlags);
      return sortVehiclesForDisplay(vehicles);
    },
    ...buildLiveQueryOptions(config?.enabled),
  });
};

export const useMostBookedVehicles = (config?: QueryConfig) => {
  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicles", "most-booked"],
    queryFn: async () => {
      const payload = await vehiculeSearchAPI.mostBooked();
      const vehicles = normalizeVehicleList(payload).map(normalizeVehicleFlags);
      return sortVehiclesForDisplay(vehicles);
    },
    ...buildLiveQueryOptions(config?.enabled),
  });
};

export const useNewVehicles = (config?: QueryConfig) => {
  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicles", "new"],
    queryFn: async () => {
      const payload = await vehiculeSearchAPI.publicList();

      const vehicles = normalizeVehicleList(payload)
        .map(normalizeVehicleFlags)
        .filter((vehicle) =>
          Boolean((vehicle as { is_new_listing?: boolean }).is_new_listing)
        );

      return [...vehicles].sort((a, b) => {
        const aTime = new Date(
          String((a as { published_at?: string }).published_at ?? a.created_at ?? "")
        ).getTime();

        const bTime = new Date(
          String((b as { published_at?: string }).published_at ?? b.created_at ?? "")
        ).getTime();

        return bTime - aTime;
      });
    },
    ...buildLiveQueryOptions(config?.enabled),
  });
};