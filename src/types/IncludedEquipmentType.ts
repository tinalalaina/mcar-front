export interface IncludedEquipment {
  id: string;
  code: string;
  label: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateIncludedEquipmentPayload = {
  code: string;
  label: string;
  description?: string;
};

export type UpdateIncludedEquipmentPayload = Partial<CreateIncludedEquipmentPayload>;
