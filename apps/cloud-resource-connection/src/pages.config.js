import Home from './pages/Home';
import CreateProfile from './pages/CreateProfile';
import ViewProfile from './pages/ViewProfile';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ResourceMap from './pages/ResourceMap';
import AddResource from './pages/AddResource';
import EditProfile from './pages/EditProfile';
import MyDonations from './pages/MyDonations';
import AgentChat from './pages/AgentChat';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CreateProfile": CreateProfile,
    "ViewProfile": ViewProfile,
    "Dashboard": Dashboard,
    "Admin": Admin,
    "ResourceMap": ResourceMap,
    "AddResource": AddResource,
    "EditProfile": EditProfile,
    "MyDonations": MyDonations,
    "AgentChat": AgentChat,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};