// content.js

// 'popup.js'den gelen "getVideoDetails" mesajını dinle
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getVideoDetails") {
      try {
        // Sayfadaki video başlığını bul
        const title = document.querySelector('meta[name="title"]')?.content || document.title.split(" - YouTube")[0];
        
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