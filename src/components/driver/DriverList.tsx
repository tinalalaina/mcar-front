import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Star } from "lucide-react";
import { Driver } from "@/Actions/driverApi";

interface DriverListProps {
    drivers: Driver[] | undefined;
    onEdit: (driver: Driver) => void;
    onDelete: (id: string) => void;
    onView?: (driver: Driver) => void;
}

const formatTarif = (value: unknown) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return "À définir";
    }

    return `${new Intl.NumberFormat("fr-FR").format(amount)} Ar/j`;
};

const DriverList = ({ drivers, onEdit, onDelete, onView }: DriverListProps) => {
    if (!drivers || drivers.length === 0) {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-500">
                Aucun chauffeur trouvé
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {drivers.map((driver) => {
                const driverRate = driver.driver_rate;

                return (
                    <div
                        key={driver.id}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={driver.profile_photo || undefined} />
                                    <AvatarFallback>{driver.first_name[0]}{driver.last_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-400 truncate">{driver.license_number || "PERMIS-NON-RENSEIGNÉ"}</p>
                                    <p className="font-semibold text-gray-900 truncate">{driver.first_name} {driver.last_name}</p>
                                </div>
                            </div>

                            <Badge
                                variant={driver.is_available ? "default" : "secondary"}
                                className={driver.is_available ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}
                            >
                                {driver.is_available ? "ACTIF" : "BANNI"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-md bg-gray-50 border p-2 text-center">
                                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Avis client</p>
                                <p className="text-sm font-semibold text-amber-500 inline-flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-500" /> 4.8
                                </p>
                            </div>
                            <div className="rounded-md bg-gray-50 border p-2 text-center">
                                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Ponctualité</p>
                                <p className="text-sm font-semibold text-gray-800">{Math.max(1, Math.min(5, 5 - Math.floor(driver.experience_years / 3) * 0.3)).toFixed(1)}</p>
                            </div>
                            <div className="rounded-md bg-gray-50 border p-2 text-center">
                                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Tarif chauffeur</p>
                                <p className="text-xs font-semibold text-gray-800">{formatTarif(driverRate)}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="ghost" size="icon" onClick={() => onView?.(driver)}>
                                <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(driver)}>
                                <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(driver.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DriverList;
