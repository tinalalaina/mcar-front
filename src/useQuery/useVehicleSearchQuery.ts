import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { searchVehicles } from "@/Actions/vehiculeApi";
import type {
  VehicleSearchFilters,
  VehicleSearchItem,
  VehicleSearchResponse,
} from "@/types/vehicleSearchType";

const normalizeVehicleSearchResponse = (
  payload: VehicleSearchResponse | unknown
): VehicleSearchItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const dataPayload = payload as {
    data?: unknown;
    results?: unknown;
    items?: unknown;
    vehicles?: unknown;
  };

  if (Array.isArray(dataPayload.results)) {
    return dataPayload.results as VehicleSearchItem[];
  }

  if (Array.isArray(dataPayload.items)) {
    return dataPayload.items as VehicleSearchItem[];
  }

  if (Array.isArray(dataPayload.vehicles)) {
    return dataPayload.vehicles as VehicleSearchItem[];
  }

  if (dataPayload.data && typeof dataPayload.data === "object") {
    const nested = dataPayload.data as {
      results?: unknown;
      items?: unknown;
      vehicles?: unknown;
    };

    if (Array.isArray(nested.results)) {
      return nested.results as VehicleSearchItem[];
    }

    if (Array.isArray(nested.items)) {
      return nested.items as VehicleSearchItem[];
    }

    if (Array.isArray(nested.vehicles)) {
      return nested.vehicles as VehicleSearchItem[];
    }
  }

  if (Array.isArray(dataPayload.data)) {
    return dataPayload.data as VehicleSearchItem[];
  }

  return [];
};

const buildFiltersFromSearchParams = (
  search: string
): VehicleSearchFilters => {
  const params = new URLSearchParams(search);

  return {
    ville: params.get("ville") || undefined,
    categorie: params.get("categorie") || undefined,
    start_date: params.get("start_date") || undefined,
    end_date: params.get("end_date") || undefined,
    type_vehicule: params.get("type_vehicule") || undefined,
    marque: params.get("marque") || undefined,
    modele: params.get("modele") || undefined,
    min_price: params.get("min_price") || undefined,
    max_price: params.get("max_price") || undefined,
  };
};

export const useVehicleSearchQuery = () => {
  const location = useLocation();

  const filters = useMemo(
    () => buildFiltersFromSearchParams(location.search),
    [location.search]
  );

  return useQuery<VehicleSearchItem[]>({
    queryKey: ["vehicle-search", filters],
    queryFn: async () => {
      const payload = await searchVehicles(filters);
      return normalizeVehicleSearchResponse(payload);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};