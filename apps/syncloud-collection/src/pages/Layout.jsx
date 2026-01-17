
import React, { useState } from 'react';
import {
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Bot,
  MessageSquare,
  Contact,
  PenTool,
  FileText,
  Code,
  Workflow,
  Palette,
  ChefHat,
  Shovel,
  Wifi,
  Wheat,
  Shield,
  Home as HomeIcon,
  User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      { name: "Recipe Finder", page: "RecipeFinder" },
      { name: "Recipe Sharing", page: "RecipeSharing" },
      { name: "Meal Planner", page: "MealPlanner" },
      { name: "Family Traditions", page: "FamilyTraditions" }
    ]
  },
  {
    id: "garden_integrations",
    name: "Garden Integrations",
    icon: Shovel,
    tools: [
      { name: "Plant Tracker", page: "PlantTracker" },
      { name: "Garden Planner", page: "GardenPlanner" },
      { name: "Watering Schedule", page: "WateringSchedule" },
      { name: "Pest Control Log", page: "PestControlLog" },
    ]
  },
  {
    id: "smart_home",
    name: "Smart Home",
    icon: Wifi,
    tools: [
      { name: "Device Manager", page: "DeviceManager" },
      { name: "Automation Rules", page: "AutomationRules" },
      { name: "Energy Monitor", page: "EnergyMonitor" },
    ]
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: Wheat,
    tools: [
      { name: "Crop Management", page: "CropManagement" },
      { name: "Livestock Tracker", page: "LivestockTracker" },
      { name: "Weather Insights", page: "WeatherInsights" },
      { name: "Farm Analytics", page: "FarmAnalytics" },
    ]
  },
  {
    id: "security",
    name: "Security & Privacy",
    icon: Shield,
    tools: [
      { name: "Password Manager", page: "PasswordManager" },
      { name: "VPN Controller", page: "VpnController" },
      { name: "Data Encryption", page: "DataEncryption" },
      { name: "Security Audit", page: "SecurityAudit" },
    ]
  }
];

  const mainNavigation = [
    { name: "Home", href: "/dashboard", icon: HomeIcon },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  const isActive = (pageName) => currentPageName === pageName;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <Link to="/" className="text-2xl font-bold" onClick={handleLinkClick}>GLYTCH</Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={handleLinkClick}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tools
            </h3>
            <div className="mt-2 space-y-1">
              {toolCategories.map((category) => (
                <div key={category.id}>
                  <h4 className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white">
                    <category.icon className="mr-3 h-5 w-5" />
                    {category.name}
                  </h4>
                  <div className="ml-8 space-y-1">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.page}
                        to={createPageUrl(tool.page)}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md
                          ${isActive(tool.page)
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        onClick={handleLinkClick}
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 border-b bg-white">
          <div className="mx-auto px-4 py-3 flex justify-between items-center">
            <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{currentPageName}</h1>
            <div>
              {/* User dropdown or other header elements */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
