import Dashboard from './pages/Dashboard';
import Databases from './pages/Databases';
import QueryEditor from './pages/QueryEditor';
import DatabaseDetail from './pages/DatabaseDetail';
import TableRecords from './pages/TableRecords';
import ActivityLogs from './pages/ActivityLogs';
import Visualizations from './pages/Visualizations';
import Settings from './pages/Settings';
import ImportExport from './pages/ImportExport';
import DashboardBuilder from './pages/DashboardBuilder';
import UserManagement from './pages/UserManagement';
import Agents from './pages/Agents';
import AIAgents from './pages/AIAgents';
import AgentManagement from './pages/AgentManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Databases": Databases,
    "QueryEditor": QueryEditor,
    "DatabaseDetail": DatabaseDetail,
    "TableRecords": TableRecords,
    "ActivityLogs": ActivityLogs,
    "Visualizations": Visualizations,
    "Settings": Settings,
    "ImportExport": ImportExport,
    "DashboardBuilder": DashboardBuilder,
    "UserManagement": UserManagement,
    "Agents": Agents,
    "AIAgents": AIAgents,
    "AgentManagement": AgentManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};