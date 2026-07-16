const API_URL = "https://script.google.com/macros/s/AKfycbweyth6uks-3x2i6D_68QSxGHtNYBeKGyisKnJmYW9k_KqHjH_M_n6Z154c6VInNu05XA/exec"; // تذكر وضع الرابط الجديد بعد النشر

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("تم تفعيل PWA بنجاح"));
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const code = document.getElementById('patientCode').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const dept = document.getElementById('department').value; // جلب القسم المختار
  const resultBox = document.getElementById('resultBox');
  const loading = document.getElementById('loading');

  if(!code || !phone) return alert("يرجى إدخال كود المريض ورقم الهاتف.");

  loading.style.display = 'block';
  resultBox.style.display = 'none';

  // إضافة القسم (dept) إلى الرابط
  const requestUrl = `${API_URL}?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}&dept=${encodeURIComponent(dept)}`;

  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      loading.style.display = 'none';
      resultBox.style.display = 'block';
      
      if (!data.found) {
        resultBox.className = 'error';
        resultBox.innerHTML = "⚠️ البيانات غير صحيحة أو النتيجة غير متوفرة في هذا القسم.";
      } else if (!data.isReady) {
        resultBox.className = 'pending';
        resultBox.innerHTML = `مرحباً <b>${data.name}</b><br><br>⏳ نتيجتك قيد الانتظار في القسم ولم تجهز بعد.`;
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
