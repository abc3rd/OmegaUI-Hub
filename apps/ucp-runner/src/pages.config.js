import Analytics from './pages/Analytics';
import CommandBuilder from './pages/CommandBuilder';
import Compile from './pages/Compile';
import Home from './pages/Home';
import Import from './pages/Import';
import Landing from './pages/Landing';
import PacketDetail from './pages/PacketDetail';
import ReceiptDetail from './pages/ReceiptDetail';
import Run from './pages/Run';
import Settings from './pages/Settings';
import TemplateDetail from './pages/TemplateDetail';
import TemplateLibrary from './pages/TemplateLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "CommandBuilder": CommandBuilder,
    "Compile": Compile,
    "Home": Home,
    "Import": Import,
    "Landing": Landing,
    "PacketDetail": PacketDetail,
    "ReceiptDetail": ReceiptDetail,
    "Run": Run,
    "Settings": Settings,
    "TemplateDetail": TemplateDetail,
    "TemplateLibrary": TemplateLibrary,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};