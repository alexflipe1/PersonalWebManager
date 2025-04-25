import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "./not-found";

const CustomPage = () => {
  const { slug } = useParams();
  
  const { data: page, isLoading, error } = useQuery({
    queryKey: [`/api/pages/${slug}`]
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
