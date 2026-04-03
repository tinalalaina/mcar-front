export type UUID = string;

export type VehiclePrimitiveRef = {
  id: UUID;
  nom?: string;
  label?: string;
};

export type VehiclePhotoSearch = {
  id: UUID;
  image_url: string | null;
  is_primary: boolean;
  caption?: string;
  order?: number;
};

export type VehicleSearchItem = {
  id: UUID;

  titre: string;
  annee: number;
  nombre_places: number;

  marque?: VehiclePrimitiveRef | null;
  modele?: VehiclePrimitiveRef | null;
  categorie?: VehiclePrimitiveRef | null;
  transmission?: VehiclePrimitiveRef | null;
  type_carburant?: VehiclePrimitiveRef | null;
  statut?: VehiclePrimitiveRef | null;

  marque_nom?: string;
  modele_label?: string;
  categorie_nom?: string;
  transmission_nom?: string;
  type_carburant_nom?: string;

  ville?: string | null;
  zone?: string | null;

  note_moyenne?: number | string | null;
  nombre_locations?: number;
  nombre_favoris?: number;

  prix_jour?: number | string | null;
  devise?: string;

  photo_principale?: string | null;
  photos?: VehiclePhotoSearch[];

  est_certifie?: boolean;
  est_disponible?: boolean;
  est_sponsorise?: boolean;
  est_coup_de_coeur?: boolean;

  valide?: boolean;
  workflow_status?: string;
  review_comment?: string | null;

  documents_complete?: boolean;
  documents_validated?: boolean;
  is_publicly_visible?: boolean;

  is_new_listing?: boolean;
  is_popular?: boolean;
  is_currently_reserved?: boolean;
  is_reservable?: boolean;

  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
};

export type VehicleSearchFilters = {
  marque?: string;
  modele?: string;
  categorie?: string;
  ville?: string;
  min_price?: number | string;
  max_price?: number | string;
  start_date?: string;
  end_date?: string;
  type_vehicule?: string;
  est_sponsorise?: boolean;
  est_coup_de_coeur?: boolean;
  est_disponible?: boolean;
};

export type VehicleSearchResponse =
  | VehicleSearchItem[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: VehicleSearchItem[];
      items?: VehicleSearchItem[];
      vehicles?: VehicleSearchItem[];
      data?:
        | VehicleSearchItem[]
        | {
            results?: VehicleSearchItem[];
            items?: VehicleSearchItem[];
            vehicles?: VehicleSearchItem[];
          };
    };