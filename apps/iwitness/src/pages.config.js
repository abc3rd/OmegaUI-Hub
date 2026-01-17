import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import PartnerHub from './pages/PartnerHub';
import Report from './pages/Report';
import Scan from './pages/Scan';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Dashboard": Dashboard,
    "PartnerHub": PartnerHub,
    "Report": Report,
    "Scan": Scan,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Report",
    Pages: PAGES,
    Layout: __Layout,
};