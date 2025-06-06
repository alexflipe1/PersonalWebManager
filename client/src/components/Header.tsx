import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { menuItems } = useSiteData();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getPathForMenuItem = (item: any) => {
    if (item.type === 'internal') {
      if (item.internalLink === 'home') return '/';
      if (item.internalLink === 'servicos') return '/servicos';
      if (item.internalLink === 'site') return '/site';
      if (item.internalLink === 'alex') return '/alex';
      return `/${item.internalLink}`;
    } else if (item.type === 'iframe') {
      try {
        const url = item.externalUrl || '';
        const formattedUrl = url.match(/^https?:\/\//) ? url : `http://${url}`;
        return `/iframe/${encodeURIComponent(formattedUrl)}`;
      } catch (e) {
        console.error("URL inválida:", item.externalUrl);
        return '#';
      }
    } else {
      return '#';
    }
  };

  const handleMenuItemClick = (item: any, e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);

    if (item.type === 'external' && !item.openInIframe) {
      window.open(item.externalUrl, '_blank');
      e.preventDefault();
      return;
    }

    if (item.type === 'internal') {
      e.preventDefault();

      const currentProtocol = window.location.protocol;
      const currentHost = window.location.host;

      let path = '';
      if (item.internalLink === 'home') path = '';
      else if (item.internalLink === 'servicos') path = 'servicos';
      else if (item.internalLink === 'site') path = 'site';
      else if (item.internalLink === 'alex') path = 'alex';
      else path = item.internalLink;

      // Corrigido para evitar //
      const fullUrl = `${currentProtocol}//${currentHost}/${path.startsWith('/') ? path.slice(1) : path}`;
      window.location.href = fullUrl;
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          Meu Site
        </Link>

        <nav className="hidden md:flex space-x-6">
          {menuItems.map((item) => {
            const path = getPathForMenuItem(item);
            return (
              <Link
                key={item.id}
                href={path}
                onClick={(e) => handleMenuItemClick(item, e)}
                className={`relative font-medium transition-colors ${
                  isActive(path)
                    ? 'text-primary after:content-[""] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.text}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full z-10">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={getPathForMenuItem(item)}
                onClick={(e) => handleMenuItemClick(item, e)}
                className={`py-3 border-b border-gray-100 ${
                  isActive(getPathForMenuItem(item))
                    ? 'text-primary font-medium'
                    : 'text-gray-600'
                }`}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
