import CloudQR from './pages/CloudQR';
import Glytch from './pages/Glytch';
import Home from './pages/Home';
import LegendDB from './pages/LegendDB';
import OmegaUI from './pages/OmegaUI';
import SalesDeck from './pages/SalesDeck';
import UCP from './pages/UCP';
import UCPMarketing from './pages/UCPMarketing';
import UCPPage from './pages/UCPPage';
import QRDashboard from './pages/QRDashboard';
import QRNew from './pages/QRNew';
import QRView from './pages/QRView';
import QREdit from './pages/QREdit';
import QRAnalytics from './pages/QRAnalytics';
import ScanHandler from './pages/ScanHandler';
import NotFound from './pages/NotFound';
import QRBulk from './pages/QRBulk';
import QRTools from './pages/QRTools';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CloudQR": CloudQR,
    "Glytch": Glytch,
    "Home": Home,
    "LegendDB": LegendDB,
    "OmegaUI": OmegaUI,
    "SalesDeck": SalesDeck,
    "UCP": UCP,
    "UCPMarketing": UCPMarketing,
    "UCPPage": UCPPage,
    "QRDashboard": QRDashboard,
    "QRNew": QRNew,
    "QRView": QRView,
    "QREdit": QREdit,
    "QRAnalytics": QRAnalytics,
    "ScanHandler": ScanHandler,
    "NotFound": NotFound,
    "QRBulk": QRBulk,
    "QRTools": QRTools,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};