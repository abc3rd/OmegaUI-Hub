import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import Security from './pages/Security';
import Vault from './pages/Vault';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Home": Home,
    "OAuthCallback": OAuthCallback,
    "Security": Security,
    "Vault": Vault,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};