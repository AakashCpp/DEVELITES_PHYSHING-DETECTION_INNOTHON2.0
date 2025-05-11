import axios from "axios";

async function checkSafeBrowsing(urlToCheck) {
  const API_KEY = process.env.SAFE_API_KEY;
  const BASE_URL = process.env.SAFE_API_URL || "https://safebrowsing.googleapis.com/v4/threatMatches:find";
  const FULL_URL = `${BASE_URL}?key=${API_KEY}`;
    console.log(urlToCheck);
    
  const requestBody = {
    client: {
      clientId: "Sky",
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: urlToCheck }
      ]
    }
  };

  try {
    const response = await axios.post(FULL_URL, requestBody);

    if (response.data && response.data.matches) {
      return {
        phishing: true,
        reasons: response.data.matches.map(match => `Google flagged as: ${match.threatType}`),
      };
    } else {
      return {
        phishing: false,
        reasons: ["Google Safe Browsing says this URL is safe."],
      };
    }
  } catch (error) {
    console.error("Safe Browsing API error:", error.message);
    return {
      phishing: false,
      reasons: ["Could not connect to Google Safe Browsing."],
    };
  }
}

export default checkSafeBrowsing;
