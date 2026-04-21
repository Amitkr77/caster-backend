import express from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import contactEmailTemplate from "../templates/aiexpert.contact.js";

const router = express.Router();

/* ---------------------- RATE LIMITING ---------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 50,
  message: { error: "Too many requests. Please try again later." },
});

router.use(limiter);

/* ---------------------- VALIDATION ---------------------- */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const isValidPhone = (phone) =>
  /^[+]?[0-9\s\-()]{7,20}$/.test(phone);

/* ---------------------- TOKEN CACHE ---------------------- */
let cachedToken = null;
let tokenExpiry = null;

async function getZohoAccessToken() {
  try {
    if (cachedToken && tokenExpiry > Date.now()) {
      return cachedToken;
    }

    console.log("ENV CHECK:", {
      client_id: process.env.AIEXPERTS_ZOHO_CLIENT_ID,
      client_secret: process.env.AIEXPERTS_ZOHO_CLIENT_SECRET,
      refresh_token: process.env.AIEXPERTS_ZOHO_REFRESH_TOKEN,
    });

    if (!process.env.AIEXPERTS_ZOHO_CLIENT_ID) {
      throw new Error("Missing environment variables");
    }

    const res = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: process.env.AIEXPERTS_ZOHO_REFRESH_TOKEN,
        client_id: process.env.AIEXPERTS_ZOHO_CLIENT_ID,
        client_secret: process.env.AIEXPERTS_ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text(); // better debugging
      throw new Error(`Token request failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();

    if (!data.access_token) {
      throw new Error("Failed to get Zoho access token");
    }

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return cachedToken;

  } catch (error) {
    console.error("Error fetching Zoho access token:", error.message);

    // Optional: rethrow if you want calling function to handle it
    throw error;

    // Or return null instead:
    // return null;
  }
}

/* ---------------------- EMAIL SENDER ---------------------- */
async function sendZohoEmail({ replyTo, toEmail, subject, htmlContent }) {
  try {
    const accessToken = await getZohoAccessToken();
    const accountId = process.env.AIEXPERTS_ZOHO_ACCOUNT_ID;

    const res = await fetch(
      `https://mail.zoho.com/api/accounts/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAddress: process.env.AIXPERTS_EMAIL_USER,
          toAddress: process.env.AIXPERTS_EMAIL_TO,
          subject,
          content: htmlContent,
          mailFormat: "html",

        }),
      }
    );

    // Handle HTTP errors
    if (!res.ok) {
      const text = await res.text(); // sometimes JSON is not returned
      throw new Error(`Zoho HTTP Error ${res.status}: ${text}`);
    }

    const result = await res.json();

    // Handle Zoho API errors
    if (result?.status?.code !== 200) {
      throw new Error(
        result?.status?.description || "Zoho API returned unknown error"
      );
    }

    return result;

  } catch (err) {
    console.error("❌ Zoho Email Error:", {
      message: err.message,
      stack: err.stack,
    });

    // Re-throw so your route handler can respond properly
    throw new Error("Email sending failed");
  }
}

/* ---------------------- ROUTE ---------------------- */
router.post("/", async (req, res) => {
  try {
    let { name, email, message, phone, subject } = req.body;

    /* -------- REQUIRED FIELDS -------- */
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, Email, and Message are required.",
      });
    }

    /* -------- VALIDATION -------- */
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: "Invalid phone number." });
    }

    const allowedSubjects = [
      "AI Development",
      "Machine Learning",
      "Corporate Training",
      "General Inquiry",
    ];

    if (subject && !allowedSubjects.includes(subject)) {
      return res.status(400).json({ error: "Invalid subject selected." });
    }

    /* -------- SANITIZATION -------- */
    name = sanitizeHtml(name);
    email = sanitizeHtml(email);
    message = sanitizeHtml(message);
    phone = phone ? sanitizeHtml(phone) : "";
    subject = subject ? sanitizeHtml(subject) : "";

    /* -------- EMAIL CONTENT -------- */
    const htmlContent = contactEmailTemplate({
      name,
      email,
      phone,
      subject,
      message,
    });

    /* -------- SEND EMAIL -------- */
    await sendZohoEmail({
      replyTo: email,
      toEmail: process.env.AIEXPERTS_EMAIL_TO,
      subject: `New Contact Form Submission from ${name}${subject ? ` - ${subject}` : ""
        }`,
      htmlContent,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (err) {
    console.error("Email error:", {
      message: err.message,
      stack: err.stack,
    });

    return res.status(500).json({
      error: "Failed to send email.",
    });
  }
});

export { router as aiexpertContactRoute };