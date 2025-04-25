import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import SiteInfo from "./pages/SiteInfo";
import Admin from "./pages/Admin";
import CustomPage from "./pages/CustomPage";
import IframePage from "./pages/IframePage";
import NotFound from "./pages/not-found";
import { SiteDataProvider } from "./hooks/useSiteData";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <SiteDataProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-6">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/servicos" component={Services} />
                  <Route path="/site" component={SiteInfo} />
                  <Route path="/alex" component={Admin} />
                  <Route path="/iframe/:url*" component={IframePage} />
                  <Route path="/page/:slug" component={CustomPage} />
                  {/* Rota para páginas personalizadas na raiz do site */}
                  <Route path="/:slug" component={CustomPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </SiteDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
