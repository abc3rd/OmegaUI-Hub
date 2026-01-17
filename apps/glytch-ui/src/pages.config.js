import Index from './pages/Index';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import Forms from './pages/Forms';
import GLYTCH from './pages/GLYTCH';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Index": Index,
    "Chat": Chat,
    "Conversations": Conversations,
    "Forms": Forms,
    "GLYTCH": GLYTCH,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsAndConditions": TermsAndConditions,
}

export const pagesConfig = {
    mainPage: "Index",
    Pages: PAGES,
    Layout: __Layout,
};