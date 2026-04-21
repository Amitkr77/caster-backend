// routes/contactRoute.js
import express from "express";
import contactEmailTemplate from "../templates/castor.contact.js";

const router = express.Router();

// Allowed interests
const allowedInterests = [
    "Industrial Castors",
    "Medical Castors",
    "Furniture Castors",
    "Special Solutions",
    "Other Inquiry",
];

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Get fresh access token using refresh token
async function getZohoAccessToken() {
    const res = await fetch("https://accounts.zoho.in/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: process.env.CASTOR_GLOBALS_ZOHO_REFRESH_TOKEN,
            client_id: process.env.CASTOR_GLOBALS_ZOHO_CLIENT_ID,
            client_secret: process.env.CASTOR_GLOBALS_ZOHO_CLIENT_SECRET,
            grant_type: "refresh_token",
        }),
    });

    const data = await res.json();
    if (!data.access_token) throw new Error("Failed to get Zoho access token");
    return data.access_token;
}

// Send email via Zoho Mail API
async function sendZohoEmail({ fromName, fromEmail, toEmail, subject, htmlContent }) {
    const accessToken = await getZohoAccessToken();
    const accountId = process.env.CASTOR_GLOBALS_ZOHO_ACCOUNT_ID;

    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fromAddress: `${fromName} <${fromEmail}>`,
            toAddress: toEmail,
            subject: subject,
            content: htmlContent,
            mailFormat: "html",
        }),
    });

    const result = await res.json();
    if (result.status.code !== 200) {
        throw new Error(result.status.description || "Zoho API error");
    }

    return result;
}

router.post("/", async (req, res) => {
    const { name, email, company, interest, message } = req.body;

    if (!name || !email || !interest || !message) {
        return res.status(400).json({ error: "Name, Email, Interest, and Message are required." });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    if (!allowedInterests.includes(interest)) {
        return res.status(400).json({ error: "Invalid interest selected." });
    }

    const htmlContent = contactEmailTemplate({ name, email, company, interest, message });

    try {
        await sendZohoEmail({
            fromName: "Castor Globals",
            fromEmail: process.env.CASTOR_GLOBALS_EMAIL_USER,
            toEmail: process.env.CASTOR_GLOBALS_EMAIL_TO,
            subject: `New Inquiry from ${name} - ${interest}`,
            htmlContent,
        });

        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.error("Zoho Mail API error:", err.message);
        res.status(500).json({ error: "Failed to send email.", details: err.message });
    }
});

export { router as castorGlobalsContactRoute };