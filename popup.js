// popup.js

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
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([text], { type: 'text/plain' });
    
    const data = [new ClipboardItem({
      'text/html': blob,
      'text/plain': textBlob
    })];

    await navigator.clipboard.write(data);
    
    statusElement.innerHTML = '<span class="success">Link olarak kopyalandı!</span><br>' + html;

  } catch (err) {
    statusElement.textContent = 'Hata: Link kopyalanamadı.';
    console.error('Kopyalama hatası: ', err);
  }
}

/**
 * Verilen URL'nin geçerli bir YouTube video sayfası olup olmadığını kontrol eder.
 * @param {string} url - Kontrol edilecek URL
 * @returns {boolean} - Geçerliyse true, değilse false
 */
function isValidYouTubeVideoUrl(url) {
  if (!url) return false;
  // Bu REGEX (Düzenli İfade), her türlü YouTube linkini (www, m, shorts, youtu.be) yakalar
  const regex = /^(https?:)?(\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})(&.*)?$/;
  return regex.test(url);
}

// Uzantı açıldığında ana fonksiyonu çalıştır
document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');

  // 'tabs' iznini kullanarak aktif sekmeyi SORGULA
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    
    if (!tabs || tabs.length === 0) {
      statusElement.textContent = 'Hata: Aktif sekme bulunamadı.';
      return;
    }
    
    const activeTab = tabs[0];
    const url = activeTab.url;

    // --- DEĞİŞİKLİK BURADA ---
    // Artık çok daha akıllı bir fonksiyon kullanıyoruz
    if (!isValidYouTubeVideoUrl(url)) {
      statusElement.textContent = 'Hata: Bu bir YouTube video sayfası değil.';
      // Hata ayıklama için: Hangi URL'yi gördüğümüzü yazdıralım
      console.log("Reddedilen URL: ", url);
      return;
    }
    // -----------------------------------------

    // 'content.js' ZATEN SAYFADA OLDUĞU İÇİN DİREKT MESAJ GÖNDERİYORUZ.
    chrome.tabs.sendMessage(activeTab.id, { action: "getVideoDetails" }, (response) => {
        
        if (chrome.runtime.lastError) {
          statusElement.textContent = 'Hata: Sayfayla bağlantı kurulamadı. (Sayfayı yenileyin)';
          console.error(chrome.runtime.lastError.message);
        } else if (response && response.title && response.videoUrl) {
          
          const title = response.title;
          const currentTime = response.currentTime;
          let baseUrl = response.videoUrl;

          const timeString = formatTime(currentTime);
          const timeInSeconds = Math.floor(currentTime);
          
          // Eğer bir shorts/mobil videosuysa, linki 'watch' formatına çevir (daha sağlam)
          if (url.includes("/shorts/") || url.includes("m.youtube.com")) {
             // 'content.js' başlık ve süreyi bulduysa,
             // URL'yi biz standart 'watch' formatına çevirebiliriz.
             // (response.videoUrl'yi kullanmak yerine)
             const videoID = url.match(/([a-zA-Z0-9_-]{11})/)[1];
             baseUrl = `https://www.youtube.com/watch?v=${videoID}`;
          }

          const formattedText = `"${title}" dakika: ${timeString}`;
          const timestampedUrl = `${baseUrl}&t=${timeInSeconds}s`;

          copyRichText(formattedText, timestampedUrl, statusElement);

        } else {
          statusElement.textContent = 'Hata: Video başlığı veya süresi bulunamadı.';
        }
    });
  });
});