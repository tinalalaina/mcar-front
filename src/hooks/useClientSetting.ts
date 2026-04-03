import { useState, useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/Actions/usersApi";
import { useCurentuser } from "@/useQuery/authUseQuery";
import { InstanceAxis } from "@/helper/InstanceAxios";
import { useToast } from "@/components/ui/use-toast";

export interface ClientSettingsFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  cin_number: string;
  address: string;
  date_of_birth: string;
  nif: string;
  stat: string;
  old_password?: string;
  new_password?: string;
  new_password_confirm: string;
}

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const toAbsoluteMediaUrl = (path?: string | null) => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const rawBaseUrl = String(InstanceAxis.defaults.baseURL || "");
  const baseUrl = rawBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  if (!baseUrl) return path;

  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

const normalizeDateOfBirth = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
};

const normalizePhoneForDisplay = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("261") && digits.length >= 12) {
    digits = digits.slice(3);
  }

  if (digits.length === 9) {
    return `0${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    return digits;
  }

  return raw;
};

const normalizePhoneForSubmit = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("261") && digits.length >= 12) {
    digits = digits.slice(3);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!digits) return "";
  return `+261${digits}`;
};

const readImageFile = (
  file: File,
  setPreview: (value: string) => void
) => {
  const reader = new FileReader();
  reader.onload = () => setPreview(reader.result as string);
  reader.readAsDataURL(file);
};

const formatBackendError = (error: any) => {
  const backendErrors = error?.response?.data;
  let description = "Impossible de mettre à jour votre profil.";

  if (backendErrors && typeof backendErrors === "object") {
    const messages = Object.entries(backendErrors)
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field}: ${value.join(", ")}`;
        }
        return `${field}: ${String(value)}`;
      })
      .join(" | ");

    if (messages) {
      description = messages;
    }
  }

  return description;
};

export const useClientSettings = () => {
  const { user, isLoading: isUserLoading } = useCurentuser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [section, setSection] = useState<"profile" | "security">("profile");

  const [previewPhoto, setPreviewPhoto] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [previewCinRecto, setPreviewCinRecto] = useState("");
  const [previewCinVerso, setPreviewCinVerso] = useState("");
  const [previewResidenceCertificate, setPreviewResidenceCertificate] =
    useState("");
  const [previewDrivingLicenseRecto, setPreviewDrivingLicenseRecto] =
    useState("");
  const [previewDrivingLicenseVerso, setPreviewDrivingLicenseVerso] =
    useState("");

  const [cinRectoFile, setCinRectoFile] = useState<File | null>(null);
  const [cinVersoFile, setCinVersoFile] = useState<File | null>(null);
  const [residenceCertificateFile, setResidenceCertificateFile] =
    useState<File | null>(null);
  const [drivingLicenseRectoFile, setDrivingLicenseRectoFile] =
    useState<File | null>(null);
  const [drivingLicenseVersoFile, setDrivingLicenseVersoFile] =
    useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ClientSettingsFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      cin_number: "",
      address: "",
      date_of_birth: "",
      nif: "",
      stat: "",
      old_password: "",
      new_password: "",
      new_password_confirm: "",
    },
  });

  const validateImageFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Format non accepté",
        description: "Utilisez une image JPG, JPEG, PNG ou WEBP.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Image trop lourde",
        description: "L'image ne doit pas dépasser 3 MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      old_password: string;
      new_password: string;
      new_password_confirm: string;
    }) => usersAPI.changePassword(data),

    onSuccess: () => {
      const currentValues = getValues();

      reset({
        ...currentValues,
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.detail ||
          "Impossible de modifier le mot de passe.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setImageFile(file);
    readImageFile(file, setPreviewPhoto);
  };

  const handleDeletePhoto = () => {
    setPreviewPhoto("");
    setImageFile(null);
  };

  const handleCinRectoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setCinRectoFile(file);
    readImageFile(file, setPreviewCinRecto);
  };

  const handleCinVersoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setCinVersoFile(file);
    readImageFile(file, setPreviewCinVerso);
  };


  const handleResidenceCertificateUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setResidenceCertificateFile(file);
    readImageFile(file, setPreviewResidenceCertificate);
  };

  const handleDrivingLicenseRectoUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setDrivingLicenseRectoFile(file);
    readImageFile(file, setPreviewDrivingLicenseRecto);
  };

  const handleDrivingLicenseVersoUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setDrivingLicenseVersoFile(file);
    readImageFile(file, setPreviewDrivingLicenseVerso);
  };

  const deleteProfilePhoto = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearProfilePhoto(user.id);
      setPreviewPhoto("");
      setImageFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "Photo supprimée",
        description: "Votre photo de profil a été supprimée.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo de profil.",
        variant: "destructive",
      });
    }
  };

  const deleteCinRecto = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearCinRecto(user.id);
      setPreviewCinRecto("");
      setCinRectoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "CIN recto supprimé",
        description: "La photo CIN recto a été supprimée.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo CIN recto.",
        variant: "destructive",
      });
    }
  };

  const deleteCinVerso = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearCinVerso(user.id);
      setPreviewCinVerso("");
      setCinVersoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "CIN verso supprimé",
        description: "La photo CIN verso a été supprimée.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo CIN verso.",
        variant: "destructive",
      });
    }
  };


  const deleteResidenceCertificate = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearResidenceCertificate(user.id);
      setPreviewResidenceCertificate("");
      setResidenceCertificateFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "Certificat supprimé",
        description: "Le certificat de résidence a été supprimé.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le certificat de résidence.",
        variant: "destructive",
      });
    }
  };

  const deleteDrivingLicenseRecto = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearDrivingLicenseRecto(user.id);
      setPreviewDrivingLicenseRecto("");
      setDrivingLicenseRectoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "Permis recto supprimé",
        description: "La photo recto du permis de conduire a été supprimée.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le recto du permis de conduire.",
        variant: "destructive",
      });
    }
  };

  const deleteDrivingLicenseVerso = async () => {
    if (!user?.id) return;

    try {
      await usersAPI.clearDrivingLicenseVerso(user.id);
      setPreviewDrivingLicenseVerso("");
      setDrivingLicenseVersoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "Permis verso supprimé",
        description: "La photo verso du permis de conduire a été supprimée.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le verso du permis de conduire.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const userWithDrivingLicense = user as typeof user & {
      permis_conduire?: string | null;
      permis_conduire_recto?: string | null;
      permis_conduire_verso?: string | null;
    };

    setPreviewPhoto(toAbsoluteMediaUrl(user.image || ""));
    setPreviewCinRecto(toAbsoluteMediaUrl(user.cin_photo_recto || ""));
    setPreviewCinVerso(toAbsoluteMediaUrl(user.cin_photo_verso || ""));
    setPreviewResidenceCertificate(
      toAbsoluteMediaUrl(user.residence_certificate || "")
    );
    setPreviewDrivingLicenseRecto(
      toAbsoluteMediaUrl(
        userWithDrivingLicense.permis_conduire_recto ||
          userWithDrivingLicense.permis_conduire ||
          ""
      )
    );
    setPreviewDrivingLicenseVerso(
      toAbsoluteMediaUrl(userWithDrivingLicense.permis_conduire_verso || "")
    );

    reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: normalizePhoneForDisplay(user.phone || ""),
      cin_number: user.cin_number || "",
      address: user.address || "",
      date_of_birth: normalizeDateOfBirth(user.date_of_birth) || "",
      nif: user.nif || "",
      stat: user.stat || "",
      old_password: "",
      new_password: "",
      new_password_confirm: "",
    });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) return;

    if (section === "security") {
      if ((values.new_password || "") !== (values.new_password_confirm || "")) {
        toast({
          title: "Erreur",
          description: "La confirmation du mot de passe ne correspond pas.",
          variant: "destructive",
        });
        return;
      }

      await changePasswordMutation.mutateAsync({
        old_password: values.old_password || "",
        new_password: values.new_password || "",
        new_password_confirm: values.new_password_confirm || "",
      });
      return;
    }

    const normalizedDateOfBirth = normalizeDateOfBirth(values.date_of_birth);

    const payload: Record<string, string> = {
      first_name: values.first_name?.trim() || "",
      last_name: values.last_name?.trim() || "",
      phone: normalizePhoneForSubmit(values.phone),
      cin_number: values.cin_number?.trim() || "",
      address: values.address?.trim() || "",
      nif: values.nif?.trim() || "",
      stat: values.stat?.trim() || "",
    };

    if (normalizedDateOfBirth) {
      payload.date_of_birth = normalizedDateOfBirth;
    }

    try {
      // 1) Save text fields first (prenom, nom, telephone, etc.)
      await usersAPI.updateUser(user.id, payload);

      // 2) Upload each file in its own request to avoid backend temp-file reuse issues.
      const fileUpdates: Array<{ key: string; file: File | null }> = [
        { key: "image", file: imageFile },
        { key: "cin_photo_recto", file: cinRectoFile },
        { key: "cin_photo_verso", file: cinVersoFile },
        { key: "residence_certificate", file: residenceCertificateFile },
        { key: "permis_conduire_recto", file: drivingLicenseRectoFile },
        { key: "permis_conduire_verso", file: drivingLicenseVersoFile },
      ];

      for (const item of fileUpdates) {
        if (!(item.file instanceof File)) continue;

        const formData = new FormData();
        formData.append(item.key, item.file, item.file.name);
        await usersAPI.updateUser(user.id, formData);
      }

      setImageFile(null);
      setCinRectoFile(null);
      setCinVersoFile(null);
      setResidenceCertificateFile(null);
      setDrivingLicenseRectoFile(null);
      setDrivingLicenseVersoFile(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
        queryClient.invalidateQueries({ queryKey: ["loyalty-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["loyalty-dashboard"] }),
      ]);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont bien été enregistrées.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: formatBackendError(error),
        variant: "destructive",
      });
    }
  });

  return {
    user,
    section,
    setSection,
    previewPhoto,
    handlePhotoUpload,
    handleDeletePhoto,
    previewCinRecto,
    previewCinVerso,
    previewResidenceCertificate,
    previewDrivingLicenseRecto,
    previewDrivingLicenseVerso,
    handleCinRectoUpload,
    handleCinVersoUpload,
    handleResidenceCertificateUpload,
    handleDrivingLicenseRectoUpload,
    handleDrivingLicenseVersoUpload,
    deleteProfilePhoto,
    deleteCinRecto,
    deleteCinVerso,
    deleteResidenceCertificate,
    deleteDrivingLicenseRecto,
    deleteDrivingLicenseVerso,
    register,
    onSubmit,
    errors,
    isSubmitting,
    isUserLoading,
  };
};
