import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const Services = () => {
  const queryClient = useQueryClient();
  
  // Forçar atualização dos dados ao carregar a página
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/pages/servicos'] });
  }, [queryClient]);
  
  const { data: page, isLoading } = useQuery({
    queryKey: ['/api/pages/servicos'],
    staleTime: 0 // Garantir que sempre busque os dados mais recentes
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-2/3 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />
        
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {page && (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
    </div>
  );
};

export default Services;
