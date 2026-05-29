import  { useState } from "react";
import { Sparkles, Loader2, Check, IndianRupee, Wand2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { aiAPI } from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// AI DESCRIPTION GENERATOR
// Shows inside SellItemPage below the description textarea.
// Generates description from title + category + condition.
// User can accept (fills textarea) or regenerate.
// ─────────────────────────────────────────────────────────────────────────────
export const AIDescriptionGenerator = ({ title, category, condition, onAccept }) => {
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState("");
    const [error, setError]       = useState("");
    const [accepted, setAccepted] = useState(false);

    const canGenerate = title && category && condition;

    const generate = async () => {
        if (!canGenerate) return;
        setLoading(true); setResult(""); setError(""); setAccepted(false);
        try {
            const data = await aiAPI.generateDescription({ title, category, condition });
            setResult(data.data.description);
        } catch (err) {
            setError(err.message || "Failed to generate. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        onAccept(result);
        setAccepted(true);
    };

    return (
        <div className="rounded-2xl overflow-hidden border"
            style={{ borderColor: "var(--c-accent-dim)", background: "var(--c-accent-light)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: "var(--c-accent)" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--c-accent)", fontFamily: "var(--font-display)" }}>
                        AI Description
                    </span>
                </div>
                <button onClick={generate} disabled={loading || !canGenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                        fontFamily: "var(--font-display)",
                        background: canGenerate ? "var(--c-accent)" : "var(--c-border)",
                        color: canGenerate ? "white" : "var(--c-ink-light)",
                        cursor: canGenerate ? "pointer" : "not-allowed",
                    }}
                    title={!canGenerate ? "Fill in title, category, and condition first" : ""}>
                    {loading
                        ? <><Loader2 size={11} className="animate-spin" /> Generating...</>
                        : <><Wand2 size={11} /> Generate</>
                    }
                </button>
            </div>

            {/* Result */}
            {result && !accepted && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="p-3 rounded-xl mb-3"
                        style={{ background: "white", border: "1px solid var(--c-accent-dim)", fontSize: "0.82rem", color: "var(--c-ink)", lineHeight: 1.7 }}>
                        {result}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAccept}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ fontFamily: "var(--font-display)", background: "var(--c-green)", color: "white" }}>
                            <Check size={11} /> Use This
                        </button>
                        <button onClick={generate}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ fontFamily: "var(--font-display)", background: "white", color: "var(--c-accent)", border: "1px solid var(--c-accent-dim)" }}>
                            <RotateCcw size={11} /> Regenerate
                        </button>
                    </div>
                </div>
            )}

            {accepted && (
                <div className="px-4 pb-3 flex items-center gap-2 animate-fade-in">
                    <Check size={12} style={{ color: "var(--c-green)" }} />
                    <p style={{ fontSize: "0.75rem", color: "var(--c-green)", fontWeight: 600 }}>Applied to description!</p>
                </div>
            )}

            {error && (
                <p className="px-4 pb-3" style={{ fontSize: "0.75rem", color: "var(--c-red)" }}>{error}</p>
            )}

            {!canGenerate && !result && (
                <p className="px-4 pb-3" style={{ fontSize: "0.72rem", color: "var(--c-accent)", opacity: 0.7 }}>
                    Fill in title, category and condition above to enable AI generation.
                </p>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI PRICE SUGGESTER
// Visual price range bar with dot at suggested price.
// User can accept the suggested price or use as reference.
// ─────────────────────────────────────────────────────────────────────────────
export const AIPriceSuggester = ({ title, category, condition, originalPrice, onAccept }) => {
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState("");
    const [expanded, setExpanded] = useState(false);

    const canSuggest = title && category && condition;

    const suggest = async () => {
        if (!canSuggest) return;
        setLoading(true); setResult(null); setError("");
        try {
            const data = await aiAPI.suggestPrice({ title, category, condition, originalPrice });
            setResult(data.data.suggestion);
            setExpanded(true);
        } catch (err) {
            setError(err.message || "Failed to suggest price. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // Position the dot on the range bar (0% to 100%)
    const dotPercent = result
        ? Math.min(100, Math.max(0,
            ((result.suggestedPrice - result.minPrice) / (result.maxPrice - result.minPrice)) * 100
          ))
        : 50;

    return (
        <div className="rounded-2xl overflow-hidden border"
            style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <IndianRupee size={14} style={{ color: "var(--c-amber)" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--c-amber)", fontFamily: "var(--font-display)" }}>
                        AI Price Suggester
                    </span>
                </div>
                <button
                    onClick={result ? () => setExpanded(!expanded) : suggest}
                    disabled={loading || !canSuggest}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                        fontFamily: "var(--font-display)",
                        background: canSuggest ? "var(--c-amber)" : "var(--c-border)",
                        color: canSuggest ? "white" : "var(--c-ink-light)",
                        cursor: canSuggest ? "pointer" : "not-allowed",
                    }}>
                    {loading
                        ? <><Loader2 size={11} className="animate-spin" /> Analysing...</>
                        : result
                            ? expanded
                                ? <><ChevronUp size={11} /> Hide</>
                                : <><ChevronDown size={11} /> Show</>
                            : <><Sparkles size={11} /> Suggest Price</>
                    }
                </button>
            </div>

            {/* Result */}
            {result && expanded && (
                <div className="px-4 pb-4 animate-fade-in space-y-3">
                    {/* Range bar */}
                    <div>
                        <div className="flex justify-between mb-1.5"
                            style={{ fontSize: "0.72rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                            <span style={{ color: "var(--c-ink-light)" }}>₹{result.minPrice.toLocaleString()}</span>
                            <span style={{ color: "var(--c-amber)" }}>₹{result.suggestedPrice.toLocaleString()} suggested</span>
                            <span style={{ color: "var(--c-ink-light)" }}>₹{result.maxPrice.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2 rounded-full" style={{ background: "#FDE68A" }}>
                            <div className="absolute inset-0 rounded-full"
                                style={{ background: "linear-gradient(90deg, #FDE68A, #F59E0B)" }} />
                            {/* Dot at suggested price */}
                            <div className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
                                style={{
                                    left: `${dotPercent}%`,
                                    transform: "translate(-50%, -50%)",
                                    background: "var(--c-amber)",
                                }} />
                        </div>
                    </div>

                    {/* Reasoning */}
                    <p style={{ fontSize: "0.75rem", color: "#92400E", lineHeight: 1.6, fontStyle: "italic" }}>
                        💡 {result.reasoning}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={() => onAccept(result.suggestedPrice)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ fontFamily: "var(--font-display)", background: "var(--c-amber)", color: "white" }}>
                            <Check size={11} /> Use ₹{result.suggestedPrice.toLocaleString()}
                        </button>
                        <button onClick={suggest}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
                            style={{ fontFamily: "var(--font-display)", borderColor: "#FDE68A", color: "var(--c-amber)", background: "white" }}>
                            Recalculate
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="px-4 pb-3" style={{ fontSize: "0.75rem", color: "var(--c-red)" }}>{error}</p>
            )}

            {!canSuggest && !result && (
                <p className="px-4 pb-3" style={{ fontSize: "0.72rem", color: "var(--c-amber)", opacity: 0.7 }}>
                    Fill in title, category and condition above to enable price suggestion.
                </p>
            )}
        </div>
    );
};