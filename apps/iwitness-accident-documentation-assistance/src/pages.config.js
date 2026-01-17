import AdminConsole from './pages/AdminConsole';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import IncidentDetail from './pages/IncidentDetail';
import IncidentWizard from './pages/IncidentWizard';
import Marketplace from './pages/Marketplace';
import SiriLegal from './pages/SiriLegal';
import SiriStart from './pages/SiriStart';
import LeadsAdmin from './pages/LeadsAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminConsole": AdminConsole,
    "Dashboard": Dashboard,
    "Home": Home,
    "IncidentDetail": IncidentDetail,
    "IncidentWizard": IncidentWizard,
    "Marketplace": Marketplace,
    "SiriLegal": SiriLegal,
    "SiriStart": SiriStart,
    "LeadsAdmin": LeadsAdmin,
}

export const pagesConfig = {
    mainPage: "IncidentWizard",
    Pages: PAGES,
    Layout: __Layout,
};