const saveButton = document.getElementById('save');
const apiKeyInput = document.getElementById('apiKey');
const statusDiv = document.getElementById('status');

// حفظ المفتاح عند الضغط على الزر
saveButton.addEventListener('click', () => {
  const apiKey = apiKeyInput.value;
  if (apiKey) {
    chrome.storage.sync.set({ apiKey: apiKey }, () => {
      statusDiv.textContent = 'تم حفظ المفتاح بنجاح!';
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);
    });
  }
});

// عرض المفتاح المحفوظ عند تحميل الصفحة (اختياري)
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('apiKey', (data) => {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });
});
