import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const SiteInfo = () => {
  const { data: page, isLoading } = useQuery({
    queryKey: ['/api/pages/site']
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
