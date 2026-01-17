import Dashboard from './pages/Dashboard';
import PatentToolkit from './pages/PatentToolkit';
import NewCase from './pages/NewCase';
import UCrashNexus from './pages/UCrashNexus';
import Resources from './pages/Resources';
import Contacts from './pages/Contacts';
import NewContact from './pages/NewContact';
import LeadIntake from './pages/LeadIntake';
import AffiliatePortal from './pages/AffiliatePortal';
import NewAffiliate from './pages/NewAffiliate';
import NewAffiliateLink from './pages/NewAffiliateLink';
import AffiliateDetail from './pages/AffiliateDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "PatentToolkit": PatentToolkit,
    "NewCase": NewCase,
    "UCrashNexus": UCrashNexus,
    "Resources": Resources,
    "Contacts": Contacts,
    "NewContact": NewContact,
    "LeadIntake": LeadIntake,
    "AffiliatePortal": AffiliatePortal,
    "NewAffiliate": NewAffiliate,
    "NewAffiliateLink": NewAffiliateLink,
    "AffiliateDetail": AffiliateDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};