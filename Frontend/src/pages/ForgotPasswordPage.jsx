import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { authAPI } from "../services/api";
import { Field } from "./LoginPage";
import { Alert } from "./SignupPage";

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD PAGE
// Step 1: Enter email → backend sends OTP
// Step 2: Enter OTP + new password → reset done
// ─────────────────────────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
    const [step, setStep] = useState("email"); // "email" | "reset"
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await authAPI.forgotPassword({ email });
            setSuccess("If an account exists with this email, an OTP has been sent.");
            setStep("reset");
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            // Still move to reset step — backend always returns 200 for security
            setStep("reset");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
        setLoading(true);
        setError("");
        try {
            await authAPI.resetPassword({ email, otp, newPassword });
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1800);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "var(--c-surface)" }}>
            <div className="w-full max-w-md animate-fade-up">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--c-accent)" }}>
                        <ShoppingBag size={15} className="text-white" />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--c-ink)" }}>
                        CampusMarket
                    </span>
                </Link>

                {step === "email" ? (
                    <>
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--c-ink)" }}>
                            Forgot Password?
                        </h1>
                        <p className="mt-2 mb-8" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                            Enter your email and we'll send a reset code.
                        </p>

                        {error && <Alert type="error" msg={error} />}

                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <Field label="Email address" icon={<Mail size={16} />}>
                                <input type="email" required placeholder="you@college.edu"
                                    className="input pl-10" value={email}
                                    onChange={e => { setEmail(e.target.value); setError(""); }} />
                            </Field>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2">
                                {loading
                                    ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                    : "Send Reset Code"}
                            </button>
                        </form>

                        <p className="mt-6 text-center" style={{ fontSize: "0.85rem", color: "var(--c-ink-light)" }}>
                            Remember your password?{" "}
                            <Link to="/login" style={{ color: "var(--c-accent)", fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                            style={{ background: "var(--c-accent-light)" }}>
                            <KeyRound size={24} style={{ color: "var(--c-accent)" }} />
                        </div>

                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--c-ink)" }}>
                            Reset Password
                        </h1>
                        <p className="mt-2 mb-8" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                            Enter the code sent to <strong style={{ color: "var(--c-ink)" }}>{email}</strong>
                        </p>

                        {error && <Alert type="error" msg={error} />}
                        {success && <Alert type="success" msg={success} />}

                        <form onSubmit={handleReset} className="space-y-5">
                            <Field label="OTP Code" icon={<KeyRound size={16} />}>
                                <input type="text" maxLength={6} placeholder="6-digit code"
                                    className="input pl-10 tracking-widest font-bold text-center text-lg"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
                            </Field>

                            <Field label="New Password" icon={<Lock size={16} />}
                                right={
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--c-ink-light)" }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }>
                                <input type={showPass ? "text" : "password"}
                                    required placeholder="Min. 6 characters"
                                    className="input pl-10 pr-10" value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setError(""); }} />
                            </Field>

                            <button type="submit"
                                disabled={loading || otp.length !== 6 || !newPassword}
                                className="btn-primary w-full flex items-center justify-center gap-2">
                                {loading
                                    ? <><Loader2 size={16} className="animate-spin" /> Resetting...</>
                                    : "Reset Password"}
                            </button>
                        </form>

                        <button onClick={() => { setStep("email"); setError(""); setSuccess(""); }}
                            className="mt-6 w-full text-center text-sm"
                            style={{ color: "var(--c-ink-light)" }}>
                            ← Use a different email
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;