import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Driver, CreateDriverPayload } from "@/Actions/driverApi";
import { FilePlus2, FileText, Home, IdCard } from "lucide-react";

export interface DriverFormState extends Omit<CreateDriverPayload, "profile_photo" | "license_photo" | "cin_recto" | "cin_verso" | "residence_certificate"> {
    profile_photo?: File | string | null;
    license_photo?: File | string | null;
    cin_recto?: File | string | null;
    cin_verso?: File | string | null;
    residence_certificate?: File | string | null;
    driver_rate?: number | null;
}

interface DriverFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    initialData: Driver | null;
    isLoading: boolean;
}

const initialFormState: DriverFormState = {
    first_name: "",
    last_name: "",
    phone_number: "",
    experience_years: 0,
    is_available: true,
    address: "",
    city: "",
    nationality: "",
    cin_number: "",
    license_number: "",
    license_category: "",
    license_issued_date: "",
    license_expiry_date: "",
    residence_issued_date: "",
    profile_photo: null,
    license_photo: null,
    cin_recto: null,
    cin_verso: null,
    residence_certificate: null,
    driver_rate: "",
};

const FILE_FIELDS: Array<keyof DriverFormState> = [
    "profile_photo",
    "license_photo",
    "cin_recto",
    "cin_verso",
    "residence_certificate",
];

const DriverForm = ({ isOpen, onClose, onSubmit, initialData, isLoading }: DriverFormProps) => {
    const [formData, setFormData] = useState<DriverFormState>(initialFormState);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | undefined>(undefined);
    const [documentPreviews, setDocumentPreviews] = useState<Partial<Record<keyof DriverFormState, string>>>({});

    useEffect(() => {
        if (initialData) {
            const apiRate = (initialData as Driver & { driver_rate?: number | null }).driver_rate;
            setFormData({
                first_name: initialData.first_name,
                last_name: initialData.last_name,
                phone_number: initialData.phone_number,
                experience_years: initialData.experience_years,
                is_available: initialData.is_available,
                address: initialData.address || "",
                city: initialData.city || "",
                nationality: initialData.nationality || "",
                cin_number: initialData.cin_number || "",
                license_number: initialData.license_number || "",
                license_category: initialData.license_category || "",
                license_issued_date: initialData.license_issued_date || "",
                license_expiry_date: initialData.license_expiry_date || "",
                profile_photo: initialData.profile_photo || null,
                license_photo: initialData.license_photo || null,
                cin_recto: initialData.cin_recto || null,
                cin_verso: initialData.cin_verso || null,
                residence_certificate: initialData.residence_certificate || null,
                residence_issued_date: initialData.residence_issued_date || "",
                driver_rate: initialData.driver_rate ? String(initialData.driver_rate) : "",
            });
        } else {
            setFormData(initialFormState);
        }
    }, [initialData, isOpen]);

    const handleFileChange = (field: keyof DriverFormState, file: File | null) => {
        setFormData((prev) => ({ ...prev, [field]: file }));
    };

    useEffect(() => {
        if (formData.profile_photo instanceof File) {
            const objectUrl = URL.createObjectURL(formData.profile_photo);
            setProfilePhotoPreview(objectUrl);

            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }

        if (typeof formData.profile_photo === "string" && formData.profile_photo.length > 0) {
            setProfilePhotoPreview(formData.profile_photo);
            return;
        }

        setProfilePhotoPreview(undefined);
    }, [formData.profile_photo]);

    const { cin_recto, cin_verso, license_photo, residence_certificate } = formData;

    useEffect(() => {
        const nextPreviews: Partial<Record<keyof DriverFormState, string>> = {};
        const objectUrls: string[] = [];

        const resolvePreview = (field: keyof DriverFormState, currentValue: DriverFormState[keyof DriverFormState]) => {
            if (currentValue instanceof File) {
                if (currentValue.type.startsWith("image/")) {
                    const objectUrl = URL.createObjectURL(currentValue);
                    nextPreviews[field] = objectUrl;
                    objectUrls.push(objectUrl);
                }
                return;
            }

            if (typeof currentValue === "string" && currentValue.length > 0) {
                const isPdf = currentValue.toLowerCase().endsWith(".pdf");
                if (!isPdf) {
                    nextPreviews[field] = currentValue;
                }
            }
        };

        resolvePreview("cin_recto", cin_recto);
        resolvePreview("cin_verso", cin_verso);
        resolvePreview("license_photo", license_photo);
        resolvePreview("residence_certificate", residence_certificate);

        setDocumentPreviews(nextPreviews);

        return () => {
            objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
        };
    }, [cin_recto, cin_verso, license_photo, residence_certificate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "driver_rate") {
                if (value !== null && value !== undefined && value !== "") {
                    const normalizedRate = String(value).replace(/\s+/g, "").replace(",", ".");
                    if (!Number.isNaN(Number(normalizedRate))) {
                        data.append("driver_rate", normalizedRate);
                    }
                }
                return;
            }

            const isFileField = FILE_FIELDS.includes(key as keyof DriverFormState);
            if (isFileField) {
                if (value instanceof File) {
                    data.append(key, value);
                }
                return;
            }

            if (value !== null && value !== undefined && value !== "" && typeof value !== "object") {
                data.append(key, String(value));
            }
        });

        await onSubmit(data);
    };

    const renderFilePreview = (field: keyof DriverFormState) => {
        const value = formData[field];
        const previewSrc = documentPreviews[field];
        const isPdfFile = value instanceof File ? value.type === "application/pdf" : typeof value === "string" && value.toLowerCase().endsWith(".pdf");
        const fileName = value instanceof File ? value.name : undefined;

        if (previewSrc) {
            return (
                <div className="border rounded-md p-2 bg-muted/30">
                    <p className="text-[11px] text-gray-500 mb-1">Aperçu</p>
                    <img src={previewSrc} alt={`Aperçu ${field}`} className="w-full h-20 object-cover rounded" />
                </div>
            );
        }

        if (isPdfFile) {
            return (
                <div className="border rounded-md p-2 bg-muted/30 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div className="text-[11px] leading-tight text-gray-600">
                        <p className="font-medium">PDF sélectionné</p>
                        {fileName && <p className="truncate max-w-[120px]">{fileName}</p>}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</DialogTitle>
                    <DialogDescription>Remplissez les informations du chauffeur.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-20 w-20 border-2 border-gray-200">
                            <AvatarImage src={profilePhotoPreview} />
                            <AvatarFallback>{formData.first_name?.[0] || "C"}{formData.last_name?.[0] || "H"}</AvatarFallback>
                        </Avatar>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="max-w-xs"
                            onChange={(e) => handleFileChange("profile_photo", e.target.files ? e.target.files[0] : null)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Prénom *</Label>
                            <Input id="first_name" required placeholder="Ex: Jean" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Nom *</Label>
                            <Input id="last_name" required placeholder="Ex: Rakoto" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cin_number">CIN (carte d'identité)</Label>
                            <Input id="cin_number" placeholder="Ex : 101 222 333 444" value={formData.cin_number || ""} onChange={(e) => setFormData({ ...formData, cin_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="license_number">Numéro permis</Label>
                            <Input id="license_number" placeholder="Ex: PERM-123-MG" value={formData.license_number || ""} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="phone">Téléphone *</Label>
                            <Input id="phone" required placeholder="Ex: 034 00 000 00" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp">Expérience (ans)</Label>
                            <Input id="exp" type="number" min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) || 0 })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driver_rate">Tarif du chauffeur (Ar / jour)</Label>
                            <Input
                                id="driver_rate"
                                type="text"
                                inputMode="decimal"
                                placeholder="Ex: 80 000 ou 80000.50"
                                value={formData.driver_rate ?? ""}
                                onChange={(e) => setFormData({ ...formData, driver_rate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Ville</Label>
                            <Input id="city" value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationalité</Label>
                            <Input id="nationality" value={formData.nationality || ""} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} />
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documents requis</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="border border-dashed rounded-md p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium"><IdCard className="w-4 h-4" /> Scan CIN</div>
                                <Input id="cin_recto" type="file" accept="image/*" onChange={(e) => handleFileChange("cin_recto", e.target.files ? e.target.files[0] : null)} />
                                {renderFilePreview("cin_recto")}
                                <Input id="cin_verso" type="file" accept="image/*" onChange={(e) => handleFileChange("cin_verso", e.target.files ? e.target.files[0] : null)} />
                                {renderFilePreview("cin_verso")}
                            </div>
                            <div className="border border-dashed rounded-md p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium"><FilePlus2 className="w-4 h-4" /> Permis</div>
                                <Input id="license_category" placeholder="Catégorie (B, C...)" value={formData.license_category || ""} onChange={(e) => setFormData({ ...formData, license_category: e.target.value })} />
                                <Input id="license_photo" type="file" accept="image/*" onChange={(e) => handleFileChange("license_photo", e.target.files ? e.target.files[0] : null)} />
                                {renderFilePreview("license_photo")}
                            </div>
                            <div className="border border-dashed rounded-md p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium"><Home className="w-4 h-4" /> Certif. Résidence</div>
                                <Label htmlFor="residence_issued_date" className="text-xs text-gray-600">
                                    Date d’obtention du certificat de résidence
                                </Label>
                                <Input
                                    id="residence_issued_date"
                                    type="date"
                                    value={formData.residence_issued_date || ""}
                                    onChange={(e) => setFormData({ ...formData, residence_issued_date: e.target.value })}
                                />
                                <p className="text-[11px] text-gray-500">Validité fixée automatiquement à 3 mois.</p>
                                <Input id="residence_certificate" type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange("residence_certificate", e.target.files ? e.target.files[0] : null)} />
                                {renderFilePreview("residence_certificate")}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#0B1736] hover:bg-[#0d214d]">
                            {isLoading ? "Enregistrement..." : initialData ? "Mettre à jour le chauffeur" : "Ajouter le chauffeur"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DriverForm;
