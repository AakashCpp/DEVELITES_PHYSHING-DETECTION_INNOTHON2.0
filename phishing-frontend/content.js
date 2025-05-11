function extractEmailContent() {
  const subject = document.querySelector("h2.hP")?.innerText || "";
  const sender = document.querySelector("span.gD")?.getAttribute("email") || "";
  const body = document.querySelector("div.a3s")?.innerText || "";

  // Fake image and attachment extraction (simulate structure)
  const images = Array.from(document.querySelectorAll("div.a3s img")).map(img => img.src);
  const attachments = Array.from(document.querySelectorAll("div.aQH span.aV3"))
    .map(el => el.innerText.trim());

  return { subject, sender, body, images, attachments };
}

function sendToBackend(emailData) {
  fetch("http://localhost:5000/api/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailData)
  })
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({ phishingResult: data });
    })
    .catch(err => console.error("Error in detection:", err));
}

setTimeout(() => {
  const emailData = extractEmailContent();
  if (emailData.subject && emailData.body) {
    sendToBackend(emailData);
  }
}, 3000); // Give Gmail time to load