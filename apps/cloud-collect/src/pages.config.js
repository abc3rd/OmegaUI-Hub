import AddResource from './pages/AddResource';
import Admin from './pages/Admin';
import AgentChat from './pages/AgentChat';
import CharitableEntityPortal from './pages/CharitableEntityPortal';
import CharitableEntitySetup from './pages/CharitableEntitySetup';
import ChooseAccountType from './pages/ChooseAccountType';
import CreateProfile from './pages/CreateProfile';
import Dashboard from './pages/Dashboard';
import DonorPortal from './pages/DonorPortal';
import DonorProximityAlerts from './pages/DonorProximityAlerts';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';
import ManageRecurring from './pages/ManageRecurring';
import MyDonations from './pages/MyDonations';
import ProximityAlerts from './pages/ProximityAlerts';
import QrRedirect from './pages/QrRedirect';
import RecipientPortal from './pages/RecipientPortal';
import ResourceDetails from './pages/ResourceDetails';
import ResourceMap from './pages/ResourceMap';
import ResourceMapAbout from './pages/ResourceMapAbout';
import ScanQR from './pages/ScanQR';
import SharedResources from './pages/SharedResources';
import ViewProfile from './pages/ViewProfile';
import TermsOfService from './pages/TermsOfService';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddResource": AddResource,
    "Admin": Admin,
    "AgentChat": AgentChat,
    "CharitableEntityPortal": CharitableEntityPortal,
    "CharitableEntitySetup": CharitableEntitySetup,
    "ChooseAccountType": ChooseAccountType,
    "CreateProfile": CreateProfile,
    "Dashboard": Dashboard,
    "DonorPortal": DonorPortal,
    "DonorProximityAlerts": DonorProximityAlerts,
    "EditProfile": EditProfile,
    "Home": Home,
    "ManageRecurring": ManageRecurring,
    "MyDonations": MyDonations,
    "ProximityAlerts": ProximityAlerts,
    "QrRedirect": QrRedirect,
    "RecipientPortal": RecipientPortal,
    "ResourceDetails": ResourceDetails,
    "ResourceMap": ResourceMap,
    "ResourceMapAbout": ResourceMapAbout,
    "ScanQR": ScanQR,
    "SharedResources": SharedResources,
    "ViewProfile": ViewProfile,
    "TermsOfService": TermsOfService,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};