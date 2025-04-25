import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  FormDescription,
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
  text: z.string().min(1, "O texto do botão é obrigatório"),
  type: z.enum(["internal", "external", "iframe", "email"]),
  internalLink: z.string().optional().nullable(),
  externalUrl: z.string().url("URL inválida").optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  pageSlug: z.string().min(1, "A página onde o botão vai aparecer é obrigatória"),
  style: z.enum(["primary", "secondary", "outline", "ghost"]).default("primary"),
  size: z.enum(["default", "sm", "lg"]).default("default"),
  openInNewTab: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface CustomButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  button: any;
}

const CustomButtonModal = ({ isOpen, onClose, button }: CustomButtonModalProps) => {
  const { toast } = useToast();
  const isEditMode = !!button;
  const [linkType, setLinkType] = useState("internal");
  
  // Buscar páginas para o dropdown
  const { data: pages = [] } = useQuery({
    queryKey: ['/api/pages']
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      type: "internal",
      internalLink: "",
      externalUrl: "",
      email: "",
      pageSlug: "",
      style: "primary",
      size: "default",
      openInNewTab: true
    }
  });
  
  const handleLinkTypeChange = (value: string) => {
    setLinkType(value);
    
    if (value === "internal") {
      form.setValue("type", "internal");
      form.setValue("externalUrl", null);
      form.setValue("email", null);
    } else if (value === "external") {
      form.setValue("type", "external");
      form.setValue("internalLink", null);
      form.setValue("email", null);
    } else if (value === "iframe") {
      form.setValue("type", "iframe");
      form.setValue("internalLink", null);
      form.setValue("email", null);
    } else if (value === "email") {
      form.setValue("type", "email");
      form.setValue("internalLink", null);
      form.setValue("externalUrl", null);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Preencher o formulário com os dados do botão existente
        form.reset({
          text: button.text,
          type: button.type,
          internalLink: button.internalLink,
          externalUrl: button.externalUrl,
          email: button.email,
          pageSlug: button.pageSlug,
          style: button.style || "primary",
          size: button.size || "default",
          openInNewTab: button.openInNewTab !== false
        });
        
        // Definir o tipo de link correto
        if (button.type === "internal") {
          setLinkType("internal");
        } else if (button.type === "external") {
          setLinkType("external");
        } else if (button.type === "iframe") {
          setLinkType("iframe");
        } else if (button.type === "email") {
          setLinkType("email");
        }
      } else {
        // Reset do formulário para novos botões
        form.reset({
          text: "",
          type: "internal",
          internalLink: "",
          externalUrl: "",
          email: "",
          pageSlug: "",
          style: "primary",
          size: "default",
          openInNewTab: true
        });
        
        setLinkType("internal");
      }
    }
  }, [button, form, isOpen]);
  
  const saveButton = (data: FormValues) => {
    // Obter os botões existentes
    const existingButtons = JSON.parse(localStorage.getItem('customButtons') || '[]');
    
    // Determinar o destino do botão
    let buttonUrl = '';
    if (data.type === 'internal' && data.internalLink) {
      buttonUrl = `/${data.internalLink}`;
    } else if (data.type === 'external' && data.externalUrl) {
      buttonUrl = data.externalUrl;
    } else if (data.type === 'iframe' && data.externalUrl) {
      buttonUrl = `/iframe?url=${encodeURIComponent(data.externalUrl)}`;
    } else if (data.type === 'email' && data.email) {
      buttonUrl = `mailto:${data.email}`;
    }
    
    if (isEditMode) {
      // Atualizar botão existente
      const updatedButtons = existingButtons.map((btn: any) => {
        if (btn.id === button.id) {
          return {
            ...btn,
            text: data.text,
            type: data.type,
            url: buttonUrl,
            internalLink: data.type === 'internal' ? data.internalLink : null,
            externalUrl: ['external', 'iframe'].includes(data.type) ? data.externalUrl : null,
            email: data.type === 'email' ? data.email : null,
            pageSlug: data.pageSlug,
            style: data.style,
            size: data.size,
            openInNewTab: data.openInNewTab
          };
        }
        return btn;
      });
      
      localStorage.setItem('customButtons', JSON.stringify(updatedButtons));
      
      toast({
        title: "Botão atualizado",
        description: "O botão foi atualizado com sucesso.",
      });
    } else {
      // Criar novo botão
      const newButton = {
        id: Date.now(), // ID único baseado no timestamp
        text: data.text,
        type: data.type,
        url: buttonUrl,
        internalLink: data.type === 'internal' ? data.internalLink : null,
        externalUrl: ['external', 'iframe'].includes(data.type) ? data.externalUrl : null,
        email: data.type === 'email' ? data.email : null,
        pageSlug: data.pageSlug,
        style: data.style,
        size: data.size,
        openInNewTab: data.openInNewTab
      };
      
      existingButtons.push(newButton);
      localStorage.setItem('customButtons', JSON.stringify(existingButtons));
      
      toast({
        title: "Botão criado",
        description: "O botão foi criado com sucesso.",
      });
    }
    
    // Forçar recarga das páginas para refletir os novos botões
    queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
    
    onClose();
    
    // Recarregar a página para mostrar as alterações
    window.location.reload();
  };
  
  const onSubmit = (data: FormValues) => {
    saveButton(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Botão" : "Novo Botão"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do Botão</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite o texto do botão" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pageSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Em qual página este botão deve aparecer?</FormLabel>
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
                  <FormDescription>
                    O botão só vai aparecer na página selecionada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Tipo de Botão</FormLabel>
              <RadioGroup 
                value={linkType} 
                onValueChange={handleLinkTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="button-internal" />
                  <FormLabel htmlFor="button-internal" className="cursor-pointer">Página Interna</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="button-external" />
                  <FormLabel htmlFor="button-external" className="cursor-pointer">URL Externa</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iframe" id="button-iframe" />
                  <FormLabel htmlFor="button-iframe" className="cursor-pointer">iFrame</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="button-email" />
                  <FormLabel htmlFor="button-email" className="cursor-pointer">Email</FormLabel>
                </div>
              </RadioGroup>
            </div>
            
            {linkType === "internal" && (
              <FormField
                control={form.control}
                name="internalLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecionar Página de Destino</FormLabel>
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
              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Externa</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://exemplo.com"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {linkType === "iframe" && (
              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL para o iFrame</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://exemplo.com" 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      O site será exibido dentro de um iframe com botão de retorno
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {linkType === "email" && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="contato@exemplo.com" 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo do Botão</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estilo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primário (azul)</SelectItem>
                        <SelectItem value="secondary">Secundário (cinza)</SelectItem>
                        <SelectItem value="outline">Contorno</SelectItem>
                        <SelectItem value="ghost">Fantasma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho do Botão</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tamanho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Médio (padrão)</SelectItem>
                        <SelectItem value="sm">Pequeno</SelectItem>
                        <SelectItem value="lg">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(linkType === "external" || linkType === "iframe") && (
              <FormField
                control={form.control}
                name="openInNewTab"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Abrir em nova aba
                      </FormLabel>
                      <FormDescription>
                        Se marcado, o link abrirá em uma nova aba do navegador
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? "Salvar Alterações" : "Criar Botão"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomButtonModal;