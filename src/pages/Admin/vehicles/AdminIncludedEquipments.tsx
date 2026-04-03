import { useState } from "react";
import { ResourceListPage } from "@/components/admin/ResourceListPage";
import { AdminEntityForm } from "@/components/admin/AdminEntityForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useAllIncludedEquipmentsQuery,
  useCreateIncludedEquipmentMutation,
  useDeleteIncludedEquipmentMutation,
  useUpdateIncludedEquipmentMutation,
} from "@/useQuery/includedEquipmentsUseQuery";
import type {
  IncludedEquipment,
  CreateIncludedEquipmentPayload,
} from "@/types/IncludedEquipmentType";

export default function AdminIncludedEquipments() {
  const { data: equipments = [] } = useAllIncludedEquipmentsQuery();
  const createMutation = useCreateIncludedEquipmentMutation();
  const updateMutation = useUpdateIncludedEquipmentMutation();
  const deleteMutation = useDeleteIncludedEquipmentMutation();

  const [localData, setLocalData] = useState<IncludedEquipment[] | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<IncludedEquipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<IncludedEquipment | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const rows = localData ?? equipments;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpenCreate(true)}>Ajouter un équipement inclus</Button>
      </div>

      <ResourceListPage
        title="Équipements inclus"
        description="Gérez les équipements gratuits inclus dans les véhicules."
        columns={[
          { key: "code", header: "Code" },
          { key: "label", header: "Label" },
          { key: "description", header: "Description" },
        ]}
        data={rows}
        onEditRow={(row) => setEditingEquipment(row)}
        onDeleteRow={(row) => setDeletingEquipment(row)}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un équipement inclus</DialogTitle>
            <DialogDescription>Champ prix absent : ces équipements sont gratuits.</DialogDescription>
          </DialogHeader>
          <AdminEntityForm<CreateIncludedEquipmentPayload>
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "label", label: "Label", required: true },
              { name: "description", label: "Description" },
            ]}
            submitLabel="Créer"
            isSubmitting={createMutation.isPending}
            onSubmit={async (values) => {
              const created = await createMutation.mutateAsync(values);
              setLocalData((prev) => (prev ? [created, ...prev] : [created, ...equipments]));
              setOpenCreate(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un équipement inclus</DialogTitle>
          </DialogHeader>
          <AdminEntityForm<CreateIncludedEquipmentPayload>
            defaultValues={
              editingEquipment
                ? {
                    code: editingEquipment.code,
                    label: editingEquipment.label,
                    description: editingEquipment.description,
                  }
                : undefined
            }
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "label", label: "Label", required: true },
              { name: "description", label: "Description" },
            ]}
            submitLabel="Enregistrer"
            isSubmitting={updateMutation.isPending}
            onSubmit={async (values) => {
              if (!editingEquipment) return;
              await updateMutation.mutateAsync({ id: editingEquipment.id, payload: values });
              setLocalData(null);
              setEditingEquipment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEquipment} onOpenChange={() => setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'équipement inclus "{deletingEquipment?.label}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deletingEquipment) return;
                deleteMutation.mutate(deletingEquipment.id, {
                  onSuccess: () => {
                    setLocalData((prev) => (prev ?? equipments).filter((e) => e.id !== deletingEquipment.id));
                    setDeletingEquipment(null);
                  },
                });
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
