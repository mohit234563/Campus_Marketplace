import  { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Plus, Loader2, ShoppingBag, Tag, Clock, User, ChevronLeft, Star, BookOpen, Laptop, Sofa, Shirt, Pen, Dumbbell, Package } from "lucide-react";
import { productAPI, orderAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
    { label: "All", value: "", icon: <Package size={15} /> },
    { label: "Books", value: "books", icon: <BookOpen size={15} /> },
    { label: "Electronics", value: "electronics", icon: <Laptop size={15} /> },
    { label: "Furniture", value: "furniture", icon: <Sofa size={15} /> },
    { label: "Clothing", value: "clothing", icon: <Shirt size={15} /> },
    { label: "Stationery", value: "stationery", icon: <Pen size={15} /> },
    { label: "Sports", value: "sports", icon: <Dumbbell size={15} /> },
];

const CONDITIONS = ["", "new", "like-new", "good", "fair", "poor"];
const SORTS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low", value: "price-low" },
    { label: "Price: High", value: "price-high" },
];

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category", category);
            if (condition) params.set("condition", condition);
            params.set("sort", sort);
            params.set("page", page);
            params.set("limit", 12);

            const data = await productAPI.getAll(`?${params.toString()}`);
            setProducts(data.data.products);
            setPagination(data.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, category, condition, sort, page]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(fetchProducts, 400);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    const handleCategoryChange = (val) => {
        setCategory(val);
        setPage(1);
    };

    return (
        <div className="min-h-screen" style={{ background: "var(--c-surface)" }}>

            {/* ── Top Search Bar ── */}
            <div className="sticky top-16 z-40 border-b"
                style={{ background: "var(--c-white)", borderColor: "var(--c-border)" }}>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xl">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: "var(--c-ink-light)" }} />
                            <input
                                placeholder="Search books, laptops, chairs..."
                                className="input pl-10"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Sort */}
                        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
                            className="input" style={{ width: "auto", paddingLeft: "0.75rem" }}>
                            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>

                        {/* Filters toggle */}
                        <button onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all"
                            style={{
                                fontFamily: "var(--font-display)",
                                borderColor: filtersOpen ? "var(--c-accent)" : "var(--c-border)",
                                color: filtersOpen ? "var(--c-accent)" : "var(--c-ink-light)",
                                background: filtersOpen ? "var(--c-accent-light)" : "transparent"
                            }}>
                            <SlidersHorizontal size={15} /> Filters
                            {condition && <span className="w-2 h-2 rounded-full" style={{ background: "var(--c-accent)" }} />}
                        </button>

                        <button onClick={() => navigate("/sell")}
                            className="btn-primary flex items-center gap-1.5 shrink-0">
                            <Plus size={15} /> Sell
                        </button>
                    </div>

                    {/* Expandable Filters */}
                    {filtersOpen && (
                        <div className="mt-3 pt-3 border-t animate-slide-down flex flex-wrap gap-2"
                            style={{ borderColor: "var(--c-border)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-ink-light)", alignSelf: "center" }}>
                                CONDITION:
                            </span>
                            {CONDITIONS.map(c => (
                                <button key={c || "all"}
                                    onClick={() => { setCondition(c); setPage(1); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        background: condition === c ? "var(--c-accent)" : "var(--c-white)",
                                        color: condition === c ? "white" : "var(--c-ink-light)",
                                        borderColor: condition === c ? "var(--c-accent)" : "var(--c-border)",
                                    }}>
                                    {c || "Any"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Pills */}
                <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 transition-all"
                            style={{
                                fontFamily: "var(--font-display)",
                                background: category === cat.value ? "var(--c-accent)" : "var(--c-white)",
                                color: category === cat.value ? "white" : "var(--c-ink-light)",
                                borderColor: category === cat.value ? "var(--c-accent)" : "var(--c-border)",
                            }}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: "var(--c-border)" }} />
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)" }}>No items found</h3>
                        <p className="mt-2" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p style={{ fontSize: "0.875rem", color: "var(--c-ink-light)" }}>
                                <strong style={{ color: "var(--c-ink)" }}>{pagination.total}</strong> items found
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger animate-fade-up">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1} className="btn-ghost px-4 py-2">Prev</button>
                                <span style={{ fontSize: "0.875rem", color: "var(--c-ink-light)" }}>
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages} className="btn-ghost px-4 py-2">Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ── Product Card with flip ────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
    const [flipped, setFlipped] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const conditionColor = {
        "new": "badge-green", "like-new": "badge-green",
        "good": "badge-blue", "fair": "badge-amber", "poor": "badge-red"
    };

    const handleBuy = async (e) => {
        e.stopPropagation();
        if (!user) return navigate("/login");
        setOrdering(true);
        try {
            await orderAPI.create({ productId: product._id, buyerNote: "" });
            navigate("/orders");
        } catch (err) {
            alert(err.message);
        } finally {
            setOrdering(false);
        }
    };

    return (
        <div className="h-[380px]" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full transition-all duration-500"
                style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>

                {/* Front */}
                <div className="absolute inset-0 card flex flex-col overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}>
                    <div className="relative h-44 overflow-hidden" style={{ background: "var(--c-surface)" }}>
                        <img
                            src={product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                            <span className={`badge ${conditionColor[product.condition] || "badge-gray"}`}>
                                {product.condition}
                            </span>
                        </div>
                        {product.listingType === "rent" && (
                            <div className="absolute top-3 right-3">
                                <span className="badge badge-amber">Rent</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide mb-1"
                                style={{ color: "var(--c-ink-light)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                                {product.category}
                            </p>
                            <h3 className="font-semibold truncate mb-2"
                                style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", fontSize: "0.95rem" }}>
                                {product.title}
                            </h3>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--c-accent)" }}>
                                ₹{product.price.toLocaleString()}
                                {product.listingType === "rent" && (
                                    <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--c-ink-light)" }}>/day</span>
                                )}
                            </p>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button onClick={() => setFlipped(true)}
                                className="flex-1 btn-ghost text-xs py-2.5">Details</button>
                            <button onClick={handleBuy} disabled={ordering}
                                className="flex-[1.5] btn-primary text-xs py-2.5 flex items-center justify-center gap-1">
                                {ordering ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
                                {ordering ? "..." : "Request"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 card flex flex-col p-5 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: "var(--c-accent-dim)" }}>
                    <div className="flex-1 space-y-3">
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)", fontSize: "1rem" }}>
                            {product.title}
                        </h3>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--c-accent)" }}>
                            ₹{product.price.toLocaleString()}
                        </p>

                        {/* Seller */}
                        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "var(--c-surface)" }}>
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
                                style={{ background: "var(--c-accent-light)" }}>
                                {product.seller?.avatar
                                    ? <img src={product.seller.avatar} className="w-full h-full object-cover" />
                                    : <User size={14} style={{ color: "var(--c-accent)" }} />
                                }
                            </div>
                            <div>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-ink)" }}>
                                    {product.seller?.fullname || product.seller?.username}
                                </p>
                                <p style={{ fontSize: "0.65rem", color: "var(--c-ink-light)" }}>
                                    {product.seller?.college || "Campus Seller"}
                                    {product.seller?.averageRating > 0 && (
                                        <span className="ml-1">· ⭐ {product.seller.averageRating}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <p style={{ fontSize: "0.8rem", color: "var(--c-ink-light)", lineHeight: 1.6 }}
                            className="line-clamp-3">
                            {product.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--c-ink-light)" }}>
                            <Clock size={12} />
                            {new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                    </div>

                    <button onClick={() => setFlipped(false)}
                        className="mt-4 flex items-center gap-1 text-sm font-semibold"
                        style={{ color: "var(--c-ink-light)", fontFamily: "var(--font-display)" }}>
                        <ChevronLeft size={15} /> Back
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="card overflow-hidden">
        <div className="skeleton h-44 w-full rounded-none" />
        <div className="p-4 space-y-3">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-5 w-24" />
            <div className="flex gap-2 mt-4">
                <div className="skeleton h-9 flex-1 rounded-xl" />
                <div className="skeleton h-9 flex-[1.5] rounded-xl" />
            </div>
        </div>
    </div>
);

export default HomePage;