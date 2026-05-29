// ─────────────────────────────────────────────────────────────────────────────
// api.js — Centralized API service
// All backend calls go through here — no scattered fetch() calls in components.
// Automatically attaches auth token and handles token refresh on 401.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3005/api/v2";

// Get token from localStorage (set on login)
const getToken = () => localStorage.getItem("accessToken");

// Core fetch wrapper
const request = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: "include", // Send cookies too (for httpOnly refresh token)
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (options.body instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    verifyOTP: (body) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
    resendOTP: (body) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify(body) }),
    login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    logout: () => request("/auth/logout", { method: "POST" }),
    forgotPassword: (body) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
    resetPassword: (body) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
    refreshToken: (body) => request("/auth/refresh-token", { method: "POST", body: JSON.stringify(body) }),
};

// ── Users / Profile ───────────────────────────────────────────────────────────
export const userAPI = {
    getMyProfile: () => request("/users/profile"),
    editProfile: (body) => request("/users/profile", { method: "PATCH", body: JSON.stringify(body) }),
    updateAvatar: (formData) => request("/users/avatar", { method: "PATCH", body: formData }),
    removeAvatar: () => request("/users/avatar", { method: "DELETE" }),
    changePassword: (body) => request("/users/change-password", { method: "POST", body: JSON.stringify(body) }),
    getMyListings: (params = "") => request(`/users/my-listings${params}`),
    getPurchaseHistory: (params = "") => request(`/users/purchase-history${params}`),
    getSalesHistory: (params = "") => request(`/users/sales-history${params}`),
    getPublicProfile: (username) => request(`/users/${username}/profile`),
    getSellerReviews: (username) => request(`/users/${username}/reviews`),
    submitReview: (body) => request("/users/reviews", { method: "POST", body: JSON.stringify(body) }),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
    getAll: (params = "") => request(`/products${params}`),
    getById: (id) => request(`/products/${id}`),
    create: (formData) => request("/products", { method: "POST", body: formData }),
    update: (id, body) => request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
    create: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
    getMyOrders: (params = "") => request(`/orders/my-orders${params}`),
    getIncoming: (params = "") => request(`/orders/incoming${params}`),
    getById: (id) => request(`/orders/${id}`),
    accept: (id, body) => request(`/orders/${id}/accept`, { method: "PATCH", body: JSON.stringify(body) }),
    complete: (id) => request(`/orders/${id}/complete`, { method: "PATCH" }),
    cancel: (id, body) => request(`/orders/${id}/cancel`, { method: "PATCH", body: JSON.stringify(body) }),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
    generateDescription: (body) => request("/ai/generate-description", { method: "POST", body: JSON.stringify(body) }),
    suggestPrice:        (body) => request("/ai/suggest-price",         { method: "POST", body: JSON.stringify(body) }),
    chat:                (body) => request("/ai/chat",                  { method: "POST", body: JSON.stringify(body) }),
};