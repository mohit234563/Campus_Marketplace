/* eslint-disable react-hooks/set-state-in-effect */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { orderAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Loader2, ShoppingBag, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
    pending:   { label: "Pending",   class: "badge-amber", icon: <Clock size={13} /> },
    confirmed: { label: "Confirmed", class: "badge-blue",  icon: <CheckCircle size={13} /> },
    completed: { label: "Completed", class: "badge-green", icon: <CheckCircle size={13} /> },
    cancelled: { label: "Cancelled", class: "badge-red",   icon: <XCircle size={13} /> },
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = filter ? `?status=${filter}` : "";
            const data = await orderAPI.getMyOrders(params);
            setOrders(data.data.orders);
        } catch { /* empty */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [filter]);

    const handleCancel = async (orderId) => {
        if (!window.confirm("Cancel this request?")) return;
        try {
            await orderAPI.cancel(orderId, { cancelReason: "Buyer cancelled" });
            fetchOrders();
        } catch (err) { alert(err.message); }
    };

    // eslint-disable-next-line no-unused-vars
    const handleComplete = async (orderId) => {
        if (!window.confirm("Confirm you have exchanged the item and received payment?\n\nThis will mark the product as SOLD.")) return;
        try {
            await orderAPI.complete(orderId);
            fetchOrders();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: "var(--c-surface)" }}>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--c-ink)" }}>
                        My Orders
                    </h1>
                </div>

                {/* Status filter */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {["", "pending", "confirmed", "completed", "cancelled"].map(s => (
                        <button key={s || "all"}
                            onClick={() => setFilter(s)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                            style={{
                                fontFamily: "var(--font-display)",
                                background: filter === s ? "var(--c-accent)" : "var(--c-white)",
                                color: filter === s ? "white" : "var(--c-ink-light)",
                                borderColor: filter === s ? "var(--c-accent)" : "var(--c-border)",
                            }}>
                            {s || "All"}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={32} className="animate-spin" style={{ color: "var(--c-accent)" }} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card p-16 text-center">
                        <ShoppingBag size={40} className="mx-auto mb-4" style={{ color: "var(--c-border)" }} />
                        <p style={{ color: "var(--c-ink-light)" }}>No orders found.</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-up stagger">
                        {orders.map(order => {
                            const s = STATUS_CONFIG[order.status];
                            return (
                                <div key={order._id} className="card p-5">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--c-surface)" }}>
                                            <img src={order.product?.images?.[0] || "https://via.placeholder.com/100"}
                                                className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold truncate"
                                                    style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", fontSize: "0.95rem" }}>
                                                    {order.product?.title || "Deleted Product"}
                                                </h3>
                                                <span className={`badge shrink-0 flex items-center gap-1 ${s.class}`}>
                                                    {s.icon} {s.label}
                                                </span>
                                            </div>
                                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-accent)", fontSize: "1.1rem" }}>
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </p>
                                            <p style={{ fontSize: "0.78rem", color: "var(--c-ink-light)" }}>
                                                Seller: <strong style={{ color: "var(--c-ink)" }}>{order.seller?.username}</strong>
                                                {" · "}{new Date(order.createdAt).toLocaleDateString("en-IN")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Confirmed: show meetup details */}
                                    {order.status === "confirmed" && order.meetupLocation && (
                                        <div className="mt-4 p-3 rounded-xl animate-fade-in"
                                            style={{ background: "var(--c-accent-light)", border: "1px solid var(--c-accent-dim)" }}>
                                            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--c-accent)", fontFamily: "var(--font-display)" }}>
                                                📍 Meetup Details
                                            </p>
                                            <p style={{ fontSize: "0.8rem", color: "var(--c-accent)", marginTop: 4 }}>
                                                {order.meetupLocation}
                                            </p>
                                            {order.meetupTime && (
                                                <p style={{ fontSize: "0.8rem", color: "var(--c-accent)" }}>
                                                    🕐 {new Date(order.meetupTime).toLocaleString("en-IN")}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Buyer note */}
                                    {order.buyerNote && (
                                        <p className="mt-3" style={{ fontSize: "0.78rem", color: "var(--c-ink-light)", fontStyle: "italic" }}>
                                            Your note: "{order.buyerNote}"
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {order.status === "pending" && (
                                        <div className="mt-4">
                                            <button onClick={() => handleCancel(order._id)}
                                                className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                                                style={{ background: "#FEF2F2", color: "var(--c-red)", fontFamily: "var(--font-display)" }}>
                                                Cancel Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;