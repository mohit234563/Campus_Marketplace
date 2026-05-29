import  { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    // eslint-disable-next-line no-unused-vars
    ShoppingBag, Plus, User, LogOut, LogIn,
    // eslint-disable-next-line no-unused-vars
    Menu, X, Bell, Search, ChevronDown, Package, Star
} from "lucide-react";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close mobile menu on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{ background: "var(--c-white)", borderBottom: "1px solid var(--c-border)" }}
            className="sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--c-accent)" }}>
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", color: "var(--c-ink)" }}>
                            CampusMarket
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/home" active={isActive("/home")}>Browse</NavLink>
                        {user && <NavLink to="/orders" active={isActive("/orders")}>My Orders</NavLink>}
                    </div>

                    {/* Desktop Right */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                {/* Sell Button */}
                                <Link to="/sell"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={{ fontFamily: "var(--font-display)", background: "var(--c-accent-light)", color: "var(--c-accent)" }}>
                                    <Plus size={15} /> Sell Item
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-gray-50">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                            {user.avatar
                                                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                : <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem", color: "var(--c-accent)" }}>
                                                    {(user.fullname || user.username || "U")[0].toUpperCase()}
                                                </span>
                                            }
                                        </div>
                                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--c-ink)" }}>
                                            {user.username || user.fullname}
                                        </span>
                                        <ChevronDown size={14} style={{ color: "var(--c-ink-light)" }}
                                            className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 rounded-2xl border py-2 animate-slide-down"
                                            style={{ background: "var(--c-white)", borderColor: "var(--c-border)", boxShadow: "var(--shadow-hover)" }}>
                                            <DropdownItem to="/profile" icon={<User size={15} />} label="My Profile" />
                                            <DropdownItem to="/my-listings" icon={<Package size={15} />} label="My Listings" />
                                            <DropdownItem to="/orders" icon={<ShoppingBag size={15} />} label="My Orders" />
                                            <div style={{ borderTop: "1px solid var(--c-border)" }} className="my-1" />
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-red-50"
                                                style={{ color: "var(--c-red)", fontWeight: 500 }}>
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login"
                                    className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-gray-50"
                                    style={{ fontFamily: "var(--font-display)", color: "var(--c-ink-light)" }}>
                                    Sign In
                                </Link>
                                <Link to="/signup"
                                    className="px-4 py-2 text-sm font-semibold rounded-xl transition-all text-white"
                                    style={{ fontFamily: "var(--font-display)", background: "var(--c-accent)" }}>
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-50">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t animate-slide-down px-4 py-4 space-y-1"
                    style={{ borderColor: "var(--c-border)", background: "var(--c-white)" }}>
                    <MobileLink to="/home" label="Browse Items" />
                    {user ? (
                        <>
                            <MobileLink to="/sell" label="Sell an Item" accent />
                            <MobileLink to="/profile" label="My Profile" />
                            <MobileLink to="/my-listings" label="My Listings" />
                            <MobileLink to="/orders" label="My Orders" />
                            <button onClick={handleLogout}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                                style={{ color: "var(--c-red)", background: "#FEF2F2" }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <MobileLink to="/login" label="Sign In" />
                            <MobileLink to="/signup" label="Get Started" accent />
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ to, active, children }) => (
    <Link to={to}
        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        style={{
            fontFamily: "var(--font-display)",
            fontWeight: active ? 600 : 500,
            color: active ? "var(--c-accent)" : "var(--c-ink-light)",
            background: active ? "var(--c-accent-light)" : "transparent",
        }}>
        {children}
    </Link>
);

const DropdownItem = ({ to, icon, label }) => (
    <Link to={to}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-gray-50"
        style={{ color: "var(--c-ink)", fontWeight: 500 }}>
        <span style={{ color: "var(--c-ink-light)" }}>{icon}</span>
        {label}
    </Link>
);

const MobileLink = ({ to, label, accent }) => (
    <Link to={to}
        className="block px-4 py-3 rounded-xl text-sm font-semibold transition-all"
        style={{
            fontFamily: "var(--font-display)",
            color: accent ? "var(--c-accent)" : "var(--c-ink)",
            background: accent ? "var(--c-accent-light)" : "transparent",
        }}>
        {label}
    </Link>
);

export default Navbar;