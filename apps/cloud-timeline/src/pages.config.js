import Dashboard from './pages/Dashboard';
import CreateTimeline from './pages/CreateTimeline';
import ViewTimeline from './pages/ViewTimeline';
import EditTimeline from './pages/EditTimeline';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateTimeline": CreateTimeline,
    "ViewTimeline": ViewTimeline,
    "EditTimeline": EditTimeline,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};