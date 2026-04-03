import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDriverQuery } from "@/useQuery/driverUseQuery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Phone, MapPin, CreditCard, FileText, Clock, Star, Wallet, Eye } from "lucide-react";

const DriverDetailsView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: driver, isLoading, isError } = useDriverQuery(id || "");
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
    if (isError || !driver) return <div className="p-6 text-red-500">Chauffeur non trouvé</div>;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "Non renseigné";
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const renderDocumentPreview = (url?: string | null, alt?: string) => {
        if (!url) return null;
        const isPdf = url.toLowerCase().endsWith(".pdf");

        if (isPdf) {
            return (
                <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-600 mb-2">Document PDF</p>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                        Ouvrir le document
                    </a>
                </div>
            );
        }

        return (
            <div className="rounded-lg overflow-hidden border bg-gray-50 relative group">
                <img src={url} alt={alt || "Document chauffeur"} className="w-full h-72 object-cover" />
                <button
                    type="button"
                    onClick={() => setPreviewImage({ url, title: alt || "Document chauffeur" })}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Voir
                </button>
            </div>
        );
    };

    const getResidenceValidation = () => {
        const issuedAt = driver.residence_issued_date ? new Date(driver.residence_issued_date) : null;
        const fixedValidityMonths = 3;

        if (!issuedAt) {
            return {
                issuedLabel: "Inconnu",
                validityLabel: `${fixedValidityMonths} mois`,
                expiryLabel: "Inconnue",
                isExpired: true,
                statusLabel: "Renouvellement requis",
            };
        }

        const expiryDate = new Date(issuedAt);
        expiryDate.setMonth(expiryDate.getMonth() + fixedValidityMonths);
        const now = new Date();
        const isExpired = expiryDate.getTime() < now.getTime();

        return {
            issuedLabel: formatDate(driver.residence_issued_date),
            validityLabel: `${fixedValidityMonths} mois`,
            expiryLabel: formatDate(expiryDate.toISOString()),
            isExpired,
            statusLabel: isExpired ? "Renouvellement requis" : "Valide",
        };
    };

    const residenceValidation = getResidenceValidation();

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/prestataire/drivers")}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-poppins text-gray-900">Détails du Chauffeur</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-32 h-32 mb-4">
                                <AvatarImage src={driver.profile_photo || undefined} className="object-cover" />
                                <AvatarFallback className="text-2xl">{driver.first_name[0]}{driver.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold">{driver.first_name} {driver.last_name}</h2>
                            <p className="text-gray-500 mb-2">{driver.nationality || "Nationalité inconnue"}</p>

                            <Badge variant={driver.is_available ? "default" : "secondary"} className={`mb-4 ${driver.is_available ? "bg-green-100 text-green-800" : ""}`}>
                                {driver.is_available ? "Disponible" : "Indisponible"}
                            </Badge>

                            <div className="w-full space-y-3 text-left mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{driver.phone_number}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{driver.address || "Adresse non renseignée"}, {driver.city}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{driver.experience_years} ans d'expérience</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Wallet className="w-4 h-4 text-gray-400" />
                                    <span>Tarif: {driver.driver_rate ? `${driver.driver_rate} Ar / jour` : "Non renseigné"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Tabs */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">Vue Générale</TabsTrigger>
                            <TabsTrigger value="history">Historique & Avis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6 mt-4">
                            {/* Permis de Conduire */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" /> Informations Permis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Numéro de permis</p>
                                            <p className="font-medium">{driver.license_number || "Non renseigné"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Catégorie</p>
                                            <p className="font-medium">{driver.license_category || "Non renseigné"}</p>
                                        </div>
                                        {driver.license_issued_date && (
                                            <div>
                                                <p className="text-sm text-gray-500">Délivré le</p>
                                                <p className="font-medium">{formatDate(driver.license_issued_date)}</p>
                                            </div>
                                        )}
                                        {driver.license_expiry_date && (
                                            <div>
                                                <p className="text-sm text-gray-500">Expire le</p>
                                                <p className="font-medium">{formatDate(driver.license_expiry_date)}</p>
                                            </div>
                                        )}
                                    </div>
                                    {driver.license_photo && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500 mb-2">Scan du permis</p>
                                            {renderDocumentPreview(driver.license_photo, "Permis")}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CIN */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" /> Information CIN
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Numéro CIN</p>
                                        <p className="font-medium">{driver.cin_number || "Non renseigné"}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {driver.cin_recto && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-2">Recto</p>
                                                {renderDocumentPreview(driver.cin_recto, "CIN Recto")}
                                            </div>
                                        )}
                                        {driver.cin_verso && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-2">Verso</p>
                                                {renderDocumentPreview(driver.cin_verso, "CIN Verso")}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Certificat de Résidence */}
                            {driver.residence_certificate && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" /> Certificat de Résidence
                                        </CardTitle>
                                        <CardDescription>Document justificatif de domicile</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`mb-4 rounded-lg border p-3 ${residenceValidation.isExpired ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className={`text-sm font-semibold ${residenceValidation.isExpired ? "text-red-700" : "text-green-700"}`}>
                                                        {residenceValidation.statusLabel}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Délivré le: {residenceValidation.issuedLabel} • Validité: {residenceValidation.validityLabel} • Expire le: {residenceValidation.expiryLabel}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {renderDocumentPreview(driver.residence_certificate, "Certificat de Résidence")}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="w-5 h-5" /> Dernières courses & avis
                                    </CardTitle>
                                    <CardDescription>Cette section sera alimentée quand les données d'historique seront disponibles.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                                        Aucun historique de course disponible.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewImage?.title}</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="rounded-lg overflow-hidden border bg-gray-50">
                            <img src={previewImage.url} alt={previewImage.title} className="w-full max-h-[75vh] object-contain" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DriverDetailsView;
