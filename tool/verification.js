const API_KEY = ''; // Replace with your real key

const urlParams = new URLSearchParams(window.location.search);
const downloadId = parseInt(urlParams.get('downloadId'));
const filename = decodeURIComponent(urlParams.get('filename'));
const url = decodeURIComponent(urlParams.get('url'));

const fileInfo = document.getElementById('file-info');
const allowBtn = document.getElementById('allow');
const blockBtn = document.getElementById('block');

allowBtn.disabled = true;
fileInfo.textContent = `Scanning: ${filename}\nSource: ${url}`;

// Step 1: Submit URL to VirusTotal
fetch("https://www.virustotal.com/api/v3/urls", {
  method: "POST",
  headers: {
    "x-apikey": API_KEY,
    "content-type": "application/x-www-form-urlencoded"
  },
  body: `url=${encodeURIComponent(url)}`
})
.then(res => res.json())
.then(data => {
  const scanId = data.data.id;
  
  // Step 2: Poll for report
  return fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
    headers: { "x-apikey": API_KEY }
  });
})
.then(res => res.json())
.then(result => {
  const malicious = result.data.attributes.stats.malicious;
  const harmless = result.data.attributes.stats.harmless;

  if (malicious > 0) {
    fileInfo.textContent += `\n❌ Detected: ${malicious} malicious reports`;
  } else {
    fileInfo.textContent += `\n✅ File appears safe (${harmless} scanners marked it harmless)`;
  }

  allowBtn.disabled = false;
})
.catch(err => {
  fileInfo.textContent += `\n⚠️ Scan failed. Proceed with caution.`;
  allowBtn.disabled = false;
});

// Allow or block
allowBtn.onclick = () => {
  chrome.runtime.sendMessage({ action: 'resume', downloadId });
  window.close();
};

blockBtn.onclick = () => {
  chrome.runtime.sendMessage({ action: 'cancel', downloadId });
  window.close();
};