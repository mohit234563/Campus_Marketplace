import  { useState, useRef, useEffect } from "react";
import { aiAPI } from "../services/api";
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw, User } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// AI CHAT WIDGET
// Floating button bottom-right. Opens a chat panel.
// productContext — pass when on a product page so AI has context.
// ─────────────────────────────────────────────────────────────────────────────
const AIChatWidget = ({ productContext = null }) => {
    const [open, setOpen]         = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input when opened
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: "user", content: text };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const data = await aiAPI.chat({ messages: updated, productContext });
            setMessages(prev => [...prev, { role: "assistant", content: data.data.reply }]);
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Context-aware starter prompts
    const starters = productContext
        ? ["Is this a good deal?", "What should I check before buying?", "How do I request this item?"]
        : ["How does buying work?", "Is it safe to meet sellers?", "How do I list an item to sell?"];

    return (
        <>
            {/* ── Floating Button ── */}
            <button onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200"
                style={{ background: open ? "var(--c-ink)" : "var(--c-accent)" }}
                aria-label="AI Assistant">
                {open ? <X size={20} className="text-white" /> : <MessageCircle size={20} className="text-white" />}
                {/* Pulse ring when closed */}
                {!open && (
                    <span className="absolute w-full h-full rounded-2xl animate-ping opacity-20"
                        style={{ background: "var(--c-accent)" }} />
                )}
            </button>

            {/* ── Chat Panel ── */}
            {open && (
                <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:bottom-24 sm:right-6 sm:w-[360px] z-50 flex flex-col rounded-3xl overflow-hidden animate-fade-up"
                    style={{
                        maxWidth: 360,
                        height: "min(520px, 70vh)",
                        marginLeft: "auto",
                        background: "var(--c-white)",
                        border: "1px solid var(--c-border)",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
                    }}>

                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between shrink-0"
                        style={{ background: "var(--c-ink)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.1)" }}>
                                <Sparkles size={15} className="text-white" />
                            </div>
                            <div>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", color: "white" }}>
                                    Campus Assistant
                                </p>
                                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)" }}>
                                    Powered by Claude AI
                                </p>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button onClick={() => { setMessages([]); setError(""); }}
                                className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                                title="Clear chat">
                                <RotateCcw size={13} className="text-white/50" />
                            </button>
                        )}
                    </div>

                    {/* Product context pill */}
                    {productContext && (
                        <div className="px-4 py-2 shrink-0 flex items-center gap-2"
                            style={{ background: "var(--c-accent-light)", borderBottom: "1px solid var(--c-accent-dim)" }}>
                            <span style={{ fontSize: "0.68rem", color: "var(--c-accent)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                                📦
                            </span>
                            <span className="truncate" style={{ fontSize: "0.72rem", color: "var(--c-accent)" }}>
                                Asking about: {productContext.title}
                            </span>
                        </div>
                    )}

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.length === 0 ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: "var(--c-accent-light)" }}>
                                    <Sparkles size={22} style={{ color: "var(--c-accent)" }} />
                                </div>
                                <div>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)", fontSize: "0.9rem" }}>
                                        Hi! I'm your campus assistant
                                    </p>
                                    <p style={{ fontSize: "0.76rem", color: "var(--c-ink-light)", marginTop: 4, lineHeight: 1.5 }}>
                                        Ask me anything about {productContext ? "this product" : "the marketplace"}.
                                    </p>
                                </div>
                                {/* Starter prompts */}
                                <div className="flex flex-col gap-2 w-full">
                                    {starters.map(s => (
                                        <button key={s}
                                            onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                            className="text-left px-4 py-2.5 rounded-xl border text-sm transition-all hover:border-blue-300 hover:bg-blue-50"
                                            style={{ borderColor: "var(--c-border)", color: "var(--c-ink-light)", fontSize: "0.78rem", fontFamily: "var(--font-display)", fontWeight: 500 }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
                                {loading && <TypingIndicator />}
                                {error && (
                                    <div className="text-center space-y-1">
                                        <p style={{ fontSize: "0.73rem", color: "var(--c-red)" }}>{error}</p>
                                        <button onClick={() => setError("")}
                                            style={{ fontSize: "0.7rem", color: "var(--c-accent)", fontWeight: 600 }}>
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 shrink-0 flex items-end gap-2"
                        style={{ borderTop: "1px solid var(--c-border)" }}>
                        <textarea ref={inputRef} rows={1}
                            placeholder="Ask anything..."
                            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                            style={{
                                border: "1.5px solid var(--c-border)",
                                fontFamily: "var(--font-body)",
                                color: "var(--c-ink)",
                                fontSize: "0.84rem",
                                maxHeight: "96px",
                                lineHeight: 1.5,
                            }}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            onFocus={e  => { e.target.style.borderColor = "var(--c-accent)"; }}
                            onBlur={e   => { e.target.style.borderColor = "var(--c-border)"; }}
                        />
                        <button onClick={sendMessage} disabled={!input.trim() || loading}
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                            style={{ background: input.trim() && !loading ? "var(--c-accent)" : "var(--c-border)" }}>
                            {loading
                                ? <Loader2 size={15} className="animate-spin text-white" />
                                : <Send size={14} className="text-white" />
                            }
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// ── Chat bubble ───────────────────────────────────────────────────────────────
const ChatBubble = ({ message }) => {
    const isUser = message.role === "user";
    return (
        <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: isUser ? "var(--c-accent)" : "var(--c-surface)" }}>
                {isUser
                    ? <User size={12} className="text-white" />
                    : <Sparkles size={12} style={{ color: "var(--c-accent)" }} />
                }
            </div>
            <div className="px-3.5 py-2.5 max-w-[78%]"
                style={{
                    background: isUser ? "var(--c-accent)" : "var(--c-surface)",
                    borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    color: isUser ? "white" : "var(--c-ink)",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                }}>
                {message.content}
            </div>
        </div>
    );
};

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="flex gap-2 items-center">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "var(--c-surface)" }}>
            <Sparkles size={12} style={{ color: "var(--c-accent)" }} />
        </div>
        <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
            style={{ background: "var(--c-surface)", borderRadius: "4px 14px 14px 14px" }}>
            {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "var(--c-ink-light)", animationDelay: `${i * 150}ms`, animationDuration: "1s" }} />
            ))}
        </div>
    </div>
);

export default AIChatWidget;