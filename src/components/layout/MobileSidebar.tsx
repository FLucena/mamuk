import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "../../utils/navigation";
import { cn } from "../../lib/utils";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";
import { useLanguage } from '../../context/useLanguage';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigation: NavigationItem[];
  theme: string;
  toggleTheme: () => void;
  logout: () => void;
}

export const MobileSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  navigation,
  theme,
  toggleTheme,
  logout
}: MobileSidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full grid grid-rows-[auto_1fr_auto]">
          <SheetHeader className="p-4 border-b">
            <Link 
              to="/" 
              className="flex items-center space-x-3"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Mamuk</span>
            </Link>
          </SheetHeader>
          
          <div className="overflow-auto py-2">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.nameKey} 
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "mr-3 flex items-center justify-center h-6 w-6 rounded",
                      isActive 
                        ? "text-indigo-700 dark:text-indigo-100" 
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{t(item.nameKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                onClick={toggleTheme} 
                className="w-full justify-start"
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 