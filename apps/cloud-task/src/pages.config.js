import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Tasks from './pages/Tasks';
import AIAllocation from './pages/AIAllocation';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Team": Team,
    "Tasks": Tasks,
    "AIAllocation": AIAllocation,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};