// content.js

// 'popup.js'den gelen "getVideoDetails" mesajını dinle
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getVideoDetails") {
      try {
        
        // --- BAŞLIK ALMA YÖNTEMİ GÜNCELLENDİ ---
        
        let title = "";

        // 1. Yöntem: Sayfanın GÖVDESİNDEKİ H1 başlığını bul (SPA için en güvenilir olan budur)
        // YouTube'un kullandığı güncel başlık seçicisi budur
        const titleElement = document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string");
        
        if (titleElement && titleElement.textContent) {
          title = titleElement.textContent;
        } 
        
        // 2. Yöntem (Eski Yöntem): Eğer H1 bulunamazsa, HEAD içindeki meta etiketini ara
        if (!title) {
          title = document.querySelector('meta[name="title"]')?.content;
        }
        
        // 3. Yöntem (Son Çare): Sayfanın sekme başlığını kullan
        if (!title) {
          title = document.title.split(" - YouTube")[0];
        }
        
        // ------------------------------------------

        // Video elementini bul
        const videoElement = document.querySelector('video');
        
        // VİDEONUN O ANKİ ZAMANINI AL
        const currentTimeInSeconds = videoElement ? videoElement.currentTime : 0;

        // Sayfanın o anki URL'sini al
        let baseUrl = window.location.href;
        
        // Eğer URL'de zaten bir &t= varsa, onu temizle
        baseUrl = baseUrl.replace(/&t=\d+s?/, '');

        // Bilgileri 'popup.js'e geri gönder
        sendResponse({
          title: title,
          currentTime: currentTimeInSeconds, // O anki saniye
          videoUrl: baseUrl // Temizlenmiş video linki
        });
        
      } catch (e) {
        sendResponse({ error: e.message });
      }
      
      // Mesaj portunun açık kalması için 'true' döndür
      return true;
    }
  }
);