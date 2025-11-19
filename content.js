// content.js

// --- 1. YARDIMCI FONKSİYONLAR ---

// Ekranda geçici bildirim (Toast) gösterir
function showNotification(message, type = "success") {
  const oldDiv = document.getElementById("yt-linker-toast");
  if (oldDiv) oldDiv.remove();

  const div = document.createElement("div");
  div.id = "yt-linker-toast";
  div.textContent = message;
  
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.padding = "12px 24px";
  div.style.backgroundColor = type === "success" ? "#333" : "#d32f2f";
  div.style.color = "#fff";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  div.style.zIndex = "2147483647"; // En üstte olması için max z-index
  div.style.fontFamily = "Arial, sans-serif";
  div.style.fontSize = "14px";
  div.style.opacity = "0";
  div.style.transition = "opacity 0.3s ease";

  document.body.appendChild(div);

  setTimeout(() => { div.style.opacity = "1"; }, 10);

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => { div.remove(); }, 300);
  }, 3000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Sayfadan verileri çeken ortak fonksiyon
function getVideoData() {
  try {
    let title = "";
    const titleElement = document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string");
    if (titleElement && titleElement.textContent) title = titleElement.textContent;
    if (!title) title = document.querySelector('meta[name="title"]')?.content;
    if (!title) title = document.title.split(" - YouTube")[0];

    const videoElement = document.querySelector('video');
    const currentTimeInSeconds = videoElement ? videoElement.currentTime : 0;

    let baseUrl = window.location.href;
    baseUrl = baseUrl.replace(/&t=\d+s?/, '');
    
    if (baseUrl.includes("/shorts/") || baseUrl.includes("m.youtube.com")) {
        const match = baseUrl.match(/([a-zA-Z0-9_-]{11})/);
        if (match) baseUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }

    return { title, currentTime: currentTimeInSeconds, baseUrl };
  } catch (e) {
    console.error(e);
    return null;
  }
}

// --- 2. KLAVYE KISAYOL MANTIĞI ---

async function performCopyLink() {
  try {
    const data = getVideoData();
    if (!data) return;

    const timeString = formatTime(data.currentTime);
    const timeInSeconds = Math.floor(data.currentTime);
    const timestampedUrl = `${data.baseUrl}&t=${timeInSeconds}s`;
    const formattedText = `"${data.title}" dakika: ${timeString}`;
    
    const html = `<a href="${timestampedUrl}">${formattedText}</a>`;
    const plainText = `${formattedText}\n${timestampedUrl}`;
    
    const blobHtml = new Blob([html], { type: 'text/html' });
    const blobText = new Blob([plainText], { type: 'text/plain' });
    
    const clipboardItem = new ClipboardItem({ 
        'text/html': blobHtml, 
        'text/plain': blobText 
    });
    
    await navigator.clipboard.write([clipboardItem]);
    showNotification("✅ Link Kopyalandı!");

  } catch (err) {
    console.error(err);
    showNotification("❌ Kopyalama Başarısız", "error");
  }
}

async function performScreenshot() {
  try {
    const videoElement = document.querySelector('video');
    if (!videoElement) {
      showNotification("❌ Video bulunamadı", "error");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        showNotification("📸 Ekran Görüntüsü Kopyalandı!");
      } catch (err) {
        showNotification("❌ Resim Kopyalanamadı", "error");
      }
    }, 'image/png', 1.0);

  } catch (err) {
    console.error(err);
  }
}

// YENİ: QR Kod Oluşturma Fonksiyonu
async function performGenQR() {
  try {
    const data = getVideoData();
    if (!data) return;

    const timeInSeconds = Math.floor(data.currentTime);
    const timestampedUrl = `${data.baseUrl}&t=${timeInSeconds}s`;

    // 1. Geçici ve görünmez bir DIV oluştur
    const tempDiv = document.createElement("div");
    // Ekranda görünmesin ama render edilsin diye ekran dışına atıyoruz
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    document.body.appendChild(tempDiv);

    // 2. QR Kütüphanesini kullanarak kodu bu div'e çiz
    // (Manifest dosyasında kütüphaneyi eklediğimiz için QRCode sınıfı burada çalışır)
    new QRCode(tempDiv, {
      text: timestampedUrl,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.H
    });

    // 3. Çizim işleminin bitmesini biraz bekle
    setTimeout(() => {
      const canvas = tempDiv.querySelector("canvas");
      if (!canvas) {
        showNotification("❌ QR Oluşturulamadı", "error");
        tempDiv.remove();
        return;
      }

      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showNotification("📱 QR Kod Kopyalandı!");
        } catch (err) {
          console.error(err);
          showNotification("❌ Pano Hatası", "error");
        }
        // Temizlik yap
        tempDiv.remove();
      }, 'image/png', 1.0);
    }, 100); // 100ms bekleme

  } catch (err) {
    console.error("QR Hatası:", err);
    showNotification("❌ QR Kütüphane Hatası", "error");
  }
}


// --- 3. OLAY DİNLEYİCİLERİ ---

document.addEventListener('keydown', (event) => {
  if (!event.altKey) return;

  // ALT + C : Link Kopyala
  if (event.code === 'KeyC') {
    event.preventDefault();
    performCopyLink();
  }

  // ALT + S : Screenshot
  if (event.code === 'KeyS') {
    event.preventDefault();
    performScreenshot();
  }

  // ALT + Q : QR Kod (YENİ)
  if (event.code === 'KeyQ') {
    event.preventDefault();
    performGenQR();
  }
});

// Popup Mesaj Dinleyicisi (Eski sistemin çalışmaya devam etmesi için)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVideoDetails") {
        const data = getVideoData();
        sendResponse({
            title: data.title,
            currentTime: data.currentTime,
            videoUrl: data.baseUrl
        });
        return true;
    }
    if (request.action === "captureScreenshot") {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        sendResponse({ dataUrl: dataUrl });
        return true;
    }
});