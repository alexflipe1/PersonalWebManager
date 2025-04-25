import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, ExternalLink, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CustomButtonModal from "./CustomButtonModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/hooks/use-toast";

const CustomButtonsSection = () => {
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<any>(null);
  const { toast } = useToast();
  
  // Obter páginas para associar os botões
  const { data: pages = [], isLoading: isPagesLoading } = useQuery({
    queryKey: ['/api/pages']
  });

  // A lista de botões virá do localStorage por enquanto
  const buttons = JSON.parse(localStorage.getItem('customButtons') || '[]');
  const isLoading = isPagesLoading;
  
  const handleCreateButton = () => {
    setCurrentButton(null);
    setIsButtonModalOpen(true);
  };
  
  const handleEditButton = (button: any) => {
    setCurrentButton(button);
    setIsButtonModalOpen(true);
  };
  
  const handleDeleteButton = (button: any) => {
    setCurrentButton(button);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (currentButton) {
      // Remover botão do localStorage
      const updatedButtons = buttons.filter((b: any) => b.id !== currentButton.id);
      localStorage.setItem('customButtons', JSON.stringify(updatedButtons));
      
      toast({
        title: "Botão excluído",
        description: "O botão foi excluído com sucesso.",
      });
      
      // Forçar recarga das páginas
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      setIsDeleteModalOpen(false);
      
      // Recarregar a página para mostrar as alterações
      window.location.reload();
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gerenciar Botões Personalizados</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Texto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Página</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciar Botões Personalizados</h2>
        <Button onClick={handleCreateButton} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-1 h-4 w-4" />
          Novo Botão
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Página</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buttons.map((button: any) => {
              const pageName = pages.find((p: any) => p.slug === button.pageSlug)?.title || 'Página não encontrada';
              
              return (
                <TableRow key={button.id}>
                  <TableCell className="font-medium">{button.text}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      button.type === 'internal' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                        : button.type === 'iframe' 
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                          : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }>
                      {button.type === 'internal' && <Square className="mr-1 h-3 w-3" />}
                      {button.type === 'external' && <ExternalLink className="mr-1 h-3 w-3" />}
                      {button.type === 'iframe' && <Square className="mr-1 h-3 w-3" />}
                      {button.type === 'internal' ? 'Página' : 
                       button.type === 'iframe' ? 'iFrame' : 'Externo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{pageName}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleEditButton(button)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1"
                      onClick={() => handleDeleteButton(button)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {buttons.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  Nenhum botão personalizado encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <CustomButtonModal 
        isOpen={isButtonModalOpen} 
        onClose={() => setIsButtonModalOpen(false)} 
        button={currentButton}
      />
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o botão "${currentButton?.text}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default CustomButtonsSection;