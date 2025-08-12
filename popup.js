document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (!result.apiKey) {
      // إذا لم يتم العثور على المفتاح، افتح صفحة الإعدادات
      chrome.runtime.openOptionsPage();
    } else {
      // إذا كان المفتاح موجودًا، اعرض رسالة
      document.getElementById('message').textContent = 'الإضافة جاهزة. حدد نصًا، انقر بزر الماوس الأيمن، ثم اختر "اقرأ النص المحدد".';
    }
  });
});
