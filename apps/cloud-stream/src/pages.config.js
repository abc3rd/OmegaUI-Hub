import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Guides from './pages/Guides';
import Home from './pages/Home';
import KeyVault from './pages/KeyVault';
import Platforms from './pages/Platforms';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import StreamManager from './pages/StreamManager';
import Viewers from './pages/Viewers';
import Widgets from './pages/Widgets';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Dashboard": Dashboard,
    "Guides": Guides,
    "Home": Home,
    "KeyVault": KeyVault,
    "Platforms": Platforms,
    "Sessions": Sessions,
    "Settings": Settings,
    "StreamManager": StreamManager,
    "Viewers": Viewers,
    "Widgets": Widgets,
}

export const pagesConfig = {
    mainPage: "StreamManager",
    Pages: PAGES,
    Layout: __Layout,
};