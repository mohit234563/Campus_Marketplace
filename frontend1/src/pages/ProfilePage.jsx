import  { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, orderAPI } from "../services/api";
import {
    User, Mail, Phone, MapPin, Calendar, Edit3, Camera,
    Package, ShoppingBag, TrendingUp, Star, Loader2,
    Save, X, Trash2, CheckCircle, Clock, AlertCircle, ChevronRight
} from "lucide-react";
import { Alert } from "./SignupPage";

const TABS = [
    { key: "listings", label: "My Listings", icon: <Package size={15} /> },
    { key: "purchases", label: "Purchases", icon: <ShoppingBag size={15} /> },
    { key: "sales", label: "Sales", icon: <TrendingUp size={15} /> },
    { key: "incoming", label: "Requests", icon: <AlertCircle size={15} /> },
];

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState("listings");
    const [tabData, setTabData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarRef = useRef();

    // Load profile
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await userAPI.getMyProfile();
                setProfile(data.data.user);
                setEditForm({
                    fullname: data.data.user.fullname || "",
                    phone: data.data.user.phone || "",
                    college: data.data.user.college || "",
                    bio: data.data.user.bio || "",
                });
            } catch { } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Load tab data
    useEffect(() => {
        const fetchTab = async () => {
            setTabLoading(true);
            try {
                let data;
                if (activeTab === "listings") data = await userAPI.getMyListings();
                else if (activeTab === "purchases") data = await userAPI.getPurchaseHistory();
                else if (activeTab === "sales") data = await userAPI.getSalesHistory();
                else if (activeTab === "incoming") data = await orderAPI.getIncoming();
                setTabData(data?.data?.products || data?.data?.orders || []);
            } catch { setTabData([]); }
            finally { setTabLoading(false); }
        };
        fetchTab();
    }, [activeTab]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setEditError("");
        try {
            const data = await userAPI.editProfile(editForm);
            setProfile(data.data.user);
            updateUser(data.data.user);
            setEditing(false);
        } catch (err) {
            setEditError(err.message);
        } finally {
            setSaving(false);
        }
    };

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
        } catch (err) {
            alert(err.message);
        } finally {
            setAvatarUploading(false);
        }
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

                        {/* Info or Edit Form */}
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="space-y-4 animate-fade-in">
                                    {editError && <Alert type="error" msg={editError} />}
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Full Name" value={editForm.fullname}
                                            onChange={v => setEditForm({ ...editForm, fullname: v })} />
                                        <InputField label="Phone" value={editForm.phone}
                                            onChange={v => setEditForm({ ...editForm, phone: v })} placeholder="10-digit number" />
                                        <InputField label="College" value={editForm.college}
                                            onChange={v => setEditForm({ ...editForm, college: v })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-ink-light)", fontFamily: "var(--font-display)" }}>Bio</label>
                                        <textarea rows={2} className="input resize-none text-sm" value={editForm.bio}
                                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveProfile} disabled={saving}
                                            className="btn-primary flex items-center gap-2 text-sm">
                                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(false)} className="btn-ghost text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "var(--c-ink)" }}>
                                                {profile.fullname || profile.username}
                                            </h1>
                                            <p style={{ fontSize: "0.8rem", fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                @{profile.username}
                                            </p>
                                        </div>
                                        <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-2 text-sm shrink-0">
                                            <Edit3 size={14} /> Edit
                                        </button>
                                    </div>

                                    {profile.bio && (
                                        <p className="mt-3" style={{ fontSize: "0.875rem", color: "var(--c-ink-light)", lineHeight: 1.6 }}>
                                            {profile.bio}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                                        <InfoItem icon={<Mail size={13} />} text={profile.email} />
                                        {profile.phone && <InfoItem icon={<Phone size={13} />} text={profile.phone} />}
                                        {profile.college && <InfoItem icon={<MapPin size={13} />} text={profile.college} />}
                                        <InfoItem icon={<Calendar size={13} />}
                                            text={`Joined ${new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`} />
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-6 mt-6 pt-6 border-t" style={{ borderColor: "var(--c-border)" }}>
                                        <Stat label="Listed" value={profile.totalListings || "—"} />
                                        <Stat label="Rating" value={profile.averageRating > 0 ? `⭐ ${profile.averageRating}` : "—"} />
                                        <Stat label="Reviews" value={profile.totalRatings || 0} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: "var(--c-border)" }}>
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                fontFamily: "var(--font-display)",
                                background: activeTab === tab.key ? "var(--c-white)" : "transparent",
                                color: activeTab === tab.key ? "var(--c-ink)" : "var(--c-ink-light)",
                                boxShadow: activeTab === tab.key ? "var(--shadow-card)" : "none",
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="animate-fade-in">
                    {tabLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={28} className="animate-spin" style={{ color: "var(--c-accent)" }} />
                        </div>
                    ) : tabData.length === 0 ? (
                        <div className="card p-12 text-center">
                            <p style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>Nothing here yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeTab === "listings" && tabData.map(p => <ListingRow key={p._id} product={p} />)}
                            {(activeTab === "purchases" || activeTab === "sales") && tabData.map(o => <OrderRow key={o._id} order={o} tab={activeTab} />)}
                            {activeTab === "incoming" && tabData.map(o => <IncomingRow key={o._id} order={o} onRefresh={() => setActiveTab("incoming")} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InputField = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1">
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--c-ink-light)", fontFamily: "var(--font-display)" }}>{label}</label>
        <input className="input text-sm" value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)} />
    </div>
);

const InfoItem = ({ icon, text }) => (
    <div className="flex items-center gap-1.5" style={{ fontSize: "0.825rem", color: "var(--c-ink-light)" }}>
        <span>{icon}</span> {text}
    </div>
);

const Stat = ({ label, value }) => (
    <div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--c-ink)" }}>{value}</p>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--c-ink-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    </div>
);

const statusStyle = {
    pending: "badge-amber", confirmed: "badge-blue",
    completed: "badge-green", cancelled: "badge-red"
};

const ListingRow = ({ product }) => (
    <div className="card p-5 flex gap-4 items-center">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--c-surface)" }}>
            <img src={product.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)" }}>
                    {product.title}
                </h3>
                <span className={`badge shrink-0 ${product.isSold ? "badge-gray" : "badge-green"}`}>
                    {product.isSold ? "Sold" : "Active"}
                </span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-accent)", fontSize: "1.1rem" }}>
                ₹{product.price.toLocaleString()}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--c-ink-light)" }}>
                {product.category} · {product.condition} · {new Date(product.createdAt).toLocaleDateString("en-IN")}
            </p>
        </div>
    </div>
);

const OrderRow = ({ order, tab }) => (
    <div className="card p-5 flex gap-4 items-center">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--c-surface)" }}>
            <img src={order.product?.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", fontSize: "0.9rem" }}>
                    {order.product?.title || "Deleted Product"}
                </h3>
                <span className={`badge shrink-0 ${statusStyle[order.status]}`}>{order.status}</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-accent)" }}>
                ₹{order.totalAmount?.toLocaleString()}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--c-ink-light)" }}>
                {tab === "purchases" ? `Seller: ${order.seller?.username}` : `Buyer: ${order.buyer?.username}`}
                {" · "}{new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
        </div>
    </div>
);

const IncomingRow = ({ order, onRefresh }) => {
    const [acting, setActing] = useState(false);
    const [meetup, setMeetup] = useState({ meetupLocation: "", meetupTime: "" });
    const [showForm, setShowForm] = useState(false);

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
        if (!window.confirm("Reject this request?")) return;
        setActing(true);
        try {
            await orderAPI.cancel(order._id, { cancelReason: "Seller declined" });
            onRefresh();
        } catch (err) { alert(err.message); }
        finally { setActing(false); }
    };

    return (
        <div className="card p-5 space-y-3">
            <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--c-surface)" }}>
                    <img src={order.product?.images?.[0] || "https://via.placeholder.com/100"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", fontSize: "0.9rem" }}>
                            {order.product?.title}
                        </h3>
                        <span className={`badge shrink-0 ${statusStyle[order.status]}`}>{order.status}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--c-ink-light)" }}>
                        From: <strong style={{ color: "var(--c-ink)" }}>{order.buyer?.username}</strong>
                        {order.buyer?.college && ` · ${order.buyer.college}`}
                    </p>
                    {order.buyerNote && (
                        <p style={{ fontSize: "0.78rem", color: "var(--c-ink-light)", fontStyle: "italic", marginTop: 4 }}>
                            "{order.buyerNote}"
                        </p>
                    )}
                </div>
            </div>

            {order.status === "pending" && (
                <>
                    {showForm ? (
                        <div className="space-y-2 p-3 rounded-xl animate-fade-in" style={{ background: "var(--c-surface)" }}>
                            <input className="input text-sm" placeholder="Meetup location (e.g. Library Gate 2)"
                                value={meetup.meetupLocation}
                                onChange={e => setMeetup({ ...meetup, meetupLocation: e.target.value })} />
                            <input className="input text-sm" type="datetime-local"
                                value={meetup.meetupTime}
                                onChange={e => setMeetup({ ...meetup, meetupTime: e.target.value })} />
                            <div className="flex gap-2">
                                <button onClick={handleAccept} disabled={acting}
                                    className="btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1">
                                    {acting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                    Confirm Accept
                                </button>
                                <button onClick={() => setShowForm(false)} className="btn-ghost text-xs py-2">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setShowForm(true)}
                                className="btn-primary text-xs py-2 flex-1">
                                Accept & Set Meetup
                            </button>
                            <button onClick={handleReject} disabled={acting}
                                className="text-xs py-2 px-4 rounded-xl font-semibold transition-all"
                                style={{ background: "#FEF2F2", color: "var(--c-red)", fontFamily: "var(--font-display)" }}>
                                Decline
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;