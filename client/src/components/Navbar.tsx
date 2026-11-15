import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import { Menu, X, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Brand from "./Brand.tsx";
import NotificationBell from "./NotificationBell.tsx";

export default function Navbar() {
    const { user, logout, setAuthModalOpen } = useAppContext();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Reset menus on route navigation during render to avoid cascading effects in React 19
    const [prevPath, setPrevPath] = useState(location.pathname);
    if (prevPath !== location.pathname) {
        setPrevPath(location.pathname);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (dropdownOpen) setDropdownOpen(false);
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!dropdownOpen) return;
        const close = () => setDropdownOpen(false);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, [dropdownOpen]);

    const handleDashboardClick = () => {
        if (!user) setAuthModalOpen(true);
        else navigate("/dashboard");
    };

    const navItems = [
        { label: "Discover", to: "/", match: location.pathname === "/" },
        { label: "Menu", to: "/menu", match: location.pathname.startsWith("/menu") },
        { label: "About", to: "/about", match: location.pathname.startsWith("/about") },
    ];
    const isActiveRestaurants = location.pathname.startsWith("/search") || location.pathname.startsWith("/restaurant");

    const base = scrolled
        ? "bg-raised/90 backdrop-blur-xl h-16 border-b border-outline-variant/50 shadow-sm shadow-black/5"
        : "bg-surface/70 backdrop-blur h-20 border-b border-transparent";

    return (
        <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${base}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-6 md:px-10">
                {/* Brand + links */}
                <div className="flex items-center gap-12">
                    <Link to="/" aria-label="Velvet Table — home">
                        <Brand />
                    </Link>

                    <div className="hidden md:flex gap-8 items-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`text-sm transition-colors pb-1 border-b-2 cursor-pointer ${
                                    item.match ? "text-secondary border-secondary" : "text-ink/65 hover:text-primary border-transparent"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            to="/search"
                            className={`text-sm transition-colors pb-1 border-b-2 cursor-pointer ${
                                isActiveRestaurants ? "text-secondary border-secondary" : "text-ink/65 hover:text-primary border-transparent"
                            }`}
                        >
                            Restaurants
                        </Link>
                    </div>
                </div>

                {/* Auth actions (desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    {user && <NotificationBell />}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen((v) => !v);
                                }}
                                className="flex items-center gap-2 text-sm text-ink/75 hover:text-primary transition-colors cursor-pointer"
                            >
                                <span className="size-8 rounded-full bg-secondary-container/10 border border-secondary/40 flex items-center justify-center text-secondary">
                                    {user.name.charAt(0)}
                                </span>
                                <span className="max-w-[110px] truncate font-medium">{user.name.split(" ")[0]}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-raised border border-outline-variant/60 ambient-shadow rounded-lg py-2 z-50 zoom-in-95">
                                    <div className="px-4 py-2 border-b border-outline-variant/40">
                                        <p className="text-sm text-primary truncate font-medium">{user.name}</p>
                                        <p className="text-xs text-ink/55 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleDashboardClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-ink/70 hover:text-secondary hover:bg-surface-container-low/60 transition-colors cursor-pointer text-left"
                                    >
                                        <UserRound size={14} />
                                        My Bookings
                                    </button>

                                    {user.role === "admin" && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-ink/70 hover:text-secondary hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                                        >
                                            <ShieldCheck size={14} />
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user.role === "owner" && (
                                        <Link
                                            to="/owner/dashboard"
                                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-ink/70 hover:text-secondary hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                                        >
                                            <ShieldCheck size={14} />
                                            Owner Panel
                                        </Link>
                                    )}

                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-error hover:bg-error-container/40 transition-colors border-t border-outline-variant/40 text-left cursor-pointer"
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="text-sm text-ink/70 hover:text-secondary transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-md bg-primary-container text-on-primary-container hover:bg-secondary hover:text-on-secondary transition-all duration-300 cursor-pointer"
                            >
                                Book a Table
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                {/* Mobile hamburger & notifications */}
                <div className="flex items-center gap-2 md:hidden">
                    {user && <NotificationBell />}
                    <button
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className={`p-2 transition-colors cursor-pointer ${mobileMenuOpen ? "text-secondary" : "text-primary"}`}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-16 bg-raised border-b border-outline-variant/50 py-6 px-6 z-50 ambient-shadow flex flex-col gap-5 slide-in-from-top">
                    <Link to="/" className="text-base text-ink/85 hover:text-secondary">
                        Discover
                    </Link>
                    <Link to="/menu" className="text-base text-ink/85 hover:text-secondary">
                        Menu
                    </Link>
                    <Link to="/about" className="text-base text-ink/85 hover:text-secondary">
                        About
                    </Link>
                    <Link to="/search" className="text-base text-ink/85 hover:text-secondary">
                        Restaurants
                    </Link>
                    <button
                        onClick={handleDashboardClick}
                        className="text-base text-ink/85 hover:text-secondary text-left cursor-pointer"
                    >
                        My Bookings
                    </button>

                    <div className="border-t border-outline-variant/40 my-2"></div>

                    {user ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full bg-secondary-container/10 border border-secondary/40 flex items-center justify-center text-secondary text-sm uppercase font-semibold">
                                    {user.name.charAt(0)}
                                </span>
                                <div>
                                    <p className="text-sm text-primary font-medium">{user.name}</p>
                                    <p className="text-xs text-ink/55">{user.email}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="text-sm font-medium text-error text-left cursor-pointer">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="w-full border border-outline-variant/70 text-center py-3 text-sm font-medium text-ink/70 hover:border-secondary hover:text-secondary cursor-pointer rounded-md"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="w-full bg-primary-container text-on-primary-container text-center py-3 text-xs font-bold tracking-widest uppercase hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer rounded-md"
                            >
                                Book a Table
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
