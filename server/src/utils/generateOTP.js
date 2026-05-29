// src/utils/generateOTP.js

import crypto from "crypto";

// crypto is a built-in Node.js module — no install needed
// We use it instead of Math.random() because Math.random() is NOT
// cryptographically secure — a smart attacker could predict it

const generateOTP = () => {
    // randomInt(min, max) — max is exclusive
    // so 100000 to 999999 — always exactly 6 digits, never starts with 0
    const otp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires 10 minutes from now
    // Date.now() returns milliseconds, so 10 * 60 * 1000 = 600,000ms = 10 mins
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    return { otp, otpExpiry };
};

export { generateOTP };