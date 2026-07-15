// ضع رابط الـ Web App الخاص بك من Apps Script هنا
const API_URL = "https://script.google.com/macros/s/AKfycbwnMz4LLHrf_6ypAXkrAtdPa8W5G-tUGftVWlmryEKqa3mISRxe3ywuIwbZDXFz7eSdwA/exec";

// تسجيل Service Worker لتحويل الموقع لتطبيق (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("تم تفعيل PWA بنجاح"));
}

// دالة مساعدة لتحويل رابط جوجل درايف إلى رابط تحميل مباشر
function getDirectDownloadLink(url) {
  // استخراج ID الملف من الرابط الافتراضي
  const match = url.match(/\/d\/(.+?)\//);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url; // إرجاع الرابط الأصلي في حال عدم التطابق
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const code = document.getElementById('patientCode').value;
  const resultBox = document.getElementById('resultBox');
  const loading = document.getElementById('loading');

  if(code.trim() === "") return alert("يرجى إدخال كود المريض.");

  loading.style.display = 'block';
  resultBox.style.display = 'none';

  fetch(API_URL + "?code=" + encodeURIComponent(code))
    .then(response => response.json())
    .then(data => {
      loading.style.display = 'none';
      resultBox.style.display = 'block';
      
      if (!data.found) {
        resultBox.className = 'error';
        resultBox.innerHTML = "⚠️ لم نتمكن من العثور على هذا الكود.";
      } else if (!data.isReady) {
        resultBox.className = 'pending';
        resultBox.innerHTML = `مرحباً <b>${data.name}</b><br><br>⏳ نتيجتك قيد الانتظار ولم تجهز بعد.`;
      } else {
        resultBox.className = 'success';
        let html = `مرحباً <b>${data.name}</b> 💐<br><br><b>النتيجة:</b> ${data.resultText}<br>`;
        
        // استخدام دالة التحميل المباشر هنا
        if (data.fileUrl && data.fileUrl.trim() !== "") {
          const directLink = getDirectDownloadLink(data.fileUrl);
          html += `<a href="${directLink}" class="btn-download" target="_blank">📥 تحميل التقرير (PDF)</a>`;
        }
        
        resultBox.innerHTML = html;
      }
    })
    .catch(error => {
      loading.style.display = 'none';
      alert("خطأ في الاتصال. تأكد من الإنترنت.");
    });
});
