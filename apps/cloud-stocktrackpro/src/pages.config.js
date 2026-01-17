import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Locations from './pages/Locations';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Scan": Scan,
    "Inventory": Inventory,
    "Orders": Orders,
    "Locations": Locations,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};