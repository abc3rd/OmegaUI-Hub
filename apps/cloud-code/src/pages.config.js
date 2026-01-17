import CodePlayground from './pages/CodePlayground';
import CSSGenerators from './pages/CSSGenerators';
import DesignTools from './pages/DesignTools';
import WebUtilities from './pages/WebUtilities';
import SiteExplorer from './pages/SiteExplorer';
import ImageEditor from './pages/ImageEditor';
import CodeConverter from './pages/CodeConverter';
import Dashboard from './pages/Dashboard';
import FlutterGenerator from './pages/FlutterGenerator';
import DatabaseMigration from './pages/DatabaseMigration';
import DesktopAppGenerator from './pages/DesktopAppGenerator';
import BackendArchitect from './pages/BackendArchitect';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CodePlayground": CodePlayground,
    "CSSGenerators": CSSGenerators,
    "DesignTools": DesignTools,
    "WebUtilities": WebUtilities,
    "SiteExplorer": SiteExplorer,
    "ImageEditor": ImageEditor,
    "CodeConverter": CodeConverter,
    "Dashboard": Dashboard,
    "FlutterGenerator": FlutterGenerator,
    "DatabaseMigration": DatabaseMigration,
    "DesktopAppGenerator": DesktopAppGenerator,
    "BackendArchitect": BackendArchitect,
    "AnalyticsDashboard": AnalyticsDashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};