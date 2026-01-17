import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import EcoTips from './pages/EcoTips';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calculator": Calculator,
    "Dashboard": Dashboard,
    "EcoTips": EcoTips,
}

export const pagesConfig = {
    mainPage: "Calculator",
    Pages: PAGES,
    Layout: __Layout,
};