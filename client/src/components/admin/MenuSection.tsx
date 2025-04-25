import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MenuItemModal from "./MenuItemModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/hooks/use-toast";

const MenuSection = () => {
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['/api/menu']
  });
  
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Item excluído",
        description: "O item do menu foi excluído com sucesso.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item do menu.",
        variant: "destructive",
      });
    }
  });
  
  const reorderMenuItemsMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      await apiRequest("POST", "/api/menu/reorder", { itemIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
    },
    onError: () => {
      toast({
        title: "Erro ao reordenar",
        description: "Ocorreu um erro ao reordenar os itens do menu.",
        variant: "destructive",
      });
    }
  });
  
  const handleCreateMenuItem = () => {
    setCurrentMenuItem(null);
    setIsMenuItemModalOpen(true);
  };
  
  const handleEditMenuItem = (item: any) => {
    setCurrentMenuItem(item);
    setIsMenuItemModalOpen(true);
  };
  
  const handleDeleteMenuItem = (item: any) => {
    setCurrentMenuItem(item);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (currentMenuItem) {
      deleteMenuItemMutation.mutate(currentMenuItem.id);
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gerenciar Menu</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">Arraste e solte os itens para reordenar o menu.</p>
            
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciar Menu</h2>
        <Button onClick={handleCreateMenuItem} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-1 h-4 w-4" />
          Novo Item
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4">Arraste e solte os itens para reordenar o menu.</p>
          
          <ul className="space-y-2">
            {menuItems.map((item: any) => (
              <li 
                key={item.id} 
                className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <GripVertical className="text-gray-400 mr-2 cursor-move" />
                  <span className="font-medium">
                    {item.text}
                    {item.type === 'external' && (
                      <ExternalLink className="inline ml-1 h-3 w-3 text-gray-500" />
                    )}
                  </span>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => handleEditMenuItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1"
                    onClick={() => handleDeleteMenuItem(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
            
            {menuItems.length === 0 && (
              <li className="text-center py-6 text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                Nenhum item no menu. Adicione itens clicando no botão "Novo Item".
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
      
      <MenuItemModal
        isOpen={isMenuItemModalOpen}
        onClose={() => setIsMenuItemModalOpen(false)}
        menuItem={currentMenuItem}
      />
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o item "${currentMenuItem?.text}" do menu? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmVariant="destructive"
        isLoading={deleteMenuItemMutation.isPending}
      />
    </div>
  );
};

export default MenuSection;
