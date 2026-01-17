import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Recipes": Recipes,
    "Events": Events,
    "EventDetails": EventDetails,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};