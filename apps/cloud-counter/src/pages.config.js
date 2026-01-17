import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Devices from './pages/Devices';
import Tips from './pages/Tips';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Compare from './pages/Compare';
import Methodology from './pages/Methodology';
import Admin from './pages/Admin';
import Demo from './pages/Demo';
import PublicReport from './pages/PublicReport';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Analytics": Analytics,
    "Devices": Devices,
    "Tips": Tips,
    "Settings": Settings,
    "Landing": Landing,
    "Sessions": Sessions,
    "SessionDetail": SessionDetail,
    "Compare": Compare,
    "Methodology": Methodology,
    "Admin": Admin,
    "Demo": Demo,
    "PublicReport": PublicReport,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};