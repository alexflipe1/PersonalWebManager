import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";

const Home = () => {
  const queryClient = useQueryClient();
  
  // Carregar botões personalizados do localStorage
  const [customButtons, setCustomButtons] = useState<any[]>([]);
  
  useEffect(() => {
    // Carregar botões do localStorage
    const storedButtons = localStorage.getItem('customButtons');
    if (storedButtons) {
      try {
        const buttons = JSON.parse(storedButtons);
        // Filtrar apenas botões para a página home
        const pageButtons = buttons.filter((btn: any) => btn.pageSlug === 'home');
        setCustomButtons(pageButtons);
      } catch (e) {
        console.error('Erro ao carregar botões personalizados:', e);
        setCustomButtons([]);
      }
    }
  }, []);
  
  // Forçar atualização dos dados ao carregar a página
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/pages/home'] });
  }, [queryClient]);
  
  const { data: page, isLoading } = useQuery({
    queryKey: ['/api/pages/home']
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-2/3 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />
        
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  
  // Renderiza os botões personalizados
  const renderCustomButtons = () => {
    if (customButtons.length === 0) return null;
    
    return (
      <div className="mt-6 flex flex-wrap gap-2">
        {customButtons.map((btn) => {
          // Definir a variante do botão
          let variant: any = "primary";
          if (btn.style === "secondary") variant = "secondary";
          if (btn.style === "outline") variant = "outline";
          if (btn.style === "ghost") variant = "ghost";
          
          // Definir o tamanho do botão
          let size: any = "default";
          if (btn.size === "sm") size = "sm";
          if (btn.size === "lg") size = "lg";
          
          // Atributos para nova aba
          const newTabProps = btn.openInNewTab 
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};
            
          // Determinar se é Link interno ou âncora externa
          if (btn.type === 'internal') {
            return (
              <Link key={btn.id} href={btn.url || '/'}>
                <Button variant={variant} size={size} className="my-1">
                  {btn.text}
                </Button>
              </Link>
            );
          } else {
            return (
              <Button
                key={btn.id}
                variant={variant}
                size={size}
                className="my-1"
                asChild
              >
                <a href={btn.url || '#'} {...newTabProps}>
                  {btn.text}
                </a>
              </Button>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div>
      {page && (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      {renderCustomButtons()}
    </div>
  );
};

export default Home;
