import nodemailer from "nodemailer";


// TRANSPORTER
// Created fresh per call so env vars are always current (useful in tests)
// Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in your .env
// For development: use Mailtrap (mailtrap.io) — it catches emails without sending them
// For production: use Gmail, SendGrid, Resend, etc.

const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });


// BASE HTML TEMPLATE
// Wraps all email bodies in a consistent branded layout

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f6f8; font-family:'Segoe UI',Arial,sans-serif; color:#333; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#6C63FF,#4A90E2); padding:32px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:24px; }
    .header p  { margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px; }
    .body { padding:36px 40px; }
    .body h2 { font-size:20px; color:#2d2d2d; }
    .body p  { font-size:15px; line-height:1.7; color:#555; }
    .otp-box { margin:28px auto; text-align:center; background:#f0f4ff; border:2px dashed #6C63FF; border-radius:12px; padding:24px; width:fit-content; min-width:180px; }
    .otp-code { font-size:40px; font-weight:700; letter-spacing:10px; color:#6C63FF; }
    .otp-note { font-size:13px; color:#888; margin-top:8px; }
    .info-card { background:#f8fafc; border-left:4px solid #6C63FF; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .info-card p { margin:6px 0; font-size:14px; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#aaa; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 Campus Marketplace</h1>
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


// sendVerificationOTP
// Called from registerUser and resendVerificationOTP controllers

const sendVerificationOTP = async ({ to, name, otp }) => {
    const transporter = createTransporter();

    const html = baseTemplate(`
        <h2>Welcome, ${name}! Please verify your email</h2>
        <p>Thanks for signing up. Enter the OTP below to activate your account:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-note">⏳ Expires in <strong>10 minutes</strong></div>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
    `);

    await transporter.sendMail({
        from: `"Campus Marketplace" <${process.env.SMTP_FROM}>`,
        to,
        subject: "🔐 Verify your email — Campus Marketplace",
        html,
    });
};


// sendWelcomeEmail
// Called from verifyOTP after successful verification

const sendWelcomeEmail = async ({ to, name }) => {
    const transporter = createTransporter();

    const html = baseTemplate(`
        <h2>You're all set, ${name}! 🎉</h2>
        <p>Your email has been verified and your Campus Marketplace account is now active.</p>
        <p>You can now browse listings, list your own items, and connect with buyers and sellers on campus.</p>
    `);

    await transporter.sendMail({
        from: `"Campus Marketplace" <${process.env.SMTP_FROM}>`,
        to,
        subject: "🎓 Welcome to Campus Marketplace!",
        html,
    });
};

// sendPasswordResetOTP
// Called from forgotPassword controller
const sendPasswordResetOTP = async ({ to, name, otp }) => {
    const transporter = createTransporter();

    const html = baseTemplate(`
        <h2>Reset your password 🔑</h2>
        <p>Hi <strong>${name}</strong>, we received a request to reset your password.</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-note">⏳ Expires in <strong>10 minutes</strong></div>
        </div>
        <p>If you didn't request this, ignore this email. Your password won't change.</p>
    `);

    await transporter.sendMail({
        from: `"Campus Marketplace" <${process.env.SMTP_FROM}>`,
        to,
        subject: "🔑 Password reset OTP — Campus Marketplace",
        html,
    });
};

// sendOrderConfirmation
// Called after a successful purchase/rental — notifies both buyer and seller
const sendOrderConfirmation = async ({ to, recipientName, role, product, order }) => {
    const transporter = createTransporter();

    // Different message depending on whether the recipient is the buyer or seller
    const roleMessage =
        role === "buyer"
            ? "Your order has been placed successfully."
            : "Someone just purchased your listing!";

    const html = baseTemplate(`
        <h2>${roleMessage}</h2>
        <p>Hi <strong>${recipientName}</strong>, here are the order details:</p>
        <div class="info-card">
            <p><strong>Product:</strong> ${product.productName}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Order type:</strong> ${order.orderType}</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        </div>
        <p>You can view full details in your dashboard.</p>
    `);

    await transporter.sendMail({
        from: `"Campus Marketplace" <${process.env.SMTP_FROM}>`,
        to,
        subject: `✅ Order ${role === "buyer" ? "confirmed" : "received"} — ${product.productName}`,
        html,
    });
};

export {
    sendVerificationOTP,
    sendWelcomeEmail,
    sendPasswordResetOTP,
    sendOrderConfirmation,
};