import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import {
    MapPin, Calendar, Star, Package, Loader2,
    // eslint-disable-next-line no-unused-vars
    ShoppingBag, ArrowLeft, User
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PROFILE PAGE
// Visible to anyone — no auth required.
// Shows seller's public info, active listings, and reviews received.
// Route: /u/:username
// ─────────────────────────────────────────────────────────────────────────────
const PublicProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab]         = useState("listings"); // "listings" | "reviews"

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await userAPI.getPublicProfile(username);
                setData(res.data);
            } catch {
                navigate("/home");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [username]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 size={36} className="animate-spin" style={{ color: "var(--c-accent)" }} />
        </div>
    );

    if (!data) return null;

    const { user, listings, reviews } = data;

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: "var(--c-surface)" }}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-medium transition-all"
                    style={{ color: "var(--c-ink-light)", fontFamily: "var(--font-display)" }}>
                    <ArrowLeft size={15} /> Back
                </button>

                {/* ── Profile Card ── */}
                <div className="card p-8 animate-fade-up">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">

                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0"
                            style={{ background: "var(--c-accent-light)" }}>
                            {user.avatar
                                ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                                : <div className="w-full h-full flex items-center justify-center"
                                    style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--c-accent)" }}>
                                    {(user.fullname || user.username)[0].toUpperCase()}
                                  </div>
                            }
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--c-ink)" }}>
                                {user.fullname || user.username}
                            </h1>
                            <p style={{ fontSize: "0.82rem", fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                @{user.username}
                            </p>

                            {user.bio && (
                                <p className="mt-3" style={{ fontSize: "0.875rem", color: "var(--c-ink-light)", lineHeight: 1.6 }}>
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
                                {user.college && (
                                    <span className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "var(--c-ink-light)" }}>
                                        <MapPin size={13} /> {user.college}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "var(--c-ink-light)" }}>
                                    <Calendar size={13} />
                                    Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-6 pt-5 border-t" style={{ borderColor: "var(--c-border)" }}>
                                <StatBlock
                                    label="Total Listed"
                                    value={user.totalListings ?? listings.length}
                                    icon={<Package size={16} style={{ color: "var(--c-accent)" }} />}
                                />
                                <StatBlock
                                    label="Active"
                                    value={user.activeListings ?? listings.length}
                                    icon={<Package size={16} style={{ color: "var(--c-green)" }} />}
                                />
                                <StatBlock
                                    label="Rating"
                                    value={user.averageRating > 0 ? user.averageRating.toFixed(1) : "—"}
                                    icon={<Star size={16} style={{ color: "#F59E0B" }} />}
                                    sub={user.totalRatings > 0 ? `${user.totalRatings} review${user.totalRatings > 1 ? "s" : ""}` : ""}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: "var(--c-border)" }}>
                    {[
                        { key: "listings", label: `Listings (${user.totalListings ?? listings.length})`,  icon: <Package size={14} /> },
                        { key: "reviews",  label: `Reviews (${user.totalRatings ?? reviews.length})`,    icon: <Star size={14} /> },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                fontFamily: "var(--font-display)",
                                background: tab === t.key ? "var(--c-white)" : "transparent",
                                color:      tab === t.key ? "var(--c-ink)"   : "var(--c-ink-light)",
                                boxShadow:  tab === t.key ? "var(--shadow-card)" : "none",
                            }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                {tab === "listings" && (
                    <div className="animate-fade-in">
                        {listings.length === 0 ? (
                            <EmptyState icon={<ShoppingBag size={36} />} msg="No active listings." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {listings.map(product => (
                                    <ListingCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === "reviews" && (
                    <div className="animate-fade-in space-y-4">
                        {reviews.length === 0 ? (
                            <EmptyState icon={<Star size={36} />} msg="No reviews yet." />
                        ) : (
                            reviews.map(review => (
                                <ReviewCard key={review._id} review={review} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Listing card on public profile ────────────────────────────────────────────
const ListingCard = ({ product }) => {
    const navigate = useNavigate();
    return (
        <div className="card overflow-hidden cursor-pointer transition-all"
            onClick={() => navigate(`/product/${product._id}`)}>
            <div className="h-36 overflow-hidden" style={{ background: "var(--c-surface)" }}>
                <img src={product.images?.[0] || "https://via.placeholder.com/300"}
                    className="w-full h-full object-cover" alt={product.title} />
            </div>
            <div className="p-3">
                <p className="font-semibold truncate"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "var(--c-ink)" }}>
                    {product.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-accent)", fontSize: "1rem" }}>
                        ₹{product.price.toLocaleString()}
                        {product.listingType === "rent" && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--c-ink-light)" }}>/day</span>
                        )}
                    </p>
                    <span className={`badge ${
                        product.condition === "new" || product.condition === "like-new" ? "badge-green" :
                        product.condition === "good" ? "badge-blue" :
                        product.condition === "fair" ? "badge-amber" : "badge-red"
                    }`}>{product.condition}</span>
                </div>
            </div>
        </div>
    );
};

// ── Review card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
    <div className="card p-5 animate-fade-up">
        <div className="flex items-start gap-3">
            {/* Reviewer avatar */}
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0"
                style={{ background: "var(--c-accent-light)" }}>
                {review.reviewer?.avatar
                    ? <img src={review.reviewer.avatar} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "var(--c-accent)" }}>
                        {(review.reviewer?.fullname || review.reviewer?.username || "?")[0].toUpperCase()}
                      </div>
                }
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--c-ink)" }}>
                        {review.reviewer?.fullname || review.reviewer?.username}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--c-ink-light)" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ fontSize: "0.9rem" }}>
                            {star <= review.rating ? "⭐" : "☆"}
                        </span>
                    ))}
                    <span className="ml-1 self-center"
                        style={{ fontSize: "0.72rem", color: "var(--c-ink-light)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                        {["", "Poor", "Fair", "Good", "Great", "Excellent"][review.rating]}
                    </span>
                </div>

                {review.comment && (
                    <p style={{ fontSize: "0.85rem", color: "var(--c-ink-light)", lineHeight: 1.6 }}>
                        "{review.comment}"
                    </p>
                )}
            </div>
        </div>
    </div>
);

// ── Helper components ─────────────────────────────────────────────────────────
const StatBlock = ({ label, value, icon, sub }) => (
    <div className="flex items-center gap-2">
        {icon}
        <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--c-ink)" }}>{value}</p>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--c-ink-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label} {sub && <span style={{ textTransform: "none", fontWeight: 400 }}>· {sub}</span>}
            </p>
        </div>
    </div>
);

const EmptyState = ({ icon, msg }) => (
    <div className="card p-12 text-center">
        <div className="mx-auto mb-3" style={{ color: "var(--c-border)" }}>{icon}</div>
        <p style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>{msg}</p>
    </div>
);

export default PublicProfilePage;