// popup.js

// --- Yardımcı Fonksiyonlar ---

/**
 * Saniyeyi (float) alır ve "mm:ss" formatına çevirir.
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Panoya zengin metin (HTML/Hyperlink) kopyalar.
 */
async function copyRichText(text, url, statusElement) {
  const html = `<a href="${url}">${text}</a>`;
  try {
    // --- WHATSAPP İÇİN DEĞİŞİKLİK BURADA ---
    // Düz metin (text/plain) yedeği olarak, formatlı metni VE
    // bir alt satırda (\n) gerçek URL'yi ekliyoruz.
    const plainText = `${text}\n${url}`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' }); // Yedeği güncellenmiş metinle oluştur
    
    // ------------------------------------------

    const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })];
    await navigator.clipboard.write(data);
    
    statusElement.innerHTML = '<span class="success">Link olarak kopyalandı!</span>';
  } catch (err) {
    statusElement.textContent = 'Hata: Link kopyalanamadı.';
    console.error('Kopyalama hatası: ', err);
  }
}

/**
 * Verilen URL'nin geçerli bir YouTube video sayfası olup olmadığını kontrol eder.
 */
function isValidYouTubeVideoUrl(url) {
  if (!url) return false;
  const regex = /^(https?:)?(\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\/(watch\v=|shorts\/|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})(&.*)?$/;
  return regex.test(url);
}

/**
 * Verilen URL için bir QR kod oluşturur ve resmi panoya kopyalar.
 */
async function generateAndCopyQR(url, statusElement) {
  const qrContainer = document.getElementById('qrcode-container');
  
  qrContainer.innerHTML = '';
  statusElement.textContent = 'QR kod oluşturuluyor...';

  try {
    // Kütüphaneyi kullanarak QR kodu gizli div içinde oluştur
    new QRCode(qrContainer, {
      text: url,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.H
    });

    // Oluşturulan canvas elementini bulmak için kısa bir gecikme
    setTimeout(async () => {
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) {
        statusElement.textContent = 'Hata: QR canvas bulunamadı.';
        return;
      }
      
      // Canvas'ı "Blob" (resim dosyası) formatına çevir
      canvas.toBlob(async (blob) => {
        try {
          // Resmi (Blob) panoya kopyala
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          
          statusElement.innerHTML = '<span class="success">QR Kod panoya kopyalandı!</span>';
        } catch (copyErr) {
          statusElement.textContent = 'Hata: QR kod panoya kopyalanamadı.';
          console.error('QR Kopyalama Hatası: ', copyErr);
        }
      }, 'image/png', 0.95);
    }, 100);

  } catch (qrErr) {
    statusElement.textContent = 'Hata: QR kod oluşturulamadı.';
    console.error('QR Oluşturma Hatası: ', qrErr);
  }
}


// --- Ana Çalışma Mantığı ---
document.addEventListener('DOMContentLoaded', () => {
  // HTML'deki elementleri seç
  const statusElement = document.getElementById('status');
  const copyButton = document.getElementById('copyButton');
  const qrButton = document.getElementById('qrButton');

  // Aktif sekmeyi SORGULA
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    
    if (!tabs || tabs.length === 0) {
      statusElement.textContent = 'Hata: Aktif sekmeyin)';
      return;
    }
    
    const activeTab = tabs[0];
    const url = activeTab.url;

    // URL'yi kontrol et
    if (!isValidYouTubeVideoUrl(url)) {
      statusElement.textContent = 'Hata: Bu bir YouTube video sayfası değil.';
      console.log("Reddedilen URL: ", url);
      return;
    }

    // 'content.js'e mesaj göndererek video detaylarını iste
    chrome.tabs.sendMessage(activeTab.id, { action: "getVideoDetails" }, (response) => {
        
        if (chrome.runtime.lastError || !response) {
          statusElement.textContent = 'Hata: Sayfayla bağlantı kurulamadı. (Sayfayı yenileyin)';
          console.error(chrome.runtime.lastError?.message);
          return;
        } 
        
        if (response.title && response.videoUrl) {
          // --- Veriler Başarıyla Alındı ---
          
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

          // Durumu güncelle ve butonları AKTİF hale getir
          statusElement.innerHTML = '<span class="success">Veri alındı!</span><br>İşlem seçin:';
          copyButton.disabled = false;
          qrButton.disabled = false;

          // --- Butonlara görevlerini ata ---
          copyButton.addEventListener('click', () => {
            copyRichText(formattedText, timestampedUrl, statusElement);
          });
          
          qrButton.addEventListener('click', () => {
            generateAndCopyQR(timestampedUrl, statusElement); 
          });

        } else {
          statusElement.textContent = 'Hata: Video başlığı veya süresi bulunamadı.';
        }
    });
  });
});