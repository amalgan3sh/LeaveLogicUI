import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { useState } from 'react';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const getNavItems = (): NavItem[] => {
    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Manage Employees', path: '/admin/employees', icon: Users },
        { label: 'Leave Types', path: '/admin/leave-types', icon: FileText },
        { label: 'Leave Requests', path: '/admin/leave-requests', icon: CalendarDays },
        { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ];
    } else if (user?.role?.toLowerCase() === 'manager') {
      return [
        { label: 'Dashboard', path: '/manager', icon: LayoutDashboard },
        { label: 'Team Requests', path: '/manager/team-requests', icon: CalendarDays },
        { label: 'My Leaves', path: '/manager/my-leaves', icon: FileText },
        { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
        { label: 'Settings', path: '/manager/settings', icon: Settings },
      ];
    } else {
      return [
        { label: 'Dashboard', path: '/employee', icon: LayoutDashboard },
        { label: 'Apply Leave', path: '/employee/apply-leave', icon: CalendarDays },
        { label: 'Leave History', path: '/employee/history', icon: FileText },
        { label: 'Profile', path: '/employee/profile', icon: User },
      ];
    }
  };

  const navItems = getNavItems();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: `/${user?.role}` }];

    if (pathSegments.length > 1) {
      const currentPath = pathSegments[pathSegments.length - 1];
      const navItem = navItems.find(item => item.path.endsWith(currentPath));
      if (navItem) {
        breadcrumbs.push({ label: navItem.label, path: navItem.path });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const getRoleBadgeClasses = (role: string) => {
    if (role === 'admin') {
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400';
    } else if (role === 'manager') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
    } else {
      return 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400';
    }
  };

  const getRoleDotColor = (role: string) => {
    if (role === 'admin') return 'bg-indigo-500';
    if (role === 'manager') return 'bg-purple-500';
    return 'bg-pink-500';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-sidebar-border transition-all duration-300 flex flex-col relative overflow-hidden`}
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-sidebar-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="text-sidebar-foreground font-semibold">Leave Logic</h2>
                <p className="text-sidebar-foreground/70 text-sm">Leave Management</p>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col">
          <ul className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Support active state for /manager and /Manager
              const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/25 text-sidebar-foreground shadow-md backdrop-blur-sm'
                        : 'text-sidebar-foreground/90 hover:bg-white/15 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Logout Button in Sidebar */}
          <div className="pt-4 border-t border-sidebar-border mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sidebar-foreground hover:bg-white/20 backdrop-blur-sm hover:shadow-lg group"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    {sidebarOpen && <span className="font-medium">Logout</span>}
                  </button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">
                    <p>Logout</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-primary/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={crumb.path}>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold text-foreground">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink asChild>
                          <Link to={crumb.path} className="hover:text-primary transition-colors">{crumb.label}</Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </BreadcrumbSeparator>
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Role Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800">
              <div className={`w-2 h-2 rounded-full ${getRoleDotColor(user?.role || '')}`}></div>
              <span className="text-sm font-medium capitalize">{user?.role}</span>
            </div>
            
            {/* Mobile Logout Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowLogoutDialog(true)}
              className="md:hidden hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-primary/10">
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10">
                  <Avatar className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user?.name}</p>
                      <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`w-2 h-2 rounded-full ${getRoleDotColor(user?.role || '')}`}></div>
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${getRoleBadgeClasses(user?.role || '')}`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-background via-background to-indigo-50/30 dark:to-indigo-950/20">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to logout? You will need to login again to access Leave Logic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
