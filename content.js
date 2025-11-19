// content.js (V1.8 - Düzenle & Sil Modu)

// --- CSS STİLLERİ ---
const styles = `
  .yt-linker-marker {
    position: absolute;
    top: 0; bottom: 0; width: 4px;
    background-color: #FFD700; z-index: 999;
    cursor: pointer; pointer-events: auto;
    box-shadow: 1px 0 2px rgba(0,0,0,0.5);
    transition: transform 0.1s;
  }
  .yt-linker-marker:hover {
    transform: scaleY(1.5);
    background-color: #FF4500;
  }
  #yt-linker-tooltip {
    position: absolute; background: rgba(0,0,0,0.9);
    color: white; padding: 8px 12px; border-radius: 4px;
    font-size: 13px; font-family: Roboto, Arial;
    pointer-events: none; z-index: 10000; white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5); border: 1px solid #444;
    display: none;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

let tooltipDiv = document.createElement('div');
tooltipDiv.id = 'yt-linker-tooltip';
document.body.appendChild(tooltipDiv);


// --- YARDIMCI FONKSİYONLAR ---
function showNotification(message, type = "success") {
  const oldDiv = document.getElementById("yt-linker-toast");
  if (oldDiv) oldDiv.remove();
  const div = document.createElement("div");
  div.id = "yt-linker-toast";
  div.textContent = message;
  div.style.cssText = `position:fixed; bottom:20px; right:20px; padding:12px 24px; 
                       background-color:${type === "success" ? "#333" : "#d32f2f"}; 
                       color:#fff; border-radius:8px; z-index:2147483647; 
                       font-family:Arial; font-size:14px; opacity:0; transition:opacity 0.3s ease;`;
  document.body.appendChild(div);
  setTimeout(() => { div.style.opacity = "1"; }, 10);
  setTimeout(() => { div.style.opacity = "0"; setTimeout(() => div.remove(), 300); }, 3000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getVideoID() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}


// --- NOT SİSTEMİ (KAYDET - SİL - DÜZENLE) ---

function loadAndRenderMarkers() {
  const videoID = getVideoID();
  if (!videoID) return;

  // Eski işaretçileri temizle
  document.querySelectorAll('.yt-linker-marker').forEach(el => el.remove());

  chrome.storage.local.get([videoID], (result) => {
    const notes = result[videoID] || [];
    const progressBar = document.querySelector('.ytp-progress-bar');
    const videoElement = document.querySelector('video');

    if (!progressBar || !videoElement || isNaN(videoElement.duration)) {
      setTimeout(loadAndRenderMarkers, 1000);
      return;
    }

    const duration = videoElement.duration;

    notes.forEach((note, index) => {
      const positionPercent = (note.time / duration) * 100;
      const marker = document.createElement('div');
      marker.className = 'yt-linker-marker';
      marker.style.left = positionPercent + '%';
      
      // 1. Mouse Üzerine Gelince (Tooltip)
      marker.addEventListener('mouseenter', () => {
        tooltipDiv.textContent = `${formatTime(note.time)} - ${note.text}`;
        tooltipDiv.style.display = 'block';
        const rect = marker.getBoundingClientRect();
        tooltipDiv.style.left = (rect.left - (tooltipDiv.offsetWidth / 2)) + 'px';
        tooltipDiv.style.top = (rect.top - 40) + 'px';
      });
      marker.addEventListener('mouseleave', () => {
        tooltipDiv.style.display = 'none';
      });
      
      // 2. Sol Tık: Saniyeye Git
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        videoElement.currentTime = note.time;
      });

      // 3. YENİ: Sağ Tık (Düzenle / Sil)
      marker.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Sağ tık menüsünü engelle
        e.stopPropagation();

        const newText = prompt("Notu düzenle (Silmek için yazıyı tamamen silip Tamam'a basın):", note.text);

        if (newText !== null) { // İptal'e basılmadıysa
          chrome.storage.local.get([videoID], (currResult) => {
            let currNotes = currResult[videoID] || [];
            
            if (newText.trim() === "") {
              // Yazı boşsa SİL
              // (Time değeri aynı olan notu bulup siliyoruz)
              currNotes = currNotes.filter(n => n.time !== note.time);
              showNotification("🗑️ Not Silindi", "error");
            } else {
              // Yazı doluysa GÜNCELLE
              const targetIndex = currNotes.findIndex(n => n.time === note.time);
              if (targetIndex > -1) {
                currNotes[targetIndex].text = newText;
                showNotification("✏️ Not Güncellendi");
              }
            }
            
            // Yeni listeyi kaydet ve ekranı yenile
            chrome.storage.local.set({ [videoID]: currNotes }, () => {
              loadAndRenderMarkers();
            });
          });
        }
      });

      progressBar.appendChild(marker);
    });
  });
}

function saveNote() {
  const videoElement = document.querySelector('video');
  const videoID = getVideoID();
  
  if (!videoElement || !videoID) {
    showNotification("❌ Video bulunamadı!", "error");
    return;
  }

  const currentTime = videoElement.currentTime;
  videoElement.pause(); 

  const noteText = prompt(`Bu saniye (${formatTime(currentTime)}) için notunuz:`);

  if (noteText) {
    chrome.storage.local.get([videoID], (result) => {
      const notes = result[videoID] || [];
      notes.push({ time: currentTime, text: noteText });
      chrome.storage.local.set({ [videoID]: notes }, () => {
        showNotification("✅ Not Kaydedildi!");
        loadAndRenderMarkers();
      });
    });
  }
  videoElement.play(); 
}


// --- MEVCUT FONKSİYONLAR (Aynı Kaldı) ---
function getVideoData() {
  try {
    let title = "";
    const titleElement = document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string");
    if (titleElement && titleElement.textContent) title = titleElement.textContent;
    if (!title) title = document.title.split(" - YouTube")[0];
    const videoElement = document.querySelector('video');
    const currentTimeInSeconds = videoElement ? videoElement.currentTime : 0;
    let baseUrl = window.location.href.replace(/&t=\d+s?/, '');
    if (baseUrl.includes("/shorts/") || baseUrl.includes("m.youtube.com")) {
        const match = baseUrl.match(/([a-zA-Z0-9_-]{11})/);
        if (match) baseUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return { title, currentTime: currentTimeInSeconds, baseUrl };
  } catch (e) { return null; }
}
async function performCopyLink() {
  const data = getVideoData(); if (!data) return;
  const timeString = formatTime(data.currentTime);
  const timestampedUrl = `${data.baseUrl}&t=${Math.floor(data.currentTime)}s`;
  const formattedText = `"${data.title}" dakika: ${timeString}`;
  const blobHtml = new Blob([`<a href="${timestampedUrl}">${formattedText}</a>`], { type: 'text/html' });
  const blobText = new Blob([`${formattedText}\n${timestampedUrl}`], { type: 'text/plain' });
  await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
  showNotification("✅ Link Kopyalandı!");
}
async function performScreenshot() {
  const v = document.querySelector('video'); if (!v) return;
  const c = document.createElement("canvas"); c.width=v.videoWidth; c.height=v.videoHeight;
  c.getContext("2d").drawImage(v,0,0);
  c.toBlob(async(b)=>{await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);showNotification("📸 Ekran Görüntüsü Kopyalandı!");},'image/png');
}
async function performGenQR() {
  const d = getVideoData(); if (!d) return;
  const url = `${d.baseUrl}&t=${Math.floor(d.currentTime)}s`;
  const t = document.createElement("div"); t.style.position="absolute";t.style.left="-9999px";document.body.appendChild(t);
  new QRCode(t, {text:url,width:256,height:256,correctLevel:QRCode.CorrectLevel.H});
  setTimeout(()=>{const c=t.querySelector("canvas");if(c)c.toBlob(async(b)=>{await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);showNotification("📱 QR Kod Kopyalandı!");t.remove();});},100);
}

// --- OLAY DİNLEYİCİLERİ ---
document.addEventListener('keydown', (event) => {
  if (!event.altKey) return;
  if (event.code === 'KeyC') { event.preventDefault(); performCopyLink(); }
  if (event.code === 'KeyS') { event.preventDefault(); performScreenshot(); }
  if (event.code === 'KeyQ') { event.preventDefault(); performGenQR(); }
  if (event.code === 'KeyA') { event.preventDefault(); saveNote(); }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVideoDetails") { const d = getVideoData(); sendResponse({title:d.title,currentTime:d.currentTime,videoUrl:d.baseUrl}); }
    else if (request.action === "captureScreenshot") { const v = document.querySelector('video'); if(v){const c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);sendResponse({dataUrl:c.toDataURL("image/png")});}}
    else if (request.action === "addNote") { saveNote(); }
    return true;
});
let lastUrl = location.href; 
new MutationObserver(() => { const url = location.href; if (url !== lastUrl) { lastUrl = url; setTimeout(loadAndRenderMarkers, 2000); } }).observe(document, {subtree: true, childList: true});
setTimeout(loadAndRenderMarkers, 2000);