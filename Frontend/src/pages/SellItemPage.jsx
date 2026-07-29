import  { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Loader2, Tag, Info, IndianRupee } from "lucide-react";
import { productAPI } from "../services/api";
import { Field } from "./LoginPage";
import { AIDescriptionGenerator, AIPriceSuggester } from "../components/AITools";

const CATEGORIES = ["books", "electronics", "furniture", "clothing", "stationery", "sports", "other"];
const CONDITIONS = ["new", "like-new", "good", "fair", "poor"];

const SellItemPage = () => {
    const navigate = useNavigate();
    const fileRef = useRef();

    const [form, setForm] = useState({
        title: "", category: "", description: "",
        price: "", condition: "good", listingType: "sell", rentalPricePerDay: ""
    });
    const [images, setImages] = useState([]);     // File objects
    const [previews, setPreviews] = useState([]); // Preview URLs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 5 - images.length;
        const toAdd = files.slice(0, remaining);
        setImages(prev => [...prev, ...toAdd]);
        setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (i) => {
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) return setError("At least one image is required.");
        setLoading(true);
        setError("");

        try {
            // Use FormData to send files + text together
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
            images.forEach(img => fd.append("images", img));

            await productAPI.create(fd);
            navigate("/home");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: "var(--c-surface)" }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 text-sm font-medium transition-all"
                    style={{ color: "var(--c-ink-light)", fontFamily: "var(--font-display)" }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="mb-8">
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--c-ink)" }}>
                        List Your Item
                    </h1>
                    <p className="mt-2" style={{ color: "var(--c-ink-light)", fontSize: "0.9rem" }}>
                        Fill in the details. Buyers on your campus will see this listing.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", color: "var(--c-red)" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-6">

                    {/* Title */}
                    <Field label="Item Title *" icon={<Tag size={15} />}>
                        <input name="title" required placeholder="e.g., Engineering Mathematics by RD Sharma"
                            className="input pl-10" value={form.title} onChange={handleChange} />
                    </Field>

                    {/* Category + Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-display)" }}>
                                Category *
                            </label>
                            <select name="category" required className="input" value={form.category} onChange={handleChange}>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-display)" }}>
                                Condition *
                            </label>
                            <select name="condition" className="input" value={form.condition} onChange={handleChange}>
                                {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Listing type */}
                    <div className="space-y-2">
                        <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-display)" }}>
                            Listing Type
                        </label>
                        <div className="flex gap-3">
                            {["sell", "rent"].map(type => (
                                <button key={type} type="button"
                                    onClick={() => setForm({ ...form, listingType: type })}
                                    className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        background: form.listingType === type ? "var(--c-accent)" : "var(--c-white)",
                                        color: form.listingType === type ? "white" : "var(--c-ink-light)",
                                        borderColor: form.listingType === type ? "var(--c-accent)" : "var(--c-border)",
                                    }}>
                                    {type === "sell" ? "Sell (One-time)" : "Rent (Per day)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label={form.listingType === "rent" ? "Security Deposit (₹)" : "Price (₹) *"}
                            icon={<IndianRupee size={15} />}>
                            <input name="price" type="number" min="0" required
                                placeholder="0" className="input pl-10" value={form.price} onChange={handleChange} />
                        </Field>
                        {form.listingType === "rent" && (
                            <Field label="Rent per day (₹) *" icon={<IndianRupee size={15} />}>
                                <input name="rentalPricePerDay" type="number" min="0" required
                                    placeholder="0" className="input pl-10" value={form.rentalPricePerDay} onChange={handleChange} />
                            </Field>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-display)" }}>
                            Description
                        </label>
                        <textarea name="description" rows={4}
                            placeholder="Describe the condition, any defects, edition, original price..."
                            className="input resize-none" value={form.description} onChange={handleChange} />
                    </div>


                    {/* AI Tools */}
                    <div className="space-y-3">
                        <AIDescriptionGenerator
                            title={form.title}
                            category={form.category}
                            condition={form.condition}
                            onAccept={(desc) => setForm(f => ({ ...f, description: desc }))}
                        />
                        <AIPriceSuggester
                            title={form.title}
                            category={form.category}
                            condition={form.condition}
                            originalPrice={form.price}
                            onAccept={(price) => setForm(f => ({ ...f, price: price.toString() }))}
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-display)" }}>
                                Photos *
                            </label>
                            <span className="badge badge-gray">{images.length}/5</span>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            {previews.map((src, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border"
                                    style={{ borderColor: "var(--c-border)" }}>
                                    <img src={src} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{ background: "var(--c-red)" }}>
                                        <X size={10} className="text-white" />
                                    </button>
                                </div>
                            ))}

                            {images.length < 5 && (
                                <button type="button" onClick={() => fileRef.current.click()}
                                    className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all hover:border-blue-400"
                                    style={{ borderColor: "var(--c-border)" }}>
                                    <Upload size={18} style={{ color: "var(--c-ink-light)" }} />
                                    <span style={{ fontSize: "0.65rem", color: "var(--c-ink-light)", fontWeight: 600 }}>Upload</span>
                                    <input type="file" hidden multiple accept="image/*" ref={fileRef} onChange={handleImages} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "var(--c-accent-light)" }}>
                            <Info size={14} style={{ color: "var(--c-accent)", marginTop: 1, shrink: 0 }} />
                            <p style={{ fontSize: "0.78rem", color: "var(--c-accent)", lineHeight: 1.5 }}>
                                Upload clear photos from multiple angles. Good photos get more buyers.
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-2 flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : "List Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellItemPage;