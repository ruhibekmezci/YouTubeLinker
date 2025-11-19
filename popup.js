// popup.js

// --- Yardımcı Fonksiyonlar ---

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function copyRichText(text, url, statusElement) {
  const html = `<a href="${url}">${text}</a>`;
  try {
    const plainText = `${text}\n${url}`;
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })];
    await navigator.clipboard.write(data);
    statusElement.innerHTML = '<span class="success">Link olarak kopyalandı!</span>';
  } catch (err) {
    statusElement.textContent = 'Hata: Link kopyalanamadı.';
    console.error('Kopyalama hatası: ', err);
  }
}

function isValidYouTubeVideoUrl(url) {
  if (!url) return false;
  const regex = /^(https?:)?(\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\/(watch\v=|shorts\/|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})(&.*)?$/;
  return regex.test(url);
}

async function generateAndCopyQR(url, statusElement) {
  const qrContainer = document.getElementById('qrcode-container');
  qrContainer.innerHTML = '';
  statusElement.textContent = 'QR kod oluşturuluyor...';

  try {
    new QRCode(qrContainer, {
      text: url,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(async () => {
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) { statusElement.textContent = 'Hata: QR canvas bulunamadı.'; return; }
      
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          statusElement.innerHTML = '<span class="success">QR Kod kopyalandı!</span>';
        } catch (copyErr) {
          statusElement.textContent = 'Hata: QR kopyalanamadı.';
        }
      }, 'image/png', 1.0);
    }, 100);

  } catch (qrErr) {
    statusElement.textContent = 'Hata: QR oluşturulamadı.';
  }
}

// --- YENİ: EKRAN GÖRÜNTÜSÜ İŞLEYİCİSİ ---
async function handleScreenshot(tabId, statusElement) {
  statusElement.textContent = 'Resim alınıyor...';
  
  chrome.tabs.sendMessage(tabId, { action: "captureScreenshot" }, async (response) => {
    if (chrome.runtime.lastError || !response || response.error) {
      statusElement.textContent = 'Hata: Resim alınamadı.';
      console.error(chrome.runtime.lastError?.message || response?.error);
      return;
    }

    if (response.dataUrl) {
      try {
        // Base64 verisini Blob'a çevirmemiz lazım
        const res = await fetch(response.dataUrl);
        const blob = await res.blob();
        
        // Panoya resim olarak kopyala
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        statusElement.innerHTML = '<span class="success">Resim kopyalandı!</span><br><small>(Ctrl+V ile yapıştır)</small>';
      } catch (err) {
        statusElement.textContent = 'Hata: Pano işlemi başarısız.';
        console.error(err);
      }
    }
  });
}


// --- Ana Çalışma Mantığı ---
document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const copyButton = document.getElementById('copyButton');
  const qrButton = document.getElementById('qrButton');
  const shotButton = document.getElementById('shotButton'); // Yeni buton

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) { statusElement.textContent = 'Hata: Sekme yok.'; return; }
    
    const activeTab = tabs[0];
    const url = activeTab.url;

    if (!isValidYouTubeVideoUrl(url)) {
      statusElement.textContent = 'Hata: YouTube sayfası değil.';
      return;
    }

    // Video detaylarını al
    chrome.tabs.sendMessage(activeTab.id, { action: "getVideoDetails" }, (response) => {
        
        if (chrome.runtime.lastError || !response) {
          statusElement.textContent = 'Bağlantı kurulamadı (Sayfayı Yenile)';
          return;
        } 
        
        if (response.title) {
          // --- Veriler Hazır ---
          const title = response.title;
          const currentTime = response.currentTime;
          let baseUrl = response.videoUrl;

          const timeString = formatTime(currentTime);
          const timeInSeconds = Math.floor(currentTime);
          
          if (url.includes("/shorts/") || url.includes("m.youtube.com")) {
             const videoID = url.match(/([a-zA-Z0-9_-]{11})/)[1];
             baseUrl = `https://www.youtube.com/watch?v=${videoID}`;
          }

          const formattedText = `"${title}" dakika: ${timeString}`;
          const timestampedUrl = `${baseUrl}&t=${timeInSeconds}s`;

          // Durumu güncelle ve butonları aç
          statusElement.innerHTML = '<span class="success">Hazır!</span> İşlem seçin:';
          copyButton.disabled = false;
          qrButton.disabled = false;
          shotButton.disabled = false;

          // Buton Olayları
          copyButton.addEventListener('click', () => copyRichText(formattedText, timestampedUrl, statusElement));
          qrButton.addEventListener('click', () => generateAndCopyQR(timestampedUrl, statusElement));
          
          // Yeni Screenshot butonu
          shotButton.addEventListener('click', () => handleScreenshot(activeTab.id, statusElement));

        } else {
          statusElement.textContent = 'Video bulunamadı.';
        }
    });
  });
});