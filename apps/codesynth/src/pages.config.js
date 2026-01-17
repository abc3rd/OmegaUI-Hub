import DiffChecker from './pages/DiffChecker';
import CodeConverter from './pages/CodeConverter';
import Sessions from './pages/Sessions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DiffChecker": DiffChecker,
    "CodeConverter": CodeConverter,
    "Sessions": Sessions,
}

export const pagesConfig = {
    mainPage: "DiffChecker",
    Pages: PAGES,
    Layout: __Layout,
};