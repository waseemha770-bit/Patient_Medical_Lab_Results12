// ضع رابط الـ Web App الخاص بك من Apps Script هنا
const API_URL = "https://script.google.com/macros/s/AKfycbwnMz4LLHrf_6ypAXkrAtdPa8W5G-tUGftVWlmryEKqa3mISRxe3ywuIwbZDXFz7eSdwA/exec";

// تسجيل Service Worker لتحويل الموقع لتطبيق (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("تم تفعيل PWA بنجاح"));
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
        if (data.fileUrl && data.fileUrl.trim() !== "") {
          html += `<a href="${data.fileUrl}" class="btn-download" target="_blank">📥 تحميل التقرير (PDF)</a>`;
        }
        resultBox.innerHTML = html;
      }
    })
    .catch(error => {
      loading.style.display = 'none';
      alert("خطأ في الاتصال. تأكد من الإنترنت.");
    });
});
