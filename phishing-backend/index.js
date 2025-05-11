import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dns from "dns";
import validator from "validator";
import cors from "cors";
const app = express();
import checkSafeBrowsing from "./utils/safe.js";

app.use(cors());
app.use(express.json());

const suspiciousWords = [
  "urgent", "verify", "click here", "account locked", "invoice attached",
  "your password will expire", "limited time", "immediate action", "security alert",
  "login attempt blocked", "download the attachment", "update your information",
  "reset your password", "unauthorized login attempt", "your account has been compromised",
  "support team", "free prize", "exclusive offer", "pending transaction",
  "investment opportunity", "paypa1.com", "g00gle.com", "claim your tokens"
];

const suspiciousImageDomains = [
  "bit.ly", "tinyurl.com", "imgur.com", "trackyou", "fake-amaz0n.com"
];

const suspiciousFileExtensions = [
  ".exe", ".js", ".scr", ".bat", ".html", ".iso", ".zip", ".jar"
];

function detectPhishing(email) {
  let reasons = [];

  // Subject check
  if (suspiciousWords.some(word => email.subject?.toLowerCase().includes(word))) {
    reasons.push("Suspicious subject line");
  }

  // Body content check
  if (suspiciousWords.some(word => email.body?.toLowerCase().includes(word))) {
    reasons.push("Suspicious language in email body");
  }

  // Sender email check
  if (
    email.sender?.includes("paypa1") ||
    email.sender?.includes("support@randomdomain.xyz")
  ) {
    reasons.push("Suspicious sender address");
  }

  // Image links check
  if (email.images && Array.isArray(email.images)) {
    email.images.forEach((img) => {
      if (suspiciousImageDomains.some(domain => img.includes(domain))) {
        reasons.push("Suspicious image link: " + img);
      }
    });
  }

  // Attachments check (only if provided)
  if (email.attachments && Array.isArray(email.attachments)) {
    email.attachments.forEach((file) => {
      const cleanFile = file.trim().toLowerCase();
      if (suspiciousFileExtensions.some(ext => cleanFile.endsWith(ext))) {
        reasons.push("Suspicious attachment file: " + file);
      }
    });
  }

  return {
    phishing: reasons.length > 0,
    reasons: reasons.length ? reasons : ["No suspicious traits detected"]
  };
}

app.post("/api/detect", (req, res) => {
  const email = req.body;
  const result = detectPhishing(email);
  res.json(result);
});


app.post('/validate-email', (req, res) => {
  const { email } = req.body;

  // First check if email format is valid using validator
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: `${email} is not a valid email format.` });
  }

  // Get the domain from the email
  const domain = email.split('@')[1];

  // Check if the domain has valid MX records
  dns.resolveMx(domain, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return res.status(400).json({ message: `${email} domain does not have valid MX records.` });
    }

    // If we reach here, it means the email is valid
    res.json({ message: `${email} is a valid email.` });
  });
});

app.post('/safe', async (req, res) => {
  const { url } = req.body;
  const result = await checkSafeBrowsing(url);
  res.json(result);
});


app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
