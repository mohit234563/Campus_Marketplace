import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authAPI.login(form);
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--c-surface)" }}>
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12"
        style={{ background: "var(--c-ink)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--c-accent)" }}
          >
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "white",
              fontSize: "1.1rem",
            }}
          >
            CampusMarket
          </span>
        </div>

        <div className="animate-fade-up stagger">
          <p
            className="text-sm font-medium mb-6 uppercase tracking-widest"
            style={{ color: "var(--c-accent)" }}
          >
            Welcome Back
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "2.8rem",
              lineHeight: 1.1,
              color: "white",
            }}
          >
            Your campus,<br />your marketplace.
          </h2>

          <p className="mt-6 leading-relaxed" style={{ color: "#9CA3AF", fontSize: "0.95rem" }}>
            Buy and sell textbooks, electronics, and more with students from your own campus.
          </p>

          <div
            className="mt-12 p-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                color: "#D1D5DB",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            >
              "Sold my old physics textbook in 20 minutes. This app is genuinely useful for
              college students."
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--c-accent)" }}
              >
                R
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 600, fontSize: "0.8rem" }}>
                  Riya Sharma
                </p>
                <p style={{ color: "#6B7280", fontSize: "0.75rem" }}>
                  IIT Delhi, CS 3rd Year
                </p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ color: "#4B5563", fontSize: "0.75rem" }}>
          © 2025 CampusMarket. Campus-only, safe & free.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--c-accent)" }}
            >
              <ShoppingBag size={15} className="text-white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--c-ink)",
              }}
            >
              CampusMarket
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "2rem",
              color: "var(--c-ink)",
            }}
          >
            Sign In
          </h1>

          <p className="mt-2 mb-8" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--c-accent)", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm animate-fade-in"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FEE2E2",
                color: "var(--c-red)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email address" icon={<Mail size={17} />}>
              <input
                name="email"
                type="email"
                required
                placeholder="you@college.edu"
                className="input w-full pl-12 pr-4"
                value={form.email}
                onChange={handleChange}
              />
            </Field>

            <Field
              label="Password"
              icon={<Lock size={17} />}
              right={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ color: "var(--c-ink-light)" }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            >
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                className="input w-full pl-12 pr-12"
                value={form.password}
                onChange={handleChange}
              />
            </Field>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                style={{ fontSize: "0.85rem", color: "var(--c-accent)", fontWeight: 600 }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Field = ({ label, icon, right, children }) => (
  <div className="space-y-1.5">
    <label
      style={{
        fontSize: "0.825rem",
        fontWeight: 600,
        color: "var(--c-ink)",
        fontFamily: "var(--font-display)",
      }}
    >
      {label}
    </label>

    <div className="relative">
      {icon && (
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
          style={{ color: "var(--c-ink-light)", zIndex: 2 }}
        >
          {icon}
        </span>
      )}

      {children}
      {right}
    </div>
  </div>
);

export default LoginPage;