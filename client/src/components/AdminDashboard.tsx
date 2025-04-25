import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Menu, PaintBucket } from "lucide-react";
import PagesSection from "./admin/PagesSection";
import MenuSection from "./admin/MenuSection";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("pages");
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Site</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogout}
          className="flex items-center text-sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border rounded-md p-1 w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="pages" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Páginas</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center">
            <Menu className="mr-2 h-4 w-4" />
            <span>Menu</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages" className="space-y-4">
          <PagesSection />
        </TabsContent>
        
        <TabsContent value="menu" className="space-y-4">
          <MenuSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
