// ─────────────────────────────────────────────────────────────────────────────
// BREVO HTTP API SENDER
// Render's free-tier web services block outbound traffic on SMTP ports
// (25, 465, 587) as of Sep 2025, so nodemailer's SMTP transport can never
// connect there. Brevo's transactional email API sends over plain HTTPS
// instead, which isn't affected by that restriction.
//
// Needs BREVO_API_KEY in env — this is DIFFERENT from SMTP_PASS. Generate it
// in Brevo under Settings → SMTP & API → API Keys tab (not the SMTP tab).
// ─────────────────────────────────────────────────────────────────────────────
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async ({ to, subject, html }) => {
    const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { name: "CampusMarket", email: process.env.SMTP_FROM },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Brevo email send failed (${res.status}): ${body}`);
    }

    return res.json();
};

// Small delay helper — used between back-to-back emails (e.g. buyer + seller)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "long", year: "numeric",
    });

const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
        weekday: "short", day: "numeric", month: "long",
        year: "numeric", hour: "2-digit", minute: "2-digit",
    });

const daysBetween = (start, end) =>
    Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

// ─────────────────────────────────────────────────────────────────────────────
// BASE HTML TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f6f8; font-family:'Segoe UI',Arial,sans-serif; color:#333; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#2563EB,#6C63FF); padding:32px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:22px; font-weight:800; letter-spacing:-0.5px; }
    .header p  { margin:6px 0 0; color:rgba(255,255,255,0.8); font-size:13px; }
    .body { padding:32px 36px; }
    .body h2 { font-size:20px; color:#0D0D0F; margin-top:0; font-weight:800; }
    .body p  { font-size:14px; line-height:1.75; color:#555; }
    .info-card { background:#f8fafc; border-left:4px solid #2563EB; border-radius:10px; padding:16px 20px; margin:16px 0; }
    .info-card p { margin:5px 0; font-size:13.5px; color:#444; }
    .info-card.green  { border-left-color:#16A34A; }
    .info-card.amber  { border-left-color:#D97706; }
    .info-card.purple { border-left-color:#7C3AED; }
    .info-card.red    { border-left-color:#DC2626; }
    .section-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
    .otp-box { margin:24px auto; text-align:center; background:#EFF6FF; border:2px dashed #2563EB; border-radius:12px; padding:24px; width:fit-content; min-width:180px; }
    .otp-code { font-size:40px; font-weight:800; letter-spacing:10px; color:#2563EB; }
    .otp-note { font-size:13px; color:#888; margin-top:8px; }

    /* Rental timeline */
    .timeline { margin:20px 0; }
    .timeline-row { display:flex; align-items:stretch; gap:0; }
    .timeline-dot { display:flex; flex-direction:column; align-items:center; width:36px; shrink:0; }
    .dot { width:14px; height:14px; border-radius:50%; background:#2563EB; border:2px solid #fff; box-shadow:0 0 0 2px #2563EB; margin-top:4px; }
    .dot.green { background:#16A34A; box-shadow:0 0 0 2px #16A34A; }
    .line { width:2px; flex:1; background:#BFDBFE; margin:4px 0; }
    .timeline-content { flex:1; padding:4px 0 16px 12px; }
    .timeline-content h4 { margin:0 0 2px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#6B7280; }
    .timeline-content p { margin:0; font-size:14px; font-weight:600; color:#0D0D0F; }
    .timeline-content small { font-size:12px; color:#9CA3AF; }

    .price-summary { background:linear-gradient(135deg,#EFF6FF,#F0FDF4); border-radius:12px; padding:20px; margin:16px 0; text-align:center; }
    .price-summary .total { font-size:28px; font-weight:800; color:#2563EB; }
    .price-summary .breakdown { font-size:13px; color:#6B7280; margin-top:4px; }

    .footer { background:#f8fafc; padding:20px 36px; text-align:center; font-size:12px; color:#aaa; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 CampusMarket</h1>
      <p>Your campus, your community</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Campus Marketplace &mdash; Do not reply to this email.<br/>
      If you did not request this, you can safely ignore it.
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// RENTAL TIMELINE BLOCK
// Reusable HTML block — injected into order emails when orderType === "rental"
// ─────────────────────────────────────────────────────────────────────────────
const rentalTimelineBlock = (order, product) => {
    if (order.orderType !== "rental" || !order.rentalStartDate) return "";

    const days = daysBetween(order.rentalStartDate, order.rentalEndDate);
    const pricePerDay = product.rentalPricePerDay || (order.totalAmount / days);

    return `
    <div class="info-card amber">
        <p class="section-label" style="color:#D97706;">🗓️ Rental Timeline</p>
        <div class="timeline">
            <div class="timeline-row">
                <div class="timeline-dot">
                    <div class="dot"></div>
                    <div class="line"></div>
                </div>
                <div class="timeline-content">
                    <h4>Pickup / Start</h4>
                    <p>${formatDate(order.rentalStartDate)}</p>
                    <small>Collect from seller on this date</small>
                </div>
            </div>
            <div class="timeline-row">
                <div class="timeline-dot">
                    <div class="dot green"></div>
                </div>
                <div class="timeline-content">
                    <h4>Return / End</h4>
                    <p>${formatDate(order.rentalEndDate)}</p>
                    <small>Return to seller by this date</small>
                </div>
            </div>
        </div>
        <div class="price-summary">
            <div class="total">₹${order.totalAmount.toLocaleString("en-IN")}</div>
            <div class="breakdown">
                ${days} day${days > 1 ? "s" : ""} × ₹${pricePerDay.toLocaleString("en-IN")}/day
            </div>
        </div>
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND VERIFICATION OTP
// ─────────────────────────────────────────────────────────────────────────────
const sendVerificationOTP = async ({ to, name, otp }) => {
    const html = baseTemplate(`
        <h2>Welcome, ${name}! 👋</h2>
        <p>Thanks for joining CampusMarket. Enter the code below to verify your email and activate your account:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-note">⏳ Expires in <strong>10 minutes</strong></div>
        </div>
        <p style="font-size:13px; color:#9CA3AF;">If you didn't create an account, you can safely ignore this email.</p>
    `);

    await sendEmail({
        to, subject: "🔐 Verify your email — CampusMarket", html,
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND WELCOME EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, name }) => {
    const html = baseTemplate(`
        <h2>You're all set, ${name}! 🎉</h2>
        <p>Your email has been verified. Your CampusMarket account is now active.</p>
        <p>You can now browse listings, post your own items for sale or rent, and connect with fellow students on campus.</p>
    `);

    await sendEmail({
        to, subject: "🎓 Welcome to CampusMarket!", html,
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND PASSWORD RESET OTP
// ─────────────────────────────────────────────────────────────────────────────
const sendPasswordResetOTP = async ({ to, name, otp }) => {
    const html = baseTemplate(`
        <h2>Reset your password 🔑</h2>
        <p>Hi <strong>${name}</strong>, we received a request to reset your password. Use the code below:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-note">⏳ Expires in <strong>10 minutes</strong></div>
        </div>
        <p style="font-size:13px; color:#9CA3AF;">If you didn't request this, ignore this email. Your password won't change.</p>
    `);

    await sendEmail({
        to, subject: "🔑 Password reset OTP — CampusMarket", html,
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND ORDER CONFIRMATION
// Handles all 4 roles: buyer | seller | buyer-confirmed | seller-confirmed
// Automatically includes rental timeline when orderType === "rental"
// ─────────────────────────────────────────────────────────────────────────────
const sendOrderConfirmation = async ({
    to,
    recipientName,
    role,
    product,
    order,
    contactInfo,    // { name, phone, email }
    meetup,         // { location, time }
    extraMessage,   // buyer's note — shown to seller on new request
}) => {
    const isRental = order.orderType === "rental";

    // ── Build role-specific heading and subtext ────────────────────────────
    let heading, subtext, contactCard = "", meetupCard = "";

    if (role === "buyer") {
        heading = isRental ? "Rental Request Sent! 📅" : "Buy Request Sent! 🛒";
        subtext = `Your request for <strong>${product.title}</strong> has been sent to the seller. They will review and respond shortly.`;

    } else if (role === "seller") {
        heading = isRental ? "New Rental Request! 📅" : "New Buy Request! 📬";
        subtext = `A student wants to ${isRental ? "rent" : "buy"} your listing <strong>${product.title}</strong>. Review and accept or decline from your dashboard.`;

        if (contactInfo) {
            contactCard = `
            <div class="info-card green">
                <p class="section-label" style="color:#16A34A;">👤 Buyer's Contact</p>
                <p><strong>Name:</strong> ${contactInfo.name}</p>
                <p><strong>Phone:</strong> ${contactInfo.phone || "Not provided"}</p>
                <p><strong>Email:</strong> ${contactInfo.email || "Not provided"}</p>
            </div>`;
        }
        if (extraMessage) {
            contactCard += `
            <div class="info-card amber">
                <p class="section-label" style="color:#D97706;">💬 Buyer's Note</p>
                <p style="font-style:italic;">"${extraMessage}"</p>
            </div>`;
        }

    } else if (role === "buyer-confirmed") {
        heading = isRental ? "Rental Accepted! ✅" : "Request Accepted! ✅";
        subtext = `The seller has accepted your ${isRental ? "rental request" : "request"} for <strong>${product.title}</strong>. Here are their contact details and meetup info:`;

        if (contactInfo) {
            contactCard = `
            <div class="info-card green">
                <p class="section-label" style="color:#16A34A;">📞 Seller's Contact</p>
                <p><strong>Name:</strong> ${contactInfo.name}</p>
                <p><strong>Phone:</strong> ${contactInfo.phone || "Not provided"}</p>
                <p><strong>Email:</strong> ${contactInfo.email || "Not provided"}</p>
            </div>`;
        }

    } else if (role === "seller-confirmed") {
        heading = isRental ? "You Accepted the Rental 🤝" : "You Accepted the Request 🤝";
        subtext = `You accepted the ${isRental ? "rental request" : "buy request"} for <strong>${product.title}</strong>. Here are the buyer's contact details:`;

        if (contactInfo) {
            contactCard = `
            <div class="info-card" style="border-left-color:#2563EB;">
                <p class="section-label" style="color:#2563EB;">📞 Buyer's Contact</p>
                <p><strong>Name:</strong> ${contactInfo.name}</p>
                <p><strong>Phone:</strong> ${contactInfo.phone || "Not provided"}</p>
                <p><strong>Email:</strong> ${contactInfo.email || "Not provided"}</p>
            </div>`;
        }
    }

    // ── Meetup card (shown after acceptance) ──────────────────────────────
    if (meetup?.location) {
        meetupCard = `
        <div class="info-card purple">
            <p class="section-label" style="color:#7C3AED;">📍 Meetup Details</p>
            <p><strong>Location:</strong> ${meetup.location}</p>
            <p><strong>Time:</strong> ${formatDateTime(meetup.time)}</p>
            ${isRental ? `<p style="font-size:12px; color:#9CA3AF; margin-top:8px;">
                Remember: collect the item at this meetup and return it by <strong>${formatDate(order.rentalEndDate)}</strong>.
            </p>` : ""}
        </div>`;
    }

    // ── Core order info card ──────────────────────────────────────────────
    const orderCard = `
    <div class="info-card">
        <p class="section-label" style="color:#2563EB;">📦 ${isRental ? "Rental" : "Order"} Details</p>
        <p><strong>Item:</strong> ${product.title}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Type:</strong> ${isRental ? "Rental" : "Purchase"}</p>
        <p><strong>Amount:</strong> ₹${order.totalAmount?.toLocaleString("en-IN")}</p>
        <p><strong>Order ID:</strong> <code style="font-size:12px; background:#f0f4ff; padding:2px 6px; border-radius:4px;">${order._id}</code></p>
        <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
    </div>`;

    // ── Rental timeline (only for rentals) ───────────────────────────────
    const timeline = rentalTimelineBlock(order, product);

    const html = baseTemplate(`
        <h2>${heading}</h2>
        <p>Hi <strong>${recipientName}</strong>, ${subtext}</p>
        ${orderCard}
        ${timeline}
        ${contactCard}
        ${meetupCard}
        <p style="margin-top:20px; font-size:13px; color:#9CA3AF;">
            View and manage this ${isRental ? "rental" : "order"} from your dashboard.
        </p>
    `);

    // Subject line
    const subjects = {
        "buyer":            isRental ? `📅 Rental request sent — ${product.title}` : `🛒 Request sent — ${product.title}`,
        "seller":           isRental ? `📅 New rental request — ${product.title}` : `📬 New buy request — ${product.title}`,
        "buyer-confirmed":  isRental ? `✅ Rental accepted — ${product.title}` : `✅ Request accepted — ${product.title}`,
        "seller-confirmed": isRental ? `🤝 You accepted the rental — ${product.title}` : `🤝 You accepted — ${product.title}`,
    };

    await sendEmail({
        to,
        subject: subjects[role] || `Order update — ${product.title}`,
        html,
    });
};

export {
    sendVerificationOTP,
    sendWelcomeEmail,
    sendPasswordResetOTP,
    sendOrderConfirmation,
    delay,
};