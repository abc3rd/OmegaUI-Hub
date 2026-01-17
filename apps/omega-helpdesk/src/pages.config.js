import AllTenants from './pages/AllTenants';
import CheckTicketStatus from './pages/CheckTicketStatus';
import ClientDashboard from './pages/ClientDashboard';
import Contacts from './pages/Contacts';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import KnowledgeBase from './pages/KnowledgeBase';
import NewTicket from './pages/NewTicket';
import PublicKnowledgeBase from './pages/PublicKnowledgeBase';
import PublicSupport from './pages/PublicSupport';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SupportDashboard from './pages/SupportDashboard';
import TicketDetail from './pages/TicketDetail';
import Tickets from './pages/Tickets';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AllTenants": AllTenants,
    "CheckTicketStatus": CheckTicketStatus,
    "ClientDashboard": ClientDashboard,
    "Contacts": Contacts,
    "Dashboard": Dashboard,
    "Home": Home,
    "KnowledgeBase": KnowledgeBase,
    "NewTicket": NewTicket,
    "PublicKnowledgeBase": PublicKnowledgeBase,
    "PublicSupport": PublicSupport,
    "Reports": Reports,
    "Settings": Settings,
    "SupportDashboard": SupportDashboard,
    "TicketDetail": TicketDetail,
    "Tickets": Tickets,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};