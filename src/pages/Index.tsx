import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyTable, Property } from "@/components/PropertyTable";
import { PropertyModal } from "@/components/PropertyModal";
import { propertyService } from "@/services/propertyService";
import { useToast } from "@/hooks/use-toast";
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

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setModalOpen(false);
      toast({
        title: "Sucesso!",
        description: "Imóvel cadastrado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o imóvel",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Property, "id"> }) =>
      propertyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setModalOpen(false);
      setEditingProperty(null);
      toast({
        title: "Sucesso!",
        description: "Imóvel atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o imóvel",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Sucesso!",
        description: "Imóvel removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o imóvel",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: Omit<Property, "id">) => {
    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete !== null) {
      deleteMutation.mutate(propertyToDelete);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProperty(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="https://le-de.cdn-website.com/47964109303643efbdc0c53fda28e1cb/dms3rep/multi/opt/Logo-Tagline-a3d2eb0c-1920w.png"
              alt="Welhome"
              className="h-12 hidden md:block"
            />
            <img 
              src="https://le-de.cdn-website.com/47964109303643efbdc0c53fda28e1cb/dms3rep/multi/opt/Logo-Tagline-a3d2eb0c-d996cd7d-260w.png"
              alt="Welhome"
              className="h-10 md:hidden"
            />
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-accent hover:bg-accent/90 gap-2"
            >
              <Plus className="h-5 w-5" />
              Novo Imóvel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">Lista de Imóveis</h2>
          <p className="text-muted-foreground">
            Gerencie todos os seus imóveis cadastrados na plataforma
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando imóveis...</p>
          </div>
        ) : (
          <PropertyTable
            properties={properties}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modal */}
      <PropertyModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        property={editingProperty}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
