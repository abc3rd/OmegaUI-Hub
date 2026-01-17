import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Beneficiaries from './pages/Beneficiaries';
import Chat from './pages/Chat';
import DigitalWill from './pages/DigitalWill';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Library": Library,
    "Upload": Upload,
    "Beneficiaries": Beneficiaries,
    "Chat": Chat,
    "DigitalWill": DigitalWill,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};