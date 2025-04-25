import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  text: z.string().min(1, "O texto do item é obrigatório"),
  type: z.enum(["internal", "external", "iframe"]),
  internalLink: z.string().optional().nullable(),
  externalUrl: z.string().url("URL inválida").optional().nullable(),
  openInIframe: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: any;
}

const MenuItemModal = ({ isOpen, onClose, menuItem }: MenuItemModalProps) => {
  const { toast } = useToast();
  const isEditMode = !!menuItem;
  const [linkType, setLinkType] = useState<string>("internal");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      type: "internal",
      internalLink: "",
      externalUrl: "",
      openInIframe: false
    }
  });
  
  const { data: pages = [] } = useQuery({
    queryKey: ['/api/pages'],
    enabled: isOpen
  });
  
  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu'],
    enabled: isOpen
  });
  
  // Populate form when editing
  useEffect(() => {
    if (menuItem) {
      form.reset({
        text: menuItem.text,
        type: menuItem.type,
        internalLink: menuItem.internalLink,
        externalUrl: menuItem.externalUrl,
        openInIframe: menuItem.type === "iframe"
      });
      
      setLinkType(menuItem.type === "iframe" ? "external" : menuItem.type);
    } else {
      form.reset({
        text: "",
        type: "internal",
        internalLink: "",
        externalUrl: "",
        openInIframe: false
      });
      
      setLinkType("internal");
    }
  }, [menuItem, form, isOpen]);
  
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Calculate new order
      const order = menuItems.length + 1;
      
      // Prepare data
      const menuItemData = {
        text: data.text,
        order,
        type: data.type,
        internalLink: data.type === "internal" ? data.internalLink : null,
        externalUrl: data.type !== "internal" ? data.externalUrl : null
      };
      
      // If using iframe, update type
      if (data.type === "external" && data.openInIframe) {
        menuItemData.type = "iframe";
      }
      
      const response = await apiRequest("POST", "/api/menu", menuItemData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all relevant cache entries
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      // Força recarregar as páginas, pois o menu pode afetar várias partes do site
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao menu com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item ao menu.",
        variant: "destructive",
      });
    }
  });
  
  const updateMenuItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Prepare data
      const menuItemData = {
        text: data.text,
        type: data.type,
        internalLink: data.type === "internal" ? data.internalLink : null,
        externalUrl: data.type !== "internal" ? data.externalUrl : null
      };
      
      // If using iframe, update type
      if (data.type === "external" && data.openInIframe) {
        menuItemData.type = "iframe";
      }
      
      const response = await apiRequest("PUT", `/api/menu/${menuItem.id}`, menuItemData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all relevant cache entries
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      // Força recarregar as páginas, pois o menu pode afetar várias partes do site
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      toast({
        title: "Item atualizado",
        description: "O item do menu foi atualizado com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar item",
        description: "Ocorreu um erro ao atualizar o item do menu.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    // Set the appropriate type based on the selected link type and iframe option
    const data = {
      ...values,
      type: values.type
    };

    if (isEditMode) {
      updateMenuItemMutation.mutate(data);
    } else {
      createMenuItemMutation.mutate(data);
    }
  };
  
  const handleLinkTypeChange = (value: string) => {
    setLinkType(value);
    form.setValue("type", value as "internal" | "external");
    
    // Reset the other field
    if (value === "internal") {
      form.setValue("externalUrl", "");
      form.setValue("openInIframe", false);
    } else {
      form.setValue("internalLink", "");
    }
  };
  
  const isLoading = createMenuItemMutation.isPending || updateMenuItemMutation.isPending;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Item de Menu" : "Novo Item de Menu"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do Item</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite o texto do item" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Tipo de Link</FormLabel>
              <RadioGroup 
                value={linkType} 
                onValueChange={handleLinkTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <FormLabel htmlFor="internal" className="cursor-pointer">Página Interna</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <FormLabel htmlFor="external" className="cursor-pointer">URL Externa</FormLabel>
                </div>
              </RadioGroup>
            </div>
            
            {linkType === "internal" && (
              <FormField
                control={form.control}
                name="internalLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecionar Página</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma página" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pages.map((page: any) => (
                          <SelectItem key={page.slug} value={page.slug}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {linkType === "external" && (
              <>
                <FormField
                  control={form.control}
                  name="externalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="https://exemplo.com" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="openInIframe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Abrir no iframe</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;
