export type ApiId = string;

export type VehicleWorkflowStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED";

export type VehicleType = "TOURISME" | "UTILITAIRE";

export type VehicleAvailabilityType =
  | "AVAILABLE"
  | "BLOCKED"
  | "MAINTENANCE"
  | "RESERVED";

export type VehiclePricingZone = "URBAIN" | "PROVINCE";

export type BasicNamedEntity = {
  id: ApiId;
  nom?: string;
  label?: string;
  parent?: ApiId | null;
  created_at?: string;
  updated_at?: string;
};

export type VehicleOwnerData = {
  id: ApiId;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  phone?: string | null;
  profile_photo?: string | null;
  role?: string;
};

export type DriverData = {
  id: ApiId;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  profile_photo?: string | null;
  experience_years?: number | null;
  phone_number?: string | null;
  driver_rate?: number | string | null;
};

export type VehicleEquipment = {
  id: ApiId;
  code?: string;
  label: string;
  description?: string;
  price?: number | string | null;
  created_at?: string;
  updated_at?: string;
};

export type IncludedEquipment = {
  id: UUID;
  code?: string;
  label: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type VehiclePhoto = {
  id: ApiId;
  vehicle?: ApiId;
  image?: string;
  image_url?: string | null;
  caption?: string;
  order?: number;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type VehicleDocument = {
  id: ApiId;
  vehicle: ApiId;
  carte_grise?: string | null;
  visite_technique?: string | null;
  assurance?: string | null;
  is_valide?: boolean;
  rejection_reason?: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: ApiId | string | null;
  created_at?: string;
  updated_at?: string;
  is_complete?: boolean;
};

export type VehicleAvailability = {
  id: ApiId;
  vehicle?: ApiId;
  start_date: string;
  end_date: string;
  type: VehicleAvailabilityType;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type VehiclePricing = {
  id?: ApiId;
  zone_type: VehiclePricingZone;
  prix_jour: number | string;
  prix_heure?: number | string | null;
  prix_mois?: number | string | null;
  prix_par_semaine?: number | string | null;
  remise_par_heure?: number | string | null;
  remise_par_jour?: number | string | null;
  remise_par_semaine?: number | string | null;
  remise_par_mois?: number | string | null;
  remise_longue_duree_pourcent?: number | string | null;
};

export type Vehicule = {
  id: ApiId;

  proprietaire?: ApiId;
  proprietaire_data?: VehicleOwnerData | null;

  driver?: ApiId | null;
  driver_data?: DriverData | null;

  titre: string;

  marque?: ApiId | BasicNamedEntity | null;
  marque_data?: BasicNamedEntity | null;
  marque_nom?: string;

  modele?: ApiId | BasicNamedEntity | null;
  modele_data?: BasicNamedEntity | null;
  modele_label?: string;

  categorie?: ApiId | BasicNamedEntity | null;
  categorie_data?: BasicNamedEntity | null;
  categorie_nom?: string;

  transmission?: ApiId | BasicNamedEntity | null;
  transmission_data?: BasicNamedEntity | null;
  transmission_nom?: string;

  type_carburant?: ApiId | BasicNamedEntity | null;
  type_carburant_data?: BasicNamedEntity | null;
  type_carburant_nom?: string;

  statut?: ApiId | BasicNamedEntity | null;
  statut_data?: BasicNamedEntity | null;

  type_vehicule: VehicleType;

  annee: number;
  numero_immatriculation?: string;
  numero_serie?: string;

  nombre_places: number;
  nombre_portes?: number;
  couleur?: string;
  kilometrage_actuel_km?: number;
  volume_coffre_litres?: number | null;

  adresse_localisation?: string;
  ville?: string;
  zone?: string;

  devise?: string;
  montant_caution?: number | string;

  description?: string;
  conditions_particulieres?: string;

  equipements?: ApiId[] | VehicleEquipment[];
  equipements_details?: VehicleEquipment[];
  included_equipments?: UUID[] | IncludedEquipment[];
  included_equipments_details?: IncludedEquipment[];

  photos?: VehiclePhoto[];
  photo_principale?: string | null;

  documents?: VehicleDocument[];
  availabilities?: VehicleAvailability[];
  pricing_grid?: VehiclePricing[];

  prix_jour?: number | string | null;
  prix_heure?: number | string | null;
  prix_mois?: number | string | null;
  prix_par_semaine?: number | string | null;

  remise_par_heure?: number | string | null;
  remise_par_jour?: number | string | null;
  remise_par_semaine?: number | string | null;
  remise_par_mois?: number | string | null;
  remise_longue_duree_pourcent?: number | string | null;

  province_prix_jour?: number | string | null;
  province_prix_heure?: number | string | null;
  province_prix_mois?: number | string | null;
  province_prix_par_semaine?: number | string | null;

  province_remise_par_heure?: number | string | null;
  province_remise_par_jour?: number | string | null;
  province_remise_par_semaine?: number | string | null;
  province_remise_par_mois?: number | string | null;
  province_remise_longue_duree_pourcent?: number | string | null;

  uploaded_photos?: File[];

  documents_complete?: boolean;
  documents_validated?: boolean;
  is_publicly_visible?: boolean;

  valide?: boolean;
  workflow_status?: VehicleWorkflowStatus;
  review_comment?: string;
  reviewed_by?: ApiId | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  published_at?: string | null;

  est_certifie?: boolean;
  est_sponsorise?: boolean;
  est_coup_de_coeur?: boolean;
  est_disponible?: boolean;

  note_moyenne?: number | string | null;
  nombre_locations?: number;
  nombre_favoris?: number;

  is_new_listing?: boolean;
  is_popular?: boolean;
  is_currently_reserved?: boolean;
  is_reservable?: boolean;

  created_at?: string;
  updated_at?: string;
};

export type CreateVehiculePayload = Partial<
  Omit<
    Vehicule,
    | "id"
    | "photos"
    | "documents"
    | "availabilities"
    | "pricing_grid"
    | "proprietaire_data"
    | "driver_data"
    | "equipements_details"
    | "included_equipments_details"
    | "marque_data"
    | "modele_data"
    | "categorie_data"
    | "transmission_data"
    | "type_carburant_data"
    | "statut_data"
  >
>;

export type UpdateVehiculePayload = Partial<CreateVehiculePayload>;

export type ReviewVehiclePayload = {
  action: "approve" | "reject";
  review_comment?: string;
};
