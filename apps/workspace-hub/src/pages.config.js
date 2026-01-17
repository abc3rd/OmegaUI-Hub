import Feedback from './pages/Feedback';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import Hub from './pages/Hub';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import OmegaHub from './pages/OmegaHub';
import UCP from './pages/UCP';
import index from './pages/index';
import AppDetail from './pages/AppDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Feedback": Feedback,
    "Home": Home,
    "Homepage": Homepage,
    "Hub": Hub,
    "Landing": Landing,
    "NotFound": NotFound,
    "OmegaHub": OmegaHub,
    "UCP": UCP,
    "index": index,
    "AppDetail": AppDetail,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};