import Home from './pages/Home';
import UCPSimulator from './pages/UCPSimulator';
import About from './pages/About';
import GreenAI from './pages/GreenAI';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "UCPSimulator": UCPSimulator,
    "About": About,
    "GreenAI": GreenAI,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};