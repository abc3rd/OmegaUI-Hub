import GlytchAI from './pages/GlytchAI';
import ModelComparison from './pages/ModelComparison';
import UCPAdmin from './pages/UCPAdmin';
import UCPTest from './pages/UCPTest';
import __Layout from './Layout.jsx';


export const PAGES = {
    "GlytchAI": GlytchAI,
    "ModelComparison": ModelComparison,
    "UCPAdmin": UCPAdmin,
    "UCPTest": UCPTest,
}

export const pagesConfig = {
    mainPage: "GlytchAI",
    Pages: PAGES,
    Layout: __Layout,
};