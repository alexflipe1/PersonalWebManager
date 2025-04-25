import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface SiteDataContextType {
  pages: any[];
  menuItems: any[];
  isLoading: boolean;
}

const SiteDataContext = createContext<SiteDataContextType>({
  pages: [],
  menuItems: [],
  isLoading: false
});

export const useSiteData = () => useContext(SiteDataContext);

interface SiteDataProviderProps {
  children: ReactNode;
}

export const SiteDataProvider = ({ children }: SiteDataProviderProps) => {
  const { 
    data: pages = [], 
    isLoading: isPagesLoading 
  } = useQuery({
    queryKey: ['/api/pages']
  });
  
  const { 
    data: menuItems = [], 
    isLoading: isMenuItemsLoading 
  } = useQuery({
    queryKey: ['/api/menu']
  });
  
  const isLoading = isPagesLoading || isMenuItemsLoading;
  
  return (
    <SiteDataContext.Provider value={{ pages, menuItems, isLoading }}>
      {children}
    </SiteDataContext.Provider>
  );
};
