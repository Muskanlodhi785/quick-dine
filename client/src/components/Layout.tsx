import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import AuthModal from "./AuthModal.tsx";

/** Shared page chrome — one Navbar, one AuthModal, one Footer for the whole app. */
export default function Layout() {
    const location = useLocation();
    return (
        <div className="min-h-screen bg-surface flex flex-col">
            <Navbar />
            <AuthModal />
            <div key={location.pathname} className="flex-1 flex flex-col page-enter">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
