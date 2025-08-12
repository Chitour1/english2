// إنشاء قائمة السياق عند تثبيت الإضافة
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readSelectedTextPro",
    title: "اقرأ النص المحدد",
    contexts: ["selection"]
  });
});

// الاستماع لحدث النقر على عنصر القائمة
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readSelectedTextPro" && info.selectionText) {
    // جلب المفتاح من الـ storage أولاً
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        googleTextToSpeech(info.selectionText, result.apiKey);
      } else {
        // إذا لم يتم العثور على المفتاح، افتح صفحة الإعدادات لتنبيه المستخدم
        chrome.runtime.openOptionsPage();
      }
    });
  }
});

// دالة لإرسال الطلب إلى Google TTS API وتشغيل الصوت
async function googleTextToSpeech(textToRead, apiKey) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const requestBody = {
    input: { text: textToRead },
    voice: { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-D' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
    audio.play();
  } catch (error) {
    console.error('Failed to fetch TTS audio:', error);
    // يمكنك إضافة تنبيه للمستخدم هنا بأن المفتاح قد يكون خاطئًا
  }
}
