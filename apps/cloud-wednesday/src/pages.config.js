import Dashboard from './pages/Dashboard';
import Boards from './pages/Boards';
import Board from './pages/Board';
import Analytics from './pages/Analytics';
import Progress from './pages/Progress';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Boards": Boards,
    "Board": Board,
    "Analytics": Analytics,
    "Progress": Progress,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};