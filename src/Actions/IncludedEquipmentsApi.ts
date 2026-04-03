import { InstanceAxis } from "@/helper/InstanceAxios";
import {
  CreateIncludedEquipmentPayload,
  IncludedEquipment,
  UpdateIncludedEquipmentPayload,
} from "@/types/IncludedEquipmentType";

export const includedEquipmentsAPI = {
  get_all_included_equipments: async () => {
    return await InstanceAxis.get<IncludedEquipment[]>("/vehicule/equipements-inclus/");
  },
  get_one_included_equipment: async (id: string) => {
    return await InstanceAxis.get<IncludedEquipment>(`/vehicule/equipements-inclus/${id}/`);
  },
  create_included_equipment: async (payload: CreateIncludedEquipmentPayload) => {
    return await InstanceAxis.post<IncludedEquipment>("/vehicule/equipements-inclus/", payload);
  },
  update_included_equipment: async (id: string, payload: UpdateIncludedEquipmentPayload) => {
    return await InstanceAxis.put<IncludedEquipment>(`/vehicule/equipements-inclus/${id}/`, payload);
  },
  delete_included_equipment: async (id: string) => {
    return await InstanceAxis.delete<void>(`/vehicule/equipements-inclus/${id}/`);
  },
};
