import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateCampaign": CreateCampaign,
    "CampaignDetails": CampaignDetails,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};