
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import TodoSidebar from "@/components/todos/TodoSidebar";
import GlytchPanel from "@/components/assistant/GlytchPanel";
import { AppNotification } from "@/entities/AppNotification";
import { User } from "@/entities/User";
import {
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  ListChecks,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  User as UserIcon,
  LogOut,
  Sliders,
  Sprout,
  Bot,
  Home as HomeIcon,
  Bell,
  Users,
  Plus,
  LayoutDashboard,
  MessageSquare,
  Workflow,
  Contact,
  PenTool,
  Code,
  Palette,
  ChefHat,
  Map,
  PawPrint,
  FileText,
  Shield,
  Briefcase, // New icon
  MoreHorizontal, // New icon
} from "lucide-react";
import { cn } from "@/lib/utils"; // New import
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // New imports
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f231_splash_with_glytch.png";

// Dark Mode Hook - Persistent across platform
const usePersistentDarkMode = () => {
  const [darkMode, setDarkModeState] = useState(() => {
    // Initialize from localStorage or default to false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('abc-dashboard-dark-mode');
      if (stored !== null) {
        return JSON.parse(stored);
      }
      // Check system preference as fallback
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const setDarkMode = (value) => {
    const newValue = typeof value === 'function' ? value(darkMode) : value;
    setDarkModeState(newValue);
    // Persist to localStorage immediately
    localStorage.setItem('abc-dashboard-dark-mode', JSON.stringify(newValue));
  };

  useEffect(() => {
    // Apply dark mode class to document
    const root = document.documentElement;
    const body = document.body;
    
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      // Set data attribute for additional CSS targeting
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  // Listen for system theme changes when no preference is stored
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-change if user hasn't set a manual preference
      const hasManualPreference = localStorage.getItem('abc-dashboard-dark-mode');
      if (!hasManualPreference) {
        setDarkModeState(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return [darkMode, setDarkMode];
};

const toolCategories = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    tools: [
      { name: "Overview", page: "Dashboard" },
      { name: "Analytics", page: "Analytics" },
    ]
  },
  {
    id: "community_work",
    name: "Community Work Hub",
    icon: Users,
    tools: [
      { name: "Resource Map & Jobs", page: "CommunityWorkHub" },
      { name: "Day Labor Hub", page: "DayLaborHub" },
      { name: "Post a Gig", page: "PostGig" },
      { name: "Worker Profile", page: "WorkerProfile" },
    ]
  },
  {
    id: "assistant",
    name: "GLYTCH Assistant",
    icon: Bot,
    tools: [
      { name: "Chat Assistant", page: "Assistant" },
      { name: "Task Automation", page: "Automation" }
    ]
  },
  {
    id: "support",
    name: "Community Support",
    icon: MessageSquare,
    tools: [
      { name: "Help Desk", page: "HelpDesk" },
      { name: "Reddit Integration", page: "RedditIntegration" },
    ]
  },
  {
    id: "crm",
    name: "CRM & Contacts",
    icon: Contact,
    tools: [
      { name: "Contact Manager", page: "Contacts" },
      { name: "Lead Tracker", page: "Leads" },
      { name: "Email Campaigns", page: "EmailCampaigns" }
    ]
  },
  {
    id: "content_generation",
    name: "Content Creation",
    icon: PenTool,
    tools: [
      { name: "AI Content Writer", page: "ContentWriter" },
      { name: "Logo Generator", page: "LogoGenerator" },
      { name: "Logo Maker", page: "LogoMaker" },
      { name: "Social Media Posts", page: "SocialPosts" },
      { name: "Reddit Manager", page: "RedditIntegration" }
    ]
  },
  {
    id: "office_suite",
    name: "Office Suite",
    icon: FileText,
    tools: [
      { name: "Documents", page: "DocEditor" },
      { name: "Spreadsheets", page: "SheetEditor" },
      { name: "Presentations", page: "SlideEditor" }
    ]
  },
  {
    id: "development",
    name: "Development",
    icon: Code,
    tools: [
      { name: "Website Builder", page: "WebsiteBuilder" },
      { name: "Code Snippets", page: "CodeSnippets" },
      { name: "API Tester", page: "ApiTester" },
      { name: "API Integrations", page: "ApiIntegrations" },
      { name: "Data Import", page: "DataImport" }
    ]
  },
  {
    id: "productivity",
    name: "Productivity",
    icon: Workflow,
    tools: [
      { name: "Project Manager", page: "Projects" },
      { name: "Time Tracker", page: "TimeTracker" },
      { name: "Mind Maps", page: "MindMaps" },
      { name: "Habit Tracker", page: "HabitTracker" }
    ]
  },
  {
    id: "creative_tools",
    name: "Creative Tools",
    icon: Palette,
    tools: [
      { name: "Screen Recorder", page: "ScreenRecorder" },
      { name: "Design Studio", page: "DesignStudio" },
      { name: "Color Palette", page: "ColorPalette" },
      { name: "Font Matcher", page: "FontMatcher" }
    ]
  },
  {
    id: "home_integrations",
    name: "Home Integrations",
    icon: ChefHat,
    tools: [
      { name: "Glytch's Kitchen", page: "GlytchsKitchen" },
      { name: "Recipe Sharing", page: "RecipeSharing" },
      { name: "Meal Planner", page: "MealPlanner" },
      { name: "Family Traditions", page: "FamilyTraditions" }
    ]
  },
  {
    id: "yard_garden",
    name: "Yard & Garden",
    icon: Sprout,
    tools: [
      { name: "Care Hub", page: "YardCare" },
      { name: "My Plants", page: "MyPlants" },
      { name: "Yard Designer", page: "YardDesigner" },
      { name: "Sod Calculator", page: "SodCalculator" }
    ]
  },
  {
    id: "smart_home",
    name: "Smart Home",
    icon: HomeIcon,
    tools: [
      { name: "Device Dashboard", page: "SmartHome" },
      { name: "Automation Rules", page: "SmartAutomation" },
      { name: "Energy Monitor", page: "EnergyMonitor" }
    ]
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    tools: [
      { name: "Security Center", page: "SecurityCenter" }
    ]
  },
  {
    id: "farm_ranch",
    name: "Farm & Ranch",
    icon: PawPrint,
    tools: [
        { name: "Animal Nutrition", page: "AnimalNutrition" },
    ]
  },
  {
    id: "community",
    name: "Community",
    icon: Map,
    tools: [
        { name: "Utilities Map", page: "CommunityMap" }
    ]
  }
];

const MobileBottomNav = ({ toolCategories }) => {
  const location = useLocation();

  const mainNavItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Work", page: "CommunityWorkHub", icon: Briefcase },
    { name: "Assistant", page: "Assistant", icon: Bot },
    { name: "Contacts", page: "Contacts", icon: Contact },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border z-50 md:hidden">
      <div className="grid h-full grid-cols-5 max-w-lg mx-auto">
        {mainNavItems.map((item) => (
          <Link
            key={item.name}
            to={createPageUrl(item.page)}
            className={cn(
              "inline-flex flex-col items-center justify-center px-2 hover:bg-accent group",
              location.pathname === createPageUrl(item.page) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex flex-col items-center justify-center px-2 hover:bg-accent group text-muted-foreground"
            >
              <MoreHorizontal className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader className="px-4 py-2">
              <SheetTitle>All Tools & Pages</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {toolCategories.map((category) => (
                  <div key={category.id} className="p-2">
                     <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">{category.name}</h3>
                     <div className="space-y-1">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.name}
                          to={createPageUrl(tool.page)}
                          className={`block p-3 text-base rounded-md transition-colors ${
                            location.pathname === createPageUrl(tool.page)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent'
                          }`}
                        >
                          {tool.name}
                        </Link>
                      ))}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};


export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = usePersistentDarkMode();
  const [openCategories, setOpenCategories] = useState(new Set(["dashboard", "assistant", "community_work"]));
  const [isTodoSidebarOpen, setIsTodoSidebarOpen] = useState(false);
  const [isGlytchPanelOpen, setIsGlytchPanelOpen] = useState(false);
  const [showGlytchSettings, setShowGlytchSettings] = useState(false);
  const [glytchSettings, setGlytchSettings] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    model: "gpt-4",
    personality: "professional"
  });
  const [featureNotifications, setFeatureNotifications] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [showUserInviteDialog, setShowUserInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await User.logout();
      toast.success("You have been logged out.");
      // The platform will handle redirecting to the login page automatically.
      window.location.reload(); // Force a reload to clear all state
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    console.log("Layout component mounted - checking functionality");
    
    const savedSettings = localStorage.getItem('glytch_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setGlytchSettings(parsed);
        console.log("Settings loaded:", parsed);
      } catch (error) {
        console.warn('Error parsing saved GLYTCH settings:', error);
        setGlytchSettings({
          temperature: 0.7,
          maxTokens: 1000,
          model: "gpt-4",
          personality: "professional"
        });
      }
    }

    const loadNotifications = async () => {
        try {
            console.log("Loading notifications...");
            let features = [];
            let users = [];

            // Try to load feature notifications, but don't fail if it doesn't work
            try {
                features = await AppNotification.filter({ type: 'feature_update' }, '-created_date', 10);
                console.log("Feature notifications loaded:", features);
            } catch (notificationError) {
                console.warn("Could not load feature notifications (this is optional):", notificationError);
                // Use default welcome notification
                features = [
                    {
                        id: 'default-1',
                        title: 'Welcome to ABC Dashboard',
                        description: 'Your intelligent business platform is ready to use.',
                        type: 'feature_update',
                        created_date: new Date().toISOString()
                    }
                ];
            }

            // Try to load user notifications, but don't fail if it doesn't work
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const allUsers = await User.list('-created_date', 20);
                users = allUsers.filter(u => 
                    new Date(u.created_date) > thirtyDaysAgo
                );
                console.log("User notifications loaded:", users);
            } catch (userError) {
                console.warn("Could not load user notifications (this is optional):", userError);
                users = [];
            }

            setFeatureNotifications(features);
            setUserNotifications(users.map(u => ({
                id: u.id,
                title: 'New User Joined',
                description: `${u.full_name || 'A new user'} joined the platform.`,
                icon: 'UserPlus',
                created_date: u.created_date,
                email: u.email,
                role: u.role
            })));
            console.log("Notifications state updated");

        } catch (error) {
            // If everything fails, just use fallback data
            console.error("Failed to load notifications (using fallbacks):", error);
            setFeatureNotifications([
                {
                    id: 'fallback-1',
                    title: 'ABC Dashboard Active',
                    description: 'Your business tools are ready to use.',
                    type: 'feature_update',
                    created_date: new Date().toISOString()
                }
            ]);
            setUserNotifications([]);
        }
    };

    loadNotifications();
    
    // Optional: Refresh notifications periodically, but don't make it critical
    const interval = setInterval(() => {
        loadNotifications().catch(err => {
            console.warn("Background notification refresh failed (non-critical):", err);
        });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // NOTE: Removed useEffect for sidebar handling on mobile as it's replaced by the bottom nav

  const toggleCategory = (categoryId) => {
    console.log("Toggling category:", categoryId);
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      console.log("New open categories:", newSet);
      return newSet;
    });
  };

  const saveGlytchSettings = () => {
    console.log("Saving GLYTCH settings:", glytchSettings);
    try {
      if (!glytchSettings) {
        console.error('GLYTCH settings are undefined');
        toast.error("Failed to save settings - invalid configuration");
        return;
      }
      
      localStorage.setItem('glytch_settings', JSON.stringify(glytchSettings));
      setShowGlytchSettings(false);
      toast.success("GLYTCH settings saved!");
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving GLYTCH settings:", error);
      toast.error("Failed to save GLYTCH settings");
    }
  };

  const handleInviteUser = async () => {
    console.log("Handle invite user called");
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      toast.success(`An invitation link can now be sent to ${inviteEmail}.`);
      setInviteEmail('');
      setInviteRole('user');
      setShowUserInviteDialog(false);
      console.log("User invite process completed");
    } catch (error) {
      console.error('Error in invite user flow:', error);
      toast.error('Could not complete the request. Please invite users from the main dashboard.');
    }
  };

  const handleDarkModeToggle = () => {
    console.log("Dark mode toggle clicked, current state:", darkMode);
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    toast.success(`Switched to ${newDarkMode ? 'dark' : 'light'} mode - this setting will persist across all pages`);
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked");
    setShowGlytchSettings(true);
  };

  // Dynamic CSS styles based on theme
  const themeStyles = useMemo(() => {
    return `
        :root {
          --primary: #282361;
          --primary-accent: #69378d;
          --primary-foreground: #ffffff;
          --secondary: #fdc600;
          --secondary-foreground: #0f172a;
          --neutral: #64748b;
          --danger: #ef4444;
          --success: #22c55e;
          --warning: #f59e0b;
        }

        .light {
          --background: #f8fafc;
          --foreground: #0f172a;
          --card: #ffffff;
          --card-foreground: #0f172a;
          --popover: #ffffff;
          --popover-foreground: #0f172a;
          --muted: #f1f5f9;
          --muted-foreground: #64748b;
          --accent: #f1f5f9;
          --accent-foreground: #0f172a;
          --border: #e2e8f0;
          --input: #ffffff;
          --ring: var(--primary);
        }

        .dark {
          --background: #020617;
          --foreground: #f8fafc;
          --card: #0f172a;
          --card-foreground: #f8fafc;
          --popover: #0f172a;
          --popover-foreground: #f8fafc;
          --muted: #1e293b;
          --muted-foreground: #94a3b8;
          --accent: #1e293b;
          --accent-foreground: #f8fafc;
          --border: #1e293b;
          --input: #1e293b;
          --ring: var(--secondary);
        }

        /* Apply theme colors globally */
        body, html, #root {
          background-color: var(--background);
          color: var(--foreground);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .bg-background { background-color: var(--background); }
        .text-foreground { color: var(--foreground); }
        .bg-card { background-color: var(--card); }
        .text-card-foreground { color: var(--card-foreground); }
        .border-border { border-color: var(--border); }
        .bg-primary { background-color: var(--primary); }
        .bg-primary:hover { background-color: var(--primary-accent); }
        .text-primary-foreground { color: var(--primary-foreground); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary-foreground { color: var(--secondary-foreground); }
        .text-danger { color: var(--danger); }
        .text-success { color: var(--success); }
        .bg-muted { background-color: var(--muted); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .ring-ring { ring-color: var(--ring); }
        .bg-popover { background-color: var(--popover); }
        .text-popover-foreground { color: var(--popover-foreground); }
        .bg-accent { background-color: var(--accent); }
        .text-accent-foreground { color: var(--accent-foreground); }
        
        /* Ensure clickable elements work */
        button, [role="button"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        /* Mobile sidebar overlay */
        /* This is no longer used for the main sidebar, but keeping for potential other uses or reference */
        .mobile-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 40;
        }

        /* Enhanced theme transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
      `;
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <style>{themeStyles}</style>

        <div className="flex h-screen w-full relative flex-col md:flex-row">
          {/* Desktop Sidebar (hidden on mobile) */}
          <div 
            id="desktop-sidebar" // Added ID for clarity
            className={`
              hidden md:flex
              bg-card border-r border-border 
              w-64 h-full
              flex-col
            `}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">
                      ABC Dashboard
                    </h2>
                    <p className="text-xs text-muted-foreground">by Cloud Connect</p>
                  </div>
                </div>
                {/* Removed mobile close button */}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="text-xs border-success text-success">
                  GLYTCH Ready
                </Badge>
                <Badge variant="outline" className={`text-xs ${darkMode ? 'border-secondary text-secondary' : 'border-primary text-primary'}`}>
                  {darkMode ? '🌙 Dark' : '☀️ Light'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {toolCategories.map((category) => (
                  <Collapsible
                    key={category.id}
                    open={openCategories.has(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent text-foreground transition-colors group">
                      <div className="flex items-center gap-3">
                        <category.icon className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      {openCategories.has(category.id) ?
                        <ChevronDown className="w-4 h-4 text-muted-foreground" /> :
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      }
                    </CollapsibleTrigger>

                    <CollapsibleContent className="ml-7 mt-1 space-y-1">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.name}
                          to={createPageUrl(tool.page)}
                          className={`block p-2 text-sm rounded-md transition-colors ${
                            location.pathname === createPageUrl(tool.page)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                          onClick={() => {
                            console.log("Sidebar link clicked:", tool.name);
                            // No need to close sidebar as it's always open on desktop, and hidden on mobile
                          }}
                        >
                          {tool.name}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>

          {/* Removed Mobile Sidebar Toggle Button and Overlay */}

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <header className="h-16 border-b border-border flex items-center justify-between px-2 sm:px-6 shrink-0 bg-card w-full">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Removed mobile menu trigger from header */}
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                  {currentPageName || 'Dashboard'}
                </h1>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 text-foreground">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => {
                    console.log("Ask GLYTCH button clicked");
                    setIsGlytchPanelOpen(true);
                  }}
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask GLYTCH</span>
                </Button>

                <div className="hidden md:flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      console.log("Back button clicked");
                      navigate(-1);
                    }} 
                    title="Go Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button asChild variant="ghost" size="icon" title="Go to Dashboard">
                    <Link to={createPageUrl('Dashboard')}>
                      <ArrowUp className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      console.log("Forward button clicked");
                      navigate(1);
                    }} 
                    title="Go Forward"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="h-6 w-px bg-border mx-2" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="User Management" className="relative">
                      <Users className="w-5 h-5" />
                      {userNotifications.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full"/>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-popover text-popover-foreground border-border">
                        <div className="flex items-center justify-between p-3 border-b border-border">
                            <DropdownMenuLabel>User Management</DropdownMenuLabel>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log("Invite button clicked");
                                  setShowUserInviteDialog(true);
                                }}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Invite
                            </Button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {userNotifications.length > 0 ? userNotifications.map(n => (
                                 <DropdownMenuItem key={n.id} className="flex items-start p-3">
                                     <UserIcon className="mr-3 h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                                     <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{n.description}</p>
                                        {n.email && <p className="text-xs text-muted-foreground truncate">{n.email}</p>}
                                        <div className="flex items-center gap-2 mt-1">
                                            {n.role && (
                                              <Badge variant="outline" className="text-xs capitalize">
                                                {n.role}
                                              </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(n.created_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                     </div>
                                 </DropdownMenuItem>
                            )) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No recent user activity.
                                </div>
                            )}
                        </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Updates" className="relative">
                      <Bell className="w-5 h-5" />
                      {featureNotifications.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"/>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-popover text-popover-foreground border-border">
                        <DropdownMenuLabel>Feature Updates</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         {featureNotifications.length > 0 ? featureNotifications.map(n => (
                             <DropdownMenuItem key={n.id} className="flex items-start">
                                 <Zap className="mr-2 h-4 w-4 text-primary" />
                                 <div>
                                    <p className="font-semibold">{n.title}</p>
                                    <p className="text-xs text-muted-foreground">{n.description}</p>
                                 </div>
                             </DropdownMenuItem>
                        )) : (
                            <p className="p-4 text-center text-sm text-muted-foreground">No new updates.</p>
                        )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    console.log("Todo button clicked");
                    setIsTodoSidebarOpen(true);
                  }} 
                  title="My Tasks"
                >
                  <ListChecks className="w-5 h-5" />
                </Button>

                <div className="hidden sm:flex items-center">
                  <Dialog open={showGlytchSettings} onOpenChange={setShowGlytchSettings}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="GLYTCH Settings"
                        onClick={() => {
                          console.log("GLYTCH Settings button clicked");
                          setShowGlytchSettings(true);
                        }}
                      >
                        <Sliders className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-popover text-popover-foreground border border-border max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="w-5 h-5" />
                          GLYTCH Settings
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-popover-foreground">Temperature: {glytchSettings.temperature}</Label>
                          <Slider
                            value={[glytchSettings.temperature]}
                            onValueChange={(value) => {
                              console.log("Temperature slider changed:", value[0]);
                              setGlytchSettings({ ...glytchSettings, temperature: value[0] });
                            }}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-popover-foreground">Max Tokens</Label>
                          <Input
                            type="number"
                            value={glytchSettings.maxTokens}
                            onChange={(e) => {
                              console.log("Max tokens changed:", e.target.value);
                              setGlytchSettings({ ...glytchSettings, maxTokens: parseInt(e.target.value) || 1000 });
                            }}
                            className="mt-2 bg-input text-foreground border-border"
                          />
                        </div>
                        <div>
                          <Label className="text-popover-foreground">Model</Label>
                          <Select 
                            value={glytchSettings.model} 
                            onValueChange={(value) => {
                              console.log("Model changed:", value);
                              setGlytchSettings({ ...glytchSettings, model: value });
                            }}
                          >
                            <SelectTrigger className="mt-2 bg-input text-foreground border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="claude-2">Claude 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-popover-foreground">Personality</Label>
                          <Select 
                            value={glytchSettings.personality} 
                            onValueChange={(value) => {
                              console.log("Personality changed:", value);
                              setGlytchSettings({ ...glytchSettings, personality: value });
                            }}
                          >
                            <SelectTrigger className="mt-2 bg-input text-foreground border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={saveGlytchSettings} className="w-full bg-primary hover:bg-primary-accent text-primary-foreground">
                          Save Settings
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="icon" title="Help">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Settings">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border min-w-[200px]">
                    <DropdownMenuLabel className="text-popover-foreground">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDarkModeToggle}
                      className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleLogout} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="flex-1 overflow-auto bg-background w-full pb-20 md:pb-0"> {/* Added pb-20 for mobile bottom nav */}
              <div className="w-full h-full">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav toolCategories={toolCategories} />

        {/* Persistent Cloud Connect Features Link */}
        <div className="fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-[999]">
          <a 
            href="https://hosted.glytch.cloud/functions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Cloud Connect Features
          </a>
        </div>

      </div>

      <Dialog open={showUserInviteDialog} onOpenChange={setShowUserInviteDialog}>
        <DialogContent className="max-w-md bg-popover text-popover-foreground border-border">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-input text-foreground border-border"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUserInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} className="bg-primary text-primary-foreground">
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TodoSidebar isOpen={isTodoSidebarOpen} onClose={() => setIsTodoSidebarOpen(false)} />
      <GlytchPanel isOpen={isGlytchPanelOpen} onClose={() => setIsGlytchPanelOpen(false)} />
    </SidebarProvider>
  );
}
