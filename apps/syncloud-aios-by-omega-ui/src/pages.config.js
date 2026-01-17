import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import Creative from './pages/Creative';
import Launch from './pages/Launch';
import Home from './pages/Home';
import Settings from './pages/Settings';
import QrGenerator from './pages/QrGenerator';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Compose": Compose,
    "Creative": Creative,
    "Launch": Launch,
    "Home": Home,
    "Settings": Settings,
    "QrGenerator": QrGenerator,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};