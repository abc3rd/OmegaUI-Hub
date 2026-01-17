import AuditLogs from './pages/AuditLogs';
import CreatePacket from './pages/CreatePacket';
import Dashboard from './pages/Dashboard';
import ExecutePacket from './pages/ExecutePacket';
import FiguresPage from './pages/FiguresPage';
import Home from './pages/Home';
import KeyManagement from './pages/KeyManagement';
import Landing from './pages/Landing';
import LandingIP from './pages/LandingIP';
import LicensingPage from './pages/LicensingPage';
import PacketDetail from './pages/PacketDetail';
import PacketLibrary from './pages/PacketLibrary';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import SecurityAudit from './pages/SecurityAudit';
import Settings from './pages/Settings';
import ShareVerify from './pages/ShareVerify';
import SpecPage from './pages/SpecPage';
import TemplateDetail from './pages/TemplateDetail';
import Templates from './pages/Templates';
import TermsPage from './pages/TermsPage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AuditLogs": AuditLogs,
    "CreatePacket": CreatePacket,
    "Dashboard": Dashboard,
    "ExecutePacket": ExecutePacket,
    "FiguresPage": FiguresPage,
    "Home": Home,
    "KeyManagement": KeyManagement,
    "Landing": Landing,
    "LandingIP": LandingIP,
    "LicensingPage": LicensingPage,
    "PacketDetail": PacketDetail,
    "PacketLibrary": PacketLibrary,
    "Profile": Profile,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "SecurityAudit": SecurityAudit,
    "Settings": Settings,
    "ShareVerify": ShareVerify,
    "SpecPage": SpecPage,
    "TemplateDetail": TemplateDetail,
    "Templates": Templates,
    "TermsPage": TermsPage,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};