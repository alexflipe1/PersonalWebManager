import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import TextEditor from "../TextEditor";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  slug: z.string().min(1, "A URL é obrigatória")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  content: z.string().min(1, "O conteúdo é obrigatório"),
  addToMenu: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface PageModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: any;
}

const PageModal = ({ isOpen, onClose, page }: PageModalProps) => {
  const { toast } = useToast();
  const isEditMode = !!page;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      addToMenu: false
    }
  });
  
  // Populate form when editing
  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content,
        addToMenu: false // We don't know this from the page data
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        content: "",
        addToMenu: false
      });
    }
  }, [page, form, isOpen]);
  
  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu'],
    enabled: isOpen
  });
  
  const createPageMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { addToMenu, ...pageData } = data;
      const pageResponse = await apiRequest("POST", "/api/pages", pageData);
      const createdPage = await pageResponse.json();
      
      if (addToMenu) {
        // Add to menu if requested
        await apiRequest("POST", "/api/menu", {
          text: data.title,
          order: menuItems.length + 1,
          type: "internal",
          internalLink: data.slug,
          externalUrl: null
        });
      }
      
      return createdPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Página criada",
        description: "A página foi criada com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar página",
        description: "Ocorreu um erro ao criar a página.",
        variant: "destructive",
      });
    }
  });
  
  const updatePageMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { addToMenu, ...pageData } = data;
      const pageResponse = await apiRequest("PUT", `/api/pages/${page.id}`, pageData);
      const updatedPage = await pageResponse.json();
      
      return updatedPage;
    },
    onSuccess: (updatedPage) => {
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${updatedPage.slug}`] });
      // Also invalidate the specific page query
      if (page && page.slug && page.slug !== updatedPage.slug) {
        queryClient.invalidateQueries({ queryKey: [`/api/pages/${page.slug}`] });
      }
      toast({
        title: "Página atualizada",
        description: "A página foi atualizada com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar página",
        description: "Ocorreu um erro ao atualizar a página.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    if (isEditMode) {
      updatePageMutation.mutate(data);
    } else {
      createPageMutation.mutate(data);
    }
  };
  
  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Only auto-generate slug if it's empty or has not been manually edited
    if (!form.getValues("slug") || form.getValues("slug") === form.getValues("title").toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      form.setValue("slug", slug);
    }
  };
  
  const isLoading = createPageMutation.isPending || updatePageMutation.isPending;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Página" : "Nova Página"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Página</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onChange={handleTitleChange}
                      placeholder="Digite o título da página" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Página</FormLabel>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">/</span>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="url-da-pagina" 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <TextEditor 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isEditMode && (
              <FormField
                control={form.control}
                name="addToMenu"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Adicionar ao menu de navegação</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
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
                {isEditMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PageModal;
