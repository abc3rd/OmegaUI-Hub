import Home from './pages/Home';
import Handshake from './pages/Handshake';
import Circle from './pages/Circle';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import VerificationAPI from './pages/VerificationAPI';
import Legacy from './pages/Legacy';
import TokenMonitor from './pages/TokenMonitor';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ARC from './pages/ARC';
import LegacyAI from './pages/LegacyAI';
import Security from './pages/Security';
import FaceToFace from './pages/FaceToFace';
import CloudConnect from './pages/CloudConnect';
import LegendaryLeads from './pages/LegendaryLeads';
import ABCDashboard from './pages/ABCDashboard';
import Settings from './pages/Settings';
import FaceToFaceInfo from './pages/FaceToFaceInfo';
import LegacyInfo from './pages/LegacyInfo';
import Landing from './pages/Landing';
import LiveStream from './pages/LiveStream';
import NetworkScanner from './pages/NetworkScanner';
import CameraManager from './pages/CameraManager';
import MobileCameraSync from './pages/MobileCameraSync';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Handshake": Handshake,
    "Circle": Circle,
    "Messages": Messages,
    "Profile": Profile,
    "VerificationAPI": VerificationAPI,
    "Legacy": Legacy,
    "TokenMonitor": TokenMonitor,
    "About": About,
    "Dashboard": Dashboard,
    "ARC": ARC,
    "LegacyAI": LegacyAI,
    "Security": Security,
    "FaceToFace": FaceToFace,
    "CloudConnect": CloudConnect,
    "LegendaryLeads": LegendaryLeads,
    "ABCDashboard": ABCDashboard,
    "Settings": Settings,
    "FaceToFaceInfo": FaceToFaceInfo,
    "LegacyInfo": LegacyInfo,
    "Landing": Landing,
    "LiveStream": LiveStream,
    "NetworkScanner": NetworkScanner,
    "CameraManager": CameraManager,
    "MobileCameraSync": MobileCameraSync,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};