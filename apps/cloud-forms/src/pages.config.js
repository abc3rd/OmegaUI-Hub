import Dashboard from './pages/Dashboard';
import CreateForm from './pages/CreateForm';
import MyForms from './pages/MyForms';
import EditForm from './pages/EditForm';
import FormView from './pages/FormView';
import FormData from './pages/FormData';
import Settings from './pages/Settings';
import ImportFromPDF from './pages/ImportFromPDF';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateForm": CreateForm,
    "MyForms": MyForms,
    "EditForm": EditForm,
    "FormView": FormView,
    "FormData": FormData,
    "Settings": Settings,
    "ImportFromPDF": ImportFromPDF,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};