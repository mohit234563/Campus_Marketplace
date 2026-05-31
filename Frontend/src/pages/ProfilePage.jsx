// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, orderAPI, productAPI } from "../services/api";
import {
    // eslint-disable-next-line no-unused-vars
    User, Mail, Phone, MapPin, Calendar, Edit3, Camera,
    Package, ShoppingBag, TrendingUp, Loader2, Star,
    // eslint-disable-next-line no-unused-vars
    Save, X, CheckCircle, XCircle, Clock, AlertCircle,
    // eslint-disable-next-line no-unused-vars
    Trash2, Pencil, Plus, ChevronDown, ChevronUp
} from "lucide-react";
import { Alert } from "./SignupPage";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
    { key: "listings",  label: "My Listings",  icon: <Package size={15} /> },
    { key: "purchases", label: "Purchases",     icon: <ShoppingBag size={15} /> },
    { key: "sales",     label: "Sales",         icon: <TrendingUp size={15} /> },
    { key: "incoming",  label: "Requests",      icon: <AlertCircle size={15} /> },
];

const statusStyle = {
    pending:   "badge-amber",
    confirmed: "badge-blue",
    completed: "badge-green",
    cancelled: "badge-red",
};

// ── CATEGORIES & CONDITIONS (for edit product form) ───────────────────────────
const CATEGORIES = ["books","electronics","furniture","clothing","stationery","sports","other"];
const CONDITIONS  = ["new","like-new","good","fair","poor"];

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
    // eslint-disable-next-line no-unused-vars
    const { user, updateUser } = useAuth();
    const [profile, setProfile]       = useState(null);
    const [activeTab, setActiveTab]   = useState("listings");
    const [tabData, setTabData]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [tabLoading, setTabLoading] = useState(false);

    // Edit profile state
    const [editing, setEditing]     = useState(false);
    const [editForm, setEditForm]   = useState({});
    const [saving, setSaving]       = useState(false);
    const [editError, setEditError] = useState("");

    // Avatar
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarRef = useRef();

    // ── Load own profile ──────────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await userAPI.getMyProfile();
                setProfile(data.data.user);
                setEditForm({
                    fullname: data.data.user.fullname || "",
                    phone:    data.data.user.phone    || "",
                    college:  data.data.user.college  || "",
                    bio:      data.data.user.bio      || "",
                });
            // eslint-disable-next-line no-empty
            } catch {}
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    // ── Load tab data ─────────────────────────────────────────────────────
    const refreshTab = async (tab) => {
        setTabLoading(true);
        try {
            let data;
            if (tab === "listings")  data = await userAPI.getMyListings();
            if (tab === "purchases") data = await userAPI.getPurchaseHistory();
            if (tab === "sales")     data = await userAPI.getSalesHistory();
            if (tab === "incoming")  data = await orderAPI.getIncoming();
            setTabData(data?.data?.products || data?.data?.orders || []);
        } catch { setTabData([]); }
        finally { setTabLoading(false); }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { refreshTab(activeTab); }, [activeTab]);

    // ── Save profile edits ────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        setSaving(true); setEditError("");
        try {
            const data = await userAPI.editProfile(editForm);
            setProfile(data.data.user);
            updateUser(data.data.user);
            setEditing(false);
        } catch (err) { setEditError(err.message); }
        finally { setSaving(false); }
    };

    // ── Avatar upload ─────────────────────────────────────────────────────
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append("avatar", file);
            const data = await userAPI.updateAvatar(fd);
            setProfile(prev => ({ ...prev, avatar: data.data.avatar }));
            updateUser({ avatar: data.data.avatar });
        } catch (err) { alert(err.message); }
        finally { setAvatarUploading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 size={36} className="animate-spin" style={{ color: "var(--c-accent)" }} />
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center">
            <p style={{ color: "var(--c-ink-light)" }}>Could not load profile.</p>
        </div>
    );

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: "var(--c-surface)" }}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Profile Card ── */}
                <div className="card p-8 animate-fade-up">
                    <div className="flex flex-col md:flex-row gap-6 items-start">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden"
                                style={{ background: "var(--c-accent-light)" }}>
                                {profile.avatar
                                    ? <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
                                    : <div className="w-full h-full flex items-center justify-center"
                                        style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--c-accent)" }}>
                                        {(profile.fullname || profile.username || "U")[0].toUpperCase()}
                                      </div>
                                }
                            </div>
                            <button onClick={() => avatarRef.current.click()}
                                disabled={avatarUploading}
                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-2"
                                style={{ background: "var(--c-accent)", borderColor: "var(--c-white)" }}>
                                {avatarUploading
                                    ? <Loader2 size={12} className="animate-spin text-white" />
                                    : <Camera size={12} className="text-white" />
                                }
                            </button>
                            <input type="file" ref={avatarRef} hidden accept="image/*" onChange={handleAvatarChange} />
                        </div>

                        {/* Info / Edit form */}
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="space-y-4 animate-fade-in">
                                    {editError && <Alert type="error" msg={editError} />}
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Full Name"  value={editForm.fullname} onChange={v => setEditForm(f=>({...f, fullname:v}))} />
                                        <InputField label="Phone"      value={editForm.phone}    onChange={v => setEditForm(f=>({...f, phone:v}))}    placeholder="10-digit number" />
                                        <InputField label="College"    value={editForm.college}  onChange={v => setEditForm(f=>({...f, college:v}))}  />
                                    </div>
                                    <div className="space-y-1">
                                        <label style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Bio</label>
                                        <textarea rows={2} className="input resize-none text-sm" value={editForm.bio}
                                            onChange={e => setEditForm(f=>({...f, bio:e.target.value}))} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveProfile} disabled={saving}
                                            className="btn-primary flex items-center gap-2 text-sm">
                                            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save
                                        </button>
                                        <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.6rem", color:"var(--c-ink)" }}>
                                                {profile.fullname || profile.username}
                                            </h1>
                                            <p style={{ fontSize:"0.8rem", fontFamily:"var(--font-display)", fontWeight:600, color:"var(--c-accent)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
                                                @{profile.username}
                                            </p>
                                        </div>
                                        <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-2 text-sm shrink-0">
                                            <Edit3 size={14}/> Edit
                                        </button>
                                    </div>
                                    {profile.bio && (
                                        <p className="mt-3" style={{ fontSize:"0.875rem", color:"var(--c-ink-light)", lineHeight:1.6 }}>
                                            {profile.bio}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                                        <InfoItem icon={<Mail size={13}/>}     text={profile.email} />
                                        {profile.phone   && <InfoItem icon={<Phone size={13}/>}   text={profile.phone} />}
                                        {profile.college && <InfoItem icon={<MapPin size={13}/>}   text={profile.college} />}
                                        <InfoItem icon={<Calendar size={13}/>} text={`Joined ${new Date(profile.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"})}`} />
                                    </div>
                                    <div className="flex gap-6 mt-6 pt-6 border-t" style={{ borderColor:"var(--c-border)" }}>
                                        <Stat label="Total Listed"  value={profile.totalListings  ?? "—"} />
                                        <Stat label="Active"        value={profile.activeListings ?? "—"} />
                                        <Stat label="Rating"        value={profile.averageRating > 0 ? `⭐ ${profile.averageRating}` : "—"} />
                                        <Stat label="Reviews"       value={profile.totalRatings   || 0} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-1 rounded-2xl w-fit overflow-x-auto" style={{ background:"var(--c-border)" }}>
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                            style={{
                                fontFamily:"var(--font-display)",
                                background: activeTab === tab.key ? "var(--c-white)" : "transparent",
                                color:      activeTab === tab.key ? "var(--c-ink)"   : "var(--c-ink-light)",
                                boxShadow:  activeTab === tab.key ? "var(--shadow-card)" : "none",
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="animate-fade-in">
                    {tabLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={28} className="animate-spin" style={{ color:"var(--c-accent)" }} />
                        </div>
                    ) : tabData.length === 0 ? (
                        <div className="card p-12 text-center">
                            <p style={{ color:"var(--c-ink-light)", fontSize:"0.9rem" }}>Nothing here yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeTab === "listings"  && tabData.map(p => (
                                <ListingRow key={p._id} product={p} onRefresh={() => refreshTab("listings")} />
                            ))}
                            {activeTab === "purchases" && tabData.map(o => (
                                <OrderRow key={o._id} order={o} tab="purchases" onRefresh={() => refreshTab("purchases")} />
                            ))}
                            {activeTab === "sales"     && tabData.map(o => (
                                <OrderRow key={o._id} order={o} tab="sales" onRefresh={() => refreshTab("sales")} />
                            ))}
                            {activeTab === "incoming"  && tabData.map(o => (
                                <IncomingRow key={o._id} order={o} onRefresh={() => refreshTab("incoming")} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTING ROW — with Edit and Delete
// ─────────────────────────────────────────────────────────────────────────────
const ListingRow = ({ product, onRefresh }) => {
    const [editing, setEditing]       = useState(false);
    const [deleting, setDeleting]     = useState(false);
    const [saving, setSaving]         = useState(false);
    const [editForm, setEditForm]     = useState({
        title:             product.title,
        description:       product.description || "",
        price:             product.price,
        category:          product.category,
        condition:         product.condition,
        rentalPricePerDay: product.rentalPricePerDay || "",
    });
    const [editError, setEditError] = useState("");

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true); setEditError("");
        try {
            await productAPI.update(product._id, {
                ...editForm,
                price: parseFloat(editForm.price),
                rentalPricePerDay: editForm.rentalPricePerDay ? parseFloat(editForm.rentalPricePerDay) : undefined,
            });
            setEditing(false);
            onRefresh();
        } catch (err) { setEditError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await productAPI.delete(product._id);
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setDeleting(false); }
    };

    return (
        <div className="card overflow-hidden">
            {/* ── Collapsed view ── */}
            <div className="p-5 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background:"var(--c-surface)" }}>
                    <img src={product.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate" style={{ fontFamily:"var(--font-display)", color:"var(--c-ink)", fontSize:"0.9rem" }}>
                            {product.title}
                        </h3>
                        <span className={`badge ${product.isSold ? "badge-gray" : "badge-green"}`}>
                            {product.isSold ? "Sold" : "Active"}
                        </span>
                        {product.listingType === "rent" && (
                            <span className="badge badge-amber">Rent</span>
                        )}
                    </div>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--c-accent)", fontSize:"1.05rem" }}>
                        ₹{product.price.toLocaleString()}
                        {product.listingType === "rent" && product.rentalPricePerDay && (
                            <span style={{ fontSize:"0.7rem", fontWeight:500, color:"var(--c-ink-light)" }}>
                                {" "}· ₹{product.rentalPricePerDay}/day
                            </span>
                        )}
                    </p>
                    <p style={{ fontSize:"0.75rem", color:"var(--c-ink-light)" }}>
                        {product.category} · {product.condition} · {new Date(product.createdAt).toLocaleDateString("en-IN")}
                    </p>
                </div>

                {/* Action buttons — only on active, unsold listings */}
                {!product.isSold && (
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditing(!editing)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: editing ? "var(--c-accent)" : "var(--c-surface)", color: editing ? "white" : "var(--c-ink-light)" }}
                            title="Edit listing">
                            <Pencil size={14} />
                        </button>
                        <button onClick={handleDelete} disabled={deleting}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                            style={{ background: "var(--c-surface)", color: "var(--c-red)" }}
                            title="Delete listing">
                            {deleting ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Inline Edit Form ── */}
            {editing && (
                <form onSubmit={handleUpdate}
                    className="border-t px-5 pb-5 pt-4 space-y-4 animate-slide-down"
                    style={{ borderColor:"var(--c-border)", background:"var(--c-surface)" }}>
                    <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--c-ink)", fontFamily:"var(--font-display)" }}>
                        Edit Listing
                    </p>

                    {editError && <Alert type="error" msg={editError} />}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Title</label>
                            <input className="input text-sm" value={editForm.title}
                                onChange={e => setEditForm(f=>({...f, title:e.target.value}))} required />
                        </div>
                        <div className="space-y-1">
                            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Category</label>
                            <select className="input text-sm" value={editForm.category}
                                onChange={e => setEditForm(f=>({...f, category:e.target.value}))}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Condition</label>
                            <select className="input text-sm" value={editForm.condition}
                                onChange={e => setEditForm(f=>({...f, condition:e.target.value}))}>
                                {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Price (₹)</label>
                            <input type="number" min="0" className="input text-sm" value={editForm.price}
                                onChange={e => setEditForm(f=>({...f, price:e.target.value}))} required />
                        </div>
                        {product.listingType === "rent" && (
                            <div className="space-y-1">
                                <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Rent/day (₹)</label>
                                <input type="number" min="0" className="input text-sm" value={editForm.rentalPricePerDay}
                                    onChange={e => setEditForm(f=>({...f, rentalPricePerDay:e.target.value}))} />
                            </div>
                        )}
                        <div className="col-span-2 space-y-1">
                            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>Description</label>
                            <textarea rows={3} className="input text-sm resize-none" value={editForm.description}
                                onChange={e => setEditForm(f=>({...f, description:e.target.value}))} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={saving}
                            className="btn-primary text-xs py-2 flex items-center gap-1.5">
                            {saving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
                            Save Changes
                        </button>
                        <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-xs py-2">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ROW — purchase history & sales history with review support
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const OrderRow = ({ order, tab, onRefresh }) => {
    const [showReview, setShowReview]   = useState(false);
    const [rating, setRating]           = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment]         = useState("");
    const [submitting, setSubmitting]   = useState(false);
    const [reviewDone, setReviewDone]   = useState(false);
    const [reviewError, setReviewError] = useState("");

    const canReview = tab === "purchases" && order.status === "completed";

    const handleReview = async (e) => {
        e.preventDefault();
        if (rating === 0) return setReviewError("Please select a star rating.");
        setSubmitting(true); setReviewError("");
        try {
            await userAPI.submitReview({ orderId: order._id, rating, comment });
            setReviewDone(true);
            setShowReview(false);
        } catch (err) { setReviewError(err.message); }
        finally { setSubmitting(false); }
    };

    const isRental = order.orderType === "rental";

    return (
        <div className="card overflow-hidden">
            <div className="p-5 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background:"var(--c-surface)" }}>
                    <img src={order.product?.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold" style={{ fontFamily:"var(--font-display)", color:"var(--c-ink)", fontSize:"0.9rem" }}>
                                {order.product?.title || "Deleted Product"}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`badge ${statusStyle[order.status]}`}>{order.status}</span>
                                {isRental && <span className="badge badge-amber">Rental</span>}
                            </div>
                        </div>
                        <p style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--c-accent)", fontSize:"1rem", shrink:0 }}>
                            ₹{order.totalAmount?.toLocaleString()}
                        </p>
                    </div>

                    <p className="mt-1" style={{ fontSize:"0.75rem", color:"var(--c-ink-light)" }}>
                        {tab === "purchases"
                            ? <>Seller: <strong style={{ color:"var(--c-ink)" }}>{order.seller?.username}</strong></>
                            : <>Buyer: <strong style={{ color:"var(--c-ink)" }}>{order.buyer?.username}</strong></>
                        }
                        {" · "}{new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>

                    {/* Rental dates summary */}
                    {isRental && order.rentalStartDate && (
                        <p className="mt-1" style={{ fontSize:"0.72rem", color:"var(--c-ink-light)" }}>
                            📅 {new Date(order.rentalStartDate).toLocaleDateString("en-IN")} →{" "}
                            {new Date(order.rentalEndDate).toLocaleDateString("en-IN")}
                        </p>
                    )}
                </div>
            </div>

            {/* Review section — only for completed purchases */}
            {canReview && !reviewDone && (
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor:"var(--c-border)" }}>
                    {!showReview ? (
                        <button onClick={() => setShowReview(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                            style={{ color:"var(--c-accent)", fontFamily:"var(--font-display)" }}>
                            <Star size={13}/> Leave a Review
                        </button>
                    ) : (
                        <form onSubmit={handleReview} className="space-y-3 animate-fade-in">
                            <p style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--c-ink)", fontFamily:"var(--font-display)" }}>
                                Rate your experience with {order.seller?.username}
                            </p>

                            {/* Star Rating */}
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                    <button key={star} type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        style={{ fontSize:"1.6rem", cursor:"pointer", transition:"transform 0.1s",
                                            transform: (hoverRating||rating) >= star ? "scale(1.15)" : "scale(1)" }}>
                                        {(hoverRating || rating) >= star ? "⭐" : "☆"}
                                    </button>
                                ))}
                                {rating > 0 && (
                                    <span className="ml-2 self-center" style={{ fontSize:"0.75rem", color:"var(--c-ink-light)" }}>
                                        {["","Poor","Fair","Good","Great","Excellent"][rating]}
                                    </span>
                                )}
                            </div>

                            <textarea rows={2} className="input text-sm resize-none"
                                placeholder="Describe your experience (optional)..."
                                value={comment}
                                onChange={e => setComment(e.target.value)} />

                            {reviewError && <p style={{ fontSize:"0.75rem", color:"var(--c-red)" }}>{reviewError}</p>}

                            <div className="flex gap-2">
                                <button type="submit" disabled={submitting}
                                    className="btn-primary text-xs py-2 flex items-center gap-1.5">
                                    {submitting ? <Loader2 size={12} className="animate-spin"/> : <Star size={12}/>}
                                    Submit Review
                                </button>
                                <button type="button" onClick={() => setShowReview(false)} className="btn-ghost text-xs py-2">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Review submitted confirmation */}
            {reviewDone && (
                <div className="border-t px-5 py-3 flex items-center gap-2" style={{ borderColor:"var(--c-border)", background:"#F0FDF4" }}>
                    <CheckCircle size={14} style={{ color:"var(--c-green)" }}/>
                    <p style={{ fontSize:"0.78rem", color:"var(--c-green)", fontWeight:600 }}>Review submitted!</p>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INCOMING ROW — seller view with accept / complete / cancel
// ─────────────────────────────────────────────────────────────────────────────
const IncomingRow = ({ order, onRefresh }) => {
    const [acting, setActing]       = useState(false);
    const [showForm, setShowForm]   = useState(false);
    const [meetup, setMeetup]       = useState({ meetupLocation:"", meetupTime:"" });

    const handleAccept = async () => {
        if (!meetup.meetupLocation || !meetup.meetupTime) return alert("Please fill meetup details.");
        setActing(true);
        try {
            await orderAPI.accept(order._id, meetup);
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setActing(false); }
    };

    const handleReject = async () => {
        if (!window.confirm("Decline this request?")) return;
        setActing(true);
        try {
            await orderAPI.cancel(order._id, { cancelReason:"Seller declined" });
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setActing(false); }
    };

    const handleComplete = async () => {
        const msg = order.orderType === "rental"
            ? "Confirm the item has been returned by the buyer?\n\nThis will mark the rental as complete and free up the listing."
            : "Confirm you have exchanged the item and received payment?\n\nThis will mark the product as SOLD.";
        if (!window.confirm(msg)) return;
        setActing(true);
        try {
            await orderAPI.complete(order._id);
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setActing(false); }
    };

    const handleCancelConfirmed = async () => {
        const reason = window.prompt("Reason for cancelling (optional):");
        if (reason === null) return;
        setActing(true);
        try {
            await orderAPI.cancel(order._id, { cancelReason: reason || "Seller cancelled" });
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setActing(false); }
    };

    const isRental = order.orderType === "rental";

    return (
        <div className="card p-5 space-y-4">
            {/* Order info */}
            <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background:"var(--c-surface)" }}>
                    <img src={order.product?.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold" style={{ fontFamily:"var(--font-display)", color:"var(--c-ink)", fontSize:"0.9rem" }}>
                            {order.product?.title}
                        </h3>
                        <div className="flex gap-1 shrink-0">
                            <span className={`badge ${statusStyle[order.status]}`}>{order.status}</span>
                            {isRental && <span className="badge badge-amber">Rental</span>}
                        </div>
                    </div>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--c-accent)" }}>
                        ₹{order.totalAmount?.toLocaleString()}
                    </p>
                    <p style={{ fontSize:"0.78rem", color:"var(--c-ink-light)" }}>
                        From: <strong style={{ color:"var(--c-ink)" }}>{order.buyer?.username}</strong>
                        {order.buyer?.college && ` · ${order.buyer.college}`}
                        {order.buyer?.phone && (
                            <span style={{ color:"var(--c-accent)", marginLeft:6 }}>📞 {order.buyer.phone}</span>
                        )}
                    </p>
                    {/* Rental dates */}
                    {isRental && order.rentalStartDate && (
                        <p style={{ fontSize:"0.72rem", color:"var(--c-ink-light)", marginTop:2 }}>
                            📅 {new Date(order.rentalStartDate).toLocaleDateString("en-IN")} →{" "}
                            {new Date(order.rentalEndDate).toLocaleDateString("en-IN")}
                        </p>
                    )}
                    {order.buyerNote && (
                        <p className="mt-1 px-2 py-1 rounded-lg" style={{ fontSize:"0.75rem", color:"var(--c-ink-light)", fontStyle:"italic", background:"var(--c-surface)" }}>
                            "{order.buyerNote}"
                        </p>
                    )}
                </div>
            </div>

            {/* Meetup info after acceptance */}
            {order.status === "confirmed" && order.meetupLocation && (
                <div className="p-3 rounded-xl" style={{ background:"var(--c-accent-light)", border:"1px solid var(--c-accent-dim)" }}>
                    <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--c-accent)", fontFamily:"var(--font-display)", marginBottom:4 }}>
                        📍 Meetup Set
                    </p>
                    <p style={{ fontSize:"0.8rem", color:"var(--c-accent)" }}>{order.meetupLocation}</p>
                    {order.meetupTime && (
                        <p style={{ fontSize:"0.78rem", color:"var(--c-accent)" }}>
                            🕐 {new Date(order.meetupTime).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}
                        </p>
                    )}
                </div>
            )}

            {/* ── PENDING actions ── */}
            {order.status === "pending" && (
                showForm ? (
                    <div className="space-y-2 p-3 rounded-xl animate-fade-in" style={{ background:"var(--c-surface)" }}>
                        <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--c-ink)", fontFamily:"var(--font-display)" }}>
                            Set meetup details:
                        </p>
                        <input className="input text-sm" placeholder="Location (e.g. Library Gate 2)"
                            value={meetup.meetupLocation}
                            onChange={e => setMeetup(m=>({...m, meetupLocation:e.target.value}))} />
                        <input className="input text-sm" type="datetime-local"
                            value={meetup.meetupTime}
                            onChange={e => setMeetup(m=>({...m, meetupTime:e.target.value}))} />
                        <div className="flex gap-2">
                            <button onClick={handleAccept} disabled={acting}
                                className="btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1.5">
                                {acting ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle size={12}/>}
                                Confirm & Send Meetup
                            </button>
                            <button onClick={() => setShowForm(false)} className="btn-ghost text-xs py-2">Back</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setShowForm(true)}
                            className="btn-primary text-xs py-2.5 flex-1 flex items-center justify-center gap-1.5">
                            <CheckCircle size={13}/> Accept & Set Meetup
                        </button>
                        <button onClick={handleReject} disabled={acting}
                            className="text-xs py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                            style={{ background:"#FEF2F2", color:"var(--c-red)", fontFamily:"var(--font-display)" }}>
                            <XCircle size={13}/> Decline
                        </button>
                    </div>
                )
            )}

            {/* ── CONFIRMED actions ── */}
            {order.status === "confirmed" && (
                <div className="space-y-2">
                    <p style={{ fontSize:"0.75rem", color:"var(--c-ink-light)", fontStyle:"italic" }}>
                        {isRental
                            ? "Once the buyer returns the item, mark the rental as complete."
                            : "Once you've handed over the item and received payment, mark as complete."}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={handleComplete} disabled={acting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition-all"
                            style={{ fontFamily:"var(--font-display)", background:"var(--c-green)", color:"white" }}>
                            {acting ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle size={13}/>}
                            {isRental ? "Mark Rental Complete" : "Mark as Completed"}
                        </button>
                        <button onClick={handleCancelConfirmed} disabled={acting}
                            className="px-4 py-2.5 rounded-xl font-semibold text-xs"
                            style={{ fontFamily:"var(--font-display)", background:"#FEF2F2", color:"var(--c-red)" }}>
                            Cancel Deal
                        </button>
                    </div>
                </div>
            )}

            {/* ── COMPLETED ── */}
            {order.status === "completed" && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background:"#F0FDF4", border:"1px solid #BBF7D0" }}>
                    <CheckCircle size={16} style={{ color:"var(--c-green)" }}/>
                    <div>
                        <p style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--c-green)", fontFamily:"var(--font-display)" }}>
                            {isRental ? "Rental complete!" : "Deal completed!"}
                        </p>
                        <p style={{ fontSize:"0.72rem", color:"var(--c-green)" }}>
                            {isRental ? "Listing available again for future rentals" : "Product marked as sold"}
                            {" · "}Completed on {new Date(order.completedAt || order.updatedAt).toLocaleDateString("en-IN")}
                        </p>
                    </div>
                </div>
            )}

            {/* ── CANCELLED ── */}
            {order.status === "cancelled" && (
                <div className="p-3 rounded-xl" style={{ background:"#FEF2F2", border:"1px solid #FEE2E2" }}>
                    <p style={{ fontSize:"0.78rem", color:"var(--c-red)" }}>
                        <strong>Cancelled</strong>{order.cancelReason && ` — ${order.cancelReason}`}
                    </p>
                </div>
            )}
        </div>
    );
};

// ── Small reusable components ─────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1">
        <label style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--c-ink-light)", fontFamily:"var(--font-display)" }}>{label}</label>
        <input className="input text-sm" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
);

const InfoItem = ({ icon, text }) => (
    <div className="flex items-center gap-1.5" style={{ fontSize:"0.825rem", color:"var(--c-ink-light)" }}>
        <span>{icon}</span> {text}
    </div>
);

const Stat = ({ label, value }) => (
    <div>
        <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.25rem", color:"var(--c-ink)" }}>{value}</p>
        <p style={{ fontSize:"0.7rem", fontWeight:600, color:"var(--c-ink-light)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
    </div>
);

export default ProfilePage;