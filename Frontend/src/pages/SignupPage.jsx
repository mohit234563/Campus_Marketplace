import  { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ShoppingBag, Check, X, KeyRound } from "lucide-react";
import { authAPI } from "../services/api";
import { Field } from "./LoginPage";

const SignupPage = () => {
    const [step, setStep] = useState("register"); // "register" | "verify"
    const [form, setForm] = useState({ username: "", fullname: "", email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    // Password strength
    const rules = {
        length: form.password.length >= 6,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
    };
    const strength = Object.values(rules).filter(Boolean).length;

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await authAPI.register(form);
            setStep("verify");
            setCountdown(60); // 60s before resend
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await authAPI.verifyOTP({ email: form.email, otp });
            setSuccess("Email verified! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError("");
        try {
            await authAPI.resendOTP({ email: form.email });
            setCountdown(60);
            setSuccess("New OTP sent to your email.");
        } catch (err) {
            setError(err.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--c-surface)" }}>
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--c-accent)" }}>
                        <ShoppingBag size={15} className="text-white" />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--c-ink)" }}>CampusMarket</span>
                </div>

                {step === "register" ? (
                    <div className="animate-fade-up">
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--c-ink)" }}>
                            Create Account
                        </h1>
                        <p className="mt-2 mb-8" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "var(--c-accent)", fontWeight: 600 }}>Sign in</Link>
                        </p>

                        {error && <Alert type="error" msg={error} />}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Username" icon={<User size={16} />}>
                                    <input name="username" required placeholder="johndoe"
                                        className="input pl-10" value={form.username} onChange={handleChange} />
                                </Field>
                                <Field label="Full Name" icon={<User size={16} />}>
                                    <input name="fullname" placeholder="John Doe"
                                        className="input pl-10" value={form.fullname} onChange={handleChange} />
                                </Field>
                            </div>

                            <Field label="Email address" icon={<Mail size={16} />}>
                                <input name="email" type="email" required placeholder="you@college.edu"
                                    className="input pl-10" value={form.email} onChange={handleChange} />
                            </Field>

                            <Field label="Password" icon={<Lock size={16} />}
                                right={
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--c-ink-light)" }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }>
                                <input name="password" type={showPass ? "text" : "password"}
                                    required placeholder="Min. 6 characters"
                                    className="input pl-10 pr-10" value={form.password} onChange={handleChange} />
                            </Field>

                            {/* Password strength */}
                            {form.password && (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? (strength === 1 ? "var(--c-red)" : strength === 2 ? "var(--c-amber)" : "var(--c-green)") : "var(--c-border)" }} />
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        {Object.entries({ "6+ chars": rules.length, "Uppercase": rules.upper, "Number": rules.number }).map(([label, met]) => (
                                            <div key={label} className="flex items-center gap-1">
                                                {met ? <Check size={12} style={{ color: "var(--c-green)" }} /> : <X size={12} style={{ color: "var(--c-border)" }} />}
                                                <span style={{ fontSize: "0.7rem", color: met ? "var(--c-green)" : "var(--c-ink-light)" }}>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={loading || strength < 2}
                                className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* ── OTP Verification Step ── */
                    <div className="animate-fade-up text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{ background: "var(--c-accent-light)" }}>
                            <KeyRound size={28} style={{ color: "var(--c-accent)" }} />
                        </div>
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--c-ink)" }}>
                            Check your inbox
                        </h1>
                        <p className="mt-3 mb-8" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                            We sent a 6-digit code to <strong style={{ color: "var(--c-ink)" }}>{form.email}</strong>
                        </p>

                        {error && <Alert type="error" msg={error} />}
                        {success && <Alert type="success" msg={success} />}

                        <form onSubmit={handleVerify} className="space-y-4 text-left">
                            <Field label="Verification Code" icon={<KeyRound size={16} />}>
                                <input type="text" maxLength={6} placeholder="000000"
                                    className="input pl-10 text-center text-xl font-bold tracking-widest"
                                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                            </Field>

                            <button type="submit" disabled={loading || otp.length !== 6}
                                className="btn-primary w-full flex items-center justify-center gap-2">
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : "Verify Email"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            {countdown > 0 ? (
                                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-light)" }}>
                                    Resend in <strong style={{ color: "var(--c-ink)" }}>{countdown}s</strong>
                                </p>
                            ) : (
                                <button onClick={handleResend} disabled={resendLoading}
                                    style={{ fontSize: "0.85rem", color: "var(--c-accent)", fontWeight: 600 }}>
                                    {resendLoading ? "Sending..." : "Resend code"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Alert = ({ type, msg }) => (
    <div className="mb-5 p-4 rounded-xl text-sm animate-fade-in"
        style={{
            background: type === "error" ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${type === "error" ? "#FEE2E2" : "#BBF7D0"}`,
            color: type === "error" ? "var(--c-red)" : "var(--c-green)"
        }}>
        {msg}
    </div>
);

export default SignupPage;