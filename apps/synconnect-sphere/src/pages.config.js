import Chat from './pages/Chat';
import EmbedGuide from './pages/EmbedGuide';
import Debug from './pages/Debug';
import DebugDomain from './pages/DebugDomain';
import Health from './pages/Health';
import Version from './pages/Version';
import NotFound from './pages/NotFound';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "EmbedGuide": EmbedGuide,
    "Debug": Debug,
    "DebugDomain": DebugDomain,
    "Health": Health,
    "Version": Version,
    "NotFound": NotFound,
}

export const pagesConfig = {
    mainPage: "Chat",
    Pages: PAGES,
    Layout: __Layout,
};