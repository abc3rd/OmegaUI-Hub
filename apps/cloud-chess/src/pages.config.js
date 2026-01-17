import Home from './pages/Home';
import Play from './pages/Play';
import Rankings from './pages/Rankings';
import Settings from './pages/Settings';
import Multiplayer from './pages/Multiplayer';
import PlayCheckers from './pages/PlayCheckers';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Play": Play,
    "Rankings": Rankings,
    "Settings": Settings,
    "Multiplayer": Multiplayer,
    "PlayCheckers": PlayCheckers,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};