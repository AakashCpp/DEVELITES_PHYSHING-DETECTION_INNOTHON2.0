// Helper: Update scan button state
function updateScanButtonState(button, isLoading, isEmail = true) {
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Loading...' : 'Scan';
  button.classList.toggle('loading', isLoading);

  if (isLoading) {
    const resultDiv = document.getElementById(isEmail ? 'email-result' : 'url-result');
    const reasonsList = document.getElementById(isEmail ? 'email-reasons' : 'url-reasons');
    resultDiv.textContent = '';
    resultDiv.className = '';
    reasonsList.innerHTML = '';
  }
}

// Display result on UI
function displayResult({ isPhishing, reasons = [], isEmail = true, error = null }) {
  const resultDiv = document.getElementById(isEmail ? 'email-result' : 'url-result');
  const reasonsList = document.getElementById(isEmail ? 'email-reasons' : 'url-reasons');

  if (error) {
    resultDiv.textContent = "❌ " + error;
    resultDiv.className = "error";
    reasonsList.innerHTML = '';
    return;
  }

  resultDiv.textContent = isPhishing
    ? "⚠️ This is potentially phished!"
    : "✅ This seems safe.";
  resultDiv.className = isPhishing ? "phished" : "success";

  reasonsList.innerHTML = '';
  reasons.forEach(reason => {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonsList.appendChild(li);
  });
}

// Email Scan Function
async function scanEmail(emailContent) {
  const button = document.getElementById('scan-email');
  updateScanButtonState(button, true, true);

  try {
    const response = await fetch('http://localhost:5000/validate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailContent }),
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);

    const data = await response.json();
    displayResult({
      isPhishing: data.phishing,
      reasons: data.reasons || [],
      isEmail: true
    });
  } catch (err) {
    console.error("Email scan failed:", err);
    displayResult({ error: err.message, isEmail: true });
  } finally {
    updateScanButtonState(button, false, true);
  }
}

// URL Scan Function
async function scanURL(url) {
  const button = document.getElementById('scan-url');
  updateScanButtonState(button, true, false);

  try {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);

    const data = await response.json();
    displayResult({
      isPhishing: data.prediction === "phishing",
      reasons: data.reasons || [],
      isEmail: false
    });
  } catch (err) {
    console.error("URL scan failed:", err);
    displayResult({ error: err.message, isEmail: false });
  } finally {
    updateScanButtonState(button, false, false);
  }
}

// --- Event Listeners ---
document.getElementById('scan-url').addEventListener('click', () => {
  const urlInput = document.getElementById('url-input').value.trim();
  if (!urlInput) {
    displayResult({ error: "Please enter a valid URL.", isEmail: false });
    return;
  }
  scanURL(urlInput);
});

document.getElementById('scan-email').addEventListener('click', () => {
  const emailInput = document.getElementById('email-input').value.trim();
  if (!emailInput) {
    displayResult({ error: "Please enter valid email content.", isEmail: true });
    return;
  }
  scanEmail(emailInput);
});

document.getElementById('email-tab').addEventListener('click', () => {
  document.getElementById('email-tab').classList.add('active');
  document.getElementById('url-tab').classList.remove('active');
  document.getElementById('email-section').classList.add('active');
  document.getElementById('url-section').classList.remove('active');
});

document.getElementById('url-tab').addEventListener('click', () => {
  document.getElementById('url-tab').classList.add('active');
  document.getElementById('email-tab').classList.remove('active');
  document.getElementById('url-section').classList.add('active');
  document.getElementById('email-section').classList.remove('active');
});
