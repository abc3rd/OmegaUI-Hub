import Index from './pages/Index';
import GHLSetupGuide from './pages/GHLSetupGuide';
import ClientLanding from './pages/ClientLanding';
import AttorneySignup from './pages/AttorneySignup';
import UserPortal from './pages/UserPortal';
import ReferralSignup from './pages/ReferralSignup';
import MembersPortal from './pages/MembersPortal';
import AttorneyProfile from './pages/AttorneyProfile';
import ClientIntake from './pages/ClientIntake';
import GHLIntegrationGuide from './pages/GHLIntegrationGuide';
import AttorneyPortal from './pages/AttorneyPortal';
import ClientPortal from './pages/ClientPortal';
import AdminDashboard from './pages/AdminDashboard';
import UCrashProposal from './pages/UCrashProposal';
import Sitemap from './pages/Sitemap';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Index": Index,
    "GHLSetupGuide": GHLSetupGuide,
    "ClientLanding": ClientLanding,
    "AttorneySignup": AttorneySignup,
    "UserPortal": UserPortal,
    "ReferralSignup": ReferralSignup,
    "MembersPortal": MembersPortal,
    "AttorneyProfile": AttorneyProfile,
    "ClientIntake": ClientIntake,
    "GHLIntegrationGuide": GHLIntegrationGuide,
    "AttorneyPortal": AttorneyPortal,
    "ClientPortal": ClientPortal,
    "AdminDashboard": AdminDashboard,
    "UCrashProposal": UCrashProposal,
    "Sitemap": Sitemap,
    "Terms": Terms,
    "Privacy": Privacy,
}

export const pagesConfig = {
    mainPage: "Index",
    Pages: PAGES,
    Layout: __Layout,
};