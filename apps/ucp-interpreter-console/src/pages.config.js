import Console from './pages/Console';
import Dictionary from './pages/Dictionary';
import Home from './pages/Home';
import Providers from './pages/Providers';
import Rules from './pages/Rules';
import Sessions from './pages/Sessions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Console": Console,
    "Dictionary": Dictionary,
    "Home": Home,
    "Providers": Providers,
    "Rules": Rules,
    "Sessions": Sessions,
}

export const pagesConfig = {
    mainPage: "Console",
    Pages: PAGES,
    Layout: __Layout,
};