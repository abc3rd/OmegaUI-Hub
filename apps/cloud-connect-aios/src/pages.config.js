import Chat from './pages/Chat';
import Presets from './pages/Presets';
import Knowledge from './pages/Knowledge';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Create from './pages/Create';
import Leads from './pages/Leads';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import AIStudio from './pages/AIStudio';
import POS from './pages/POS';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Presets": Presets,
    "Knowledge": Knowledge,
    "Admin": Admin,
    "Analytics": Analytics,
    "Settings": Settings,
    "Billing": Billing,
    "Create": Create,
    "Leads": Leads,
    "Dashboard": Dashboard,
    "Inbox": Inbox,
    "AIStudio": AIStudio,
    "POS": POS,
}

export const pagesConfig = {
    mainPage: "Chat",
    Pages: PAGES,
    Layout: __Layout,
};