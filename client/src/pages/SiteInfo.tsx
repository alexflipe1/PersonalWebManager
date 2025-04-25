import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const SiteInfo = () => {
  const queryClient = useQueryClient();
  
  // Forçar atualização dos dados ao carregar a página
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/pages/site'] });
  }, [queryClient]);
  
  const { data: page, isLoading } = useQuery({
    queryKey: ['/api/pages/site'],
    staleTime: 0 // Garantir que sempre busque os dados mais recentes
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-2/3 mb-6" />
        <Skeleton className="h-40 w-full" />
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

export default SiteInfo;
