import  { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { ArrowRight, ShoppingBag, BookOpen, Laptop, Sofa, Shield, Zap, Users, Check } from "lucide-react";

const useCounter = (target, duration = 1800) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!target) return;
        const step = target / (duration / 20);
        let cur = 0;
        const t = setInterval(() => {
            cur += step;
            if (cur >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(cur));
        }, 20);
        return () => clearInterval(t);
    }, [target, duration]);
    return val;
};

// eslint-disable-next-line no-unused-vars
const Stat = ({ value, label }) => {
    const count = useCounter(value);
    return (
        <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.2rem", color: "var(--c-ink)" }}>
                {count.toLocaleString()}+
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--c-ink-light)", marginTop: 4 }}>{label}</p>
        </div>
    );
};

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, active: 0, sold: 0 });

    useEffect(() => {
        // Fetch real stats from backend
        const fetchStats = async () => {
            try {
                // eslint-disable-next-line no-unused-vars
                const res = await fetch("http://localhost:5000/api/health");
                // Stats endpoint would be added to backend — placeholder for now
                setStats({ users: 1240, active: 380, sold: 2100 });
            } catch { setStats({ users: 1240, active: 380, sold: 2100 }); }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ fontFamily: "var(--font-body)" }}>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden py-24 px-4 text-center"
                style={{ background: "var(--c-ink)" }}>

                {/* Subtle dot grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                {/* Accent blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full opacity-10 blur-3xl"
                    style={{ background: "var(--c-accent)" }} />

                <div className="relative z-10 max-w-4xl mx-auto animate-fade-up stagger">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border text-sm"
                        style={{ background: "rgba(37,99,235,0.15)", borderColor: "rgba(37,99,235,0.3)", color: "#93C5FD" }}>
                        <span className="w-2 h-2 rounded-full bg-green-400" /> Campus-only · Safe & Free
                    </div>

                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1.05, color: "white", letterSpacing: "-0.03em" }}>
                        Buy & Sell on<br />
                        <span style={{ color: "#60A5FA" }}>Your Campus</span>
                    </h1>

                    <p className="mt-6 mx-auto" style={{ color: "#9CA3AF", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 520 }}>
                        Textbooks, electronics, furniture and more — bought and sold between students, face to face, no middleman.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                        <button onClick={() => navigate(user ? "/home" : "/signup")}
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all"
                            style={{ fontFamily: "var(--font-display)", background: "var(--c-accent)", color: "white" }}>
                            Start Shopping <ArrowRight size={16} />
                        </button>
                        <button onClick={() => navigate(user ? "/sell" : "/signup")}
                            className="px-8 py-4 rounded-2xl font-bold text-sm transition-all"
                            style={{ fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}>
                            List an Item
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:gap-12 mt-16 pt-10 border-t"
                        style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                        {[
                            { value: stats.users, label: "Active Students" },
                            { value: stats.active, label: "Live Listings" },
                            { value: stats.sold, label: "Items Sold" },
                        ].map((s, i) => (
                            <div key={i} className="text-center min-w-0">
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.3rem, 5vw, 2rem)", color: "white" }}>
                                    {s.value.toLocaleString()}+
                                </p>
                                <p style={{ fontSize: "clamp(0.68rem, 2.5vw, 0.82rem)", color: "#6B7280", marginTop: 2 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Categories ── */}
            <section className="py-20 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--c-ink)" }}>
                        Browse by Category
                    </h2>
                    <p className="mt-3" style={{ color: "var(--c-ink-light)" }}>
                        Find exactly what you need
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[
                        { label: "Books", icon: "📚", color: "#EFF6FF" },
                        { label: "Electronics", icon: "💻", color: "#F0FDF4" },
                        { label: "Furniture", icon: "🛋️", color: "#FFF7ED" },
                        { label: "Clothing", icon: "👕", color: "#FDF4FF" },
                        { label: "Sports", icon: "🏏", color: "#F0FDF4" },
                        { label: "Stationery", icon: "✏️", color: "#FFFBEB" },
                    ].map(cat => (
                        <Link key={cat.label} to={`/home?category=${cat.label.toLowerCase()}`}
                            className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl border text-center transition-all hover:shadow-md hover:-translate-y-1"
                            style={{ background: cat.color, borderColor: "var(--c-border)", textDecoration: "none" }}>
                            <span style={{ fontSize: "clamp(1.5rem, 6vw, 2rem)" }}>{cat.icon}</span>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(0.75rem, 3vw, 0.875rem)", color: "var(--c-ink)" }}>
                                {cat.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-20 px-4" style={{ background: "var(--c-surface)" }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--c-ink)" }}>
                            How It Works
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6">
                        {[
                            { step: "01", title: "Register", desc: "Sign up with your campus email and verify it." },
                            { step: "02", title: "Browse or List", desc: "Find what you need or post what you want to sell." },
                            { step: "03", title: "Send a Request", desc: "Buyer sends a buy request with an optional note." },
                            { step: "04", title: "Meet & Exchange", desc: "Meet on campus, exchange item and cash. Done." },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "var(--c-accent-light)" }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--c-accent)" }}>
                                        {s.step}
                                    </span>
                                </div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)", fontSize: "1rem" }}>
                                    {s.title}
                                </h3>
                                <p className="mt-2" style={{ fontSize: "0.85rem", color: "var(--c-ink-light)", lineHeight: 1.6 }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 px-4 text-center" style={{ background: "var(--c-accent)" }}>
                <div className="max-w-2xl mx-auto">
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.2rem", color: "white", lineHeight: 1.2 }}>
                        Ready to declutter and save?
                    </h2>
                    <p className="mt-4 mb-8" style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}>
                        Join your campus community. No listing fees, no delivery, no hassle.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                        {["No listing fees", "Campus verified", "Safe meetups", "Free forever"].map(f => (
                            <div key={f} className="flex items-center gap-2">
                                <Check size={16} /> {f}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate(user ? "/home" : "/signup")}
                        className="px-10 py-4 rounded-2xl font-bold text-sm transition-all"
                        style={{ fontFamily: "var(--font-display)", background: "white", color: "var(--c-accent)" }}>
                        {user ? "Browse Items" : "Get Started Free"}
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 px-4 text-center border-t" style={{ borderColor: "var(--c-border)" }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--c-accent)" }}>
                        <ShoppingBag size={12} className="text-white" />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)", fontSize: "0.9rem" }}>
                        CampusMarket
                    </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--c-ink-light)" }}>
                    © 2025 CampusMarket · Made for students, by students
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;