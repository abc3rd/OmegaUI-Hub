import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PluginDeployer from './pages/PluginDeployer';
import PluginManager from './pages/PluginManager';
import SnapshotBuilder from './pages/SnapshotBuilder';
import SubAccounts from './pages/SubAccounts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Home": Home,
    "PluginDeployer": PluginDeployer,
    "PluginManager": PluginManager,
    "SnapshotBuilder": SnapshotBuilder,
    "SubAccounts": SubAccounts,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};