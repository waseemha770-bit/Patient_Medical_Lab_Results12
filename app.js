// ضع رابط الـ Web App الخاص بك من Apps Script هنا داخل علامتي التنصيص
const API_URL = "https://script.google.com/macros/s/AKfycbxmRRVtI3srvNUtBIDgAqLFMQhKpnv3q_gnrGcEgOSj5Fq2lR_kAVUGNKCD7EeckVbdrQ/exec";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("تم تفعيل PWA بنجاح"));
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const code = document.getElementById('patientCode').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const resultBox = document.getElementById('resultBox');
  const loading = document.getElementById('loading');

  if(!code || !phone) return alert("يرجى إدخال كود المريض ورقم الهاتف.");

  loading.style.display = 'block';
  resultBox.style.display = 'none';

  const requestUrl = `${API_URL}?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`;

  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      loading.style.display = 'none';
      resultBox.style.display = 'block';
      
      if (!data.found) {
        resultBox.className = 'error';
        resultBox.innerHTML = "⚠️ البيانات غير صحيحة أو غير موجودة.";
      } else if (!data.isReady) {
        resultBox.className = 'pending';
        resultBox.innerHTML = `مرحباً <b>${data.name}</b><br><br>⏳ نتيجتك قيد الانتظار ولم تجهز بعد.`;
      } else {
        resultBox.className = 'success';
        let html = `مرحباً <b>${data.name}</b> 💐<br><br><b>النتيجة:</b> ${data.resultText}<br>`;
        
        if (data.fileUrl && data.fileUrl.trim() !== "") {
          const idMatch = data.fileUrl.match(/[-\w]{25,}/);
          if (idMatch) {
            const fileId = idMatch[0];
            const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            
            html += `<div class="buttons-container">
                       <a href="${previewUrl}" class="btn-action btn-view" target="_blank">👁️ معاينة</a>
                       <a href="${downloadUrl}" class="btn-action btn-download">📥 تحميل</a>
                     </div>`;
          }
        }
        resultBox.innerHTML = html;
      }
    })
    .catch(error => {
      loading.style.display = 'none';
      resultBox.style.display = 'block';
      resultBox.className = 'error';
      resultBox.innerHTML = "⚠️ خطأ في الاتصال. تأكد من الإنترنت.";
    });
});
