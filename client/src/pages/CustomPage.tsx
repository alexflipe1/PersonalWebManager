import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "./not-found";
import { useEffect } from "react";

const CustomPage = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Forçar atualização dos dados quando a rota muda ou a página é carregada
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [`/api/pages/${slug}`] });
  }, [queryClient, slug, location]);
  
  const { data: page, isLoading, error } = useQuery({
    queryKey: [`/api/pages/${slug}`],
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

  if (error || !page) {
    return <NotFound />;
  }

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};

export default CustomPage;
