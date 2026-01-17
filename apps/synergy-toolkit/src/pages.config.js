import Dashboard from './pages/Dashboard';
import ApiManager from './pages/ApiManager';
import OmegaDashboard from './pages/OmegaDashboard';
import AISupport from './pages/AISupport';
import NetworkTools from './pages/NetworkTools';
import Team from './pages/Team';
import SystemMonitor from './pages/SystemMonitor';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ApiManager": ApiManager,
    "OmegaDashboard": OmegaDashboard,
    "AISupport": AISupport,
    "NetworkTools": NetworkTools,
    "Team": Team,
    "SystemMonitor": SystemMonitor,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};