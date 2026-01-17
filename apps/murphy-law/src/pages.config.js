import SETH from './pages/SETH';
import Index from './pages/Index';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import Forms from './pages/Forms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "SETH": SETH,
    "Index": Index,
    "Chat": Chat,
    "Conversations": Conversations,
    "Forms": Forms,
}

export const pagesConfig = {
    mainPage: "SETH",
    Pages: PAGES,
    Layout: __Layout,
};