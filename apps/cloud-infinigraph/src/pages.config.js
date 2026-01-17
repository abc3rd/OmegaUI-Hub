import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Assets from './pages/Assets';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Editor": Editor,
    "Dashboard": Dashboard,
    "Templates": Templates,
    "Assets": Assets,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Editor",
    Pages: PAGES,
    Layout: __Layout,
};