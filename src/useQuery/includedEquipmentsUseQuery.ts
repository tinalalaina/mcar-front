import { includedEquipmentsAPI } from "@/Actions/IncludedEquipmentsApi";
import {
  CreateIncludedEquipmentPayload,
  IncludedEquipment,
  UpdateIncludedEquipmentPayload,
} from "@/types/IncludedEquipmentType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const useAllIncludedEquipmentsQuery = () => {
  return useQuery<IncludedEquipment[]>({
    queryKey: ["included-equipments-all"],
    queryFn: async () => {
      const { data } = await includedEquipmentsAPI.get_all_included_equipments();
      return Array.isArray(data) ? data : [];
    },
    staleTime: ONE_YEAR_MS,
    retry: 2,
  });
};

export const useCreateIncludedEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncludedEquipmentPayload) =>
      includedEquipmentsAPI.create_included_equipment(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["included-equipments-all"] });
    },
  });
};

export const useUpdateIncludedEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIncludedEquipmentPayload }) =>
      includedEquipmentsAPI.update_included_equipment(id, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["included-equipments-all"] });
    },
  });
};

export const useDeleteIncludedEquipmentMutation = () => {
  return useMutation({
    mutationFn: (id: string) => includedEquipmentsAPI.delete_included_equipment(id).then((res) => res.data),
  });
};
