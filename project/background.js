chrome.downloads.onCreated.addListener((downloadItem) => {
    chrome.downloads.pause(downloadItem.id, () => {
      chrome.windows.create({
        url: chrome.runtime.getURL(`verification.html?downloadId=${downloadItem.id}&url=${encodeURIComponent(downloadItem.url)}&filename=${encodeURIComponent(downloadItem.filename)}`),
        type: "popup",
        width: 420,
        height: 350
      });
    });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'resume') {
      chrome.downloads.resume(message.downloadId);
    } else if (message.action === 'cancel') {
      chrome.downloads.cancel(message.downloadId);
    }
  });
  