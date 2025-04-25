import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const IframePage = () => {
  const { url } = useParams();
  const [, setLocation] = useLocation();
  const [previousPage, setPreviousPage] = useState("/");
  const decodedUrl = url ? decodeURIComponent(url) : "";
  
  useEffect(() => {
    // Store the previous page to return to
    const referrer = document.referrer;
    if (referrer) {
      // Extract just the path from the referrer
      const url = new URL(referrer);
      const path = url.pathname;
      if (path && path !== "/iframe") {
        setPreviousPage(path);
      }
    }
  }, []);
  
  const handleBack = () => {
    setLocation(previousPage);
  };
  
  return (
    <div className="relative w-full h-full">
      <Button 
        className="absolute top-2 left-2 z-10 flex items-center bg-white text-gray-800 hover:bg-gray-100 shadow-md"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar
      </Button>
      
      {decodedUrl ? (
        <iframe 
          src={decodedUrl} 
          className="w-full h-[calc(100vh-160px)] border-0 mt-12"
          title="External site"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-[calc(100vh-160px)] border-0 mt-12 flex items-center justify-center text-gray-400">
          URL inválida
        </div>
      )}
    </div>
  );
};

export default IframePage;
