// content.js (V2.0 - Sıkıştırılmış Görsel Notlar)

// --- CSS STİLLERİ ---
const styles = `
  .yt-linker-marker {
    position: absolute; top: 0; bottom: 0; width: 4px;
    background-color: #FFD700; z-index: 999; cursor: pointer; pointer-events: auto;
    box-shadow: 1px 0 2px rgba(0,0,0,0.5); transition: transform 0.1s;
  }
  .yt-linker-marker:hover { transform: scaleY(1.5); background-color: #FF4500; }
  #yt-linker-tooltip {
    position: absolute; background: rgba(0,0,0,0.9); color: white; padding: 8px 12px;
    border-radius: 4px; font-size: 13px; font-family: Roboto, Arial; pointer-events: none;
    z-index: 10000; white-space: nowrap; box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    border: 1px solid #444; display: none;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

let tooltipDiv = document.createElement('div');
tooltipDiv.id = 'yt-linker-tooltip';
document.body.appendChild(tooltipDiv);

// --- GLOBAL DEĞİŞKENLER ---
let latestScreenshot = null;

// --- YARDIMCI FONKSİYONLAR ---
function showNotification(message, type = "success") {
  const oldDiv = document.getElementById("yt-linker-toast"); if (oldDiv) oldDiv.remove();
  const div = document.createElement("div"); div.id = "yt-linker-toast"; div.textContent = message;
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

function getVideoData() {
  try {
    let title = "";
    const titleElement = document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string");
    if (titleElement && titleElement.textContent) title = titleElement.textContent;
    if (!title) title = document.querySelector('meta[name="title"]')?.content;
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

// --- GÖRÜNTÜ İŞLEME FONKSİYONU (YENİ) ---
function compressImage(videoElement) {
    // Orijinal boyutlar
    let width = videoElement.videoWidth;
    let height = videoElement.videoHeight;
    
    // Eğer video 4K veya çok büyükse, not için küçültelim (Maks genişlik 800px yeterli)
    // Bu işlem dosya boyutunu %90 azaltır!
    const MAX_WIDTH = 800;
    if (width > MAX_WIDTH) {
        const scaleFactor = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = height * scaleFactor;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, width, height);

    // JPEG formatında, 0.6 (orta) kalitede kaydet
    return canvas.toDataURL("image/jpeg", 0.6);
}

// --- NOT SİSTEMİ ---
function loadAndRenderMarkers() {
  const videoID = getVideoID(); if (!videoID) return;
  document.querySelectorAll('.yt-linker-marker').forEach(el => el.remove());

  chrome.storage.local.get([videoID], (result) => {
    let data = result[videoID];
    let notes = [];
    if (Array.isArray(data)) notes = data;
    else if (data && data.notes) notes = data.notes;

    const progressBar = document.querySelector('.ytp-progress-bar');
    const videoElement = document.querySelector('video');

    if (!progressBar || !videoElement || isNaN(videoElement.duration)) {
      setTimeout(loadAndRenderMarkers, 1000); return;
    }
    const duration = videoElement.duration;

    notes.forEach((note) => {
      const positionPercent = (note.time / duration) * 100;
      const marker = document.createElement('div');
      marker.className = 'yt-linker-marker';
      marker.style.left = positionPercent + '%';
      
      marker.addEventListener('mouseenter', () => {
        const hasImg = note.image ? " 📷" : "";
        tooltipDiv.textContent = `${formatTime(note.time)} - ${note.text}${hasImg}`;
        tooltipDiv.style.display = 'block';
        const rect = marker.getBoundingClientRect();
        tooltipDiv.style.left = (rect.left - (tooltipDiv.offsetWidth / 2)) + 'px';
        tooltipDiv.style.top = (rect.top - 40) + 'px';
      });
      marker.addEventListener('mouseleave', () => { tooltipDiv.style.display = 'none'; });
      marker.addEventListener('click', (e) => { e.stopPropagation(); videoElement.currentTime = note.time; });
      marker.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        const newText = prompt("Notu düzenle:", note.text);
        if (newText !== null) { updateOrDeleteNote(videoID, note.time, newText); }
      });

      progressBar.appendChild(marker);
    });
  });
}

function updateOrDeleteNote(videoID, time, newText) {
    chrome.storage.local.get([videoID], (result) => {
        let data = result[videoID];
        let notes = []; let title = ""; let url = "";
        if (Array.isArray(data)) { notes = data; } 
        else if (data) { notes = data.notes; title = data.title; url = data.url; }

        if (newText.trim() === "") {
             notes = notes.filter(n => n.time !== time);
             showNotification("🗑️ Not Silindi", "error");
        } else {
             const targetIndex = notes.findIndex(n => n.time === time);
             if (targetIndex > -1) {
                  notes[targetIndex].text = newText;
                  showNotification("✏️ Not Güncellendi");
             }
        }
        const saveData = { title: title, url: url, notes: notes };
        chrome.storage.local.set({ [videoID]: saveData }, () => { loadAndRenderMarkers(); });
    });
}

function saveNote() {
  const videoData = getVideoData(); 
  const videoID = getVideoID();
  if (!videoData || !videoID) { showNotification("❌ Video bulunamadı!", "error"); return; }

  const videoElement = document.querySelector('video');
  const currentTime = videoElement.currentTime;
  videoElement.pause(); 

  const noteText = prompt(`Bu saniye (${formatTime(currentTime)}) için notunuz:`);

  if (noteText) {
    chrome.storage.local.get([videoID], (result) => {
      let data = result[videoID];
      let notes = [];
      if (Array.isArray(data)) notes = data; 
      else if (data) notes = data.notes;

      const newNote = { time: currentTime, text: noteText };
      if (latestScreenshot) {
          newNote.image = latestScreenshot;
          latestScreenshot = null;
      }
      notes.push(newNote);
      
      const saveData = { title: videoData.title, url: videoData.baseUrl, notes: notes };

      chrome.storage.local.set({ [videoID]: saveData }, () => {
        const msg = newNote.image ? "✅ Not + Resim Kaydedildi!" : "✅ Not Kaydedildi!";
        showNotification(msg);
        loadAndRenderMarkers();
      });
    });
  }
  videoElement.play(); 
}

// --- CORE FONKSİYONLAR ---
async function performCopyLink() { const d=getVideoData(); if(!d)return; const t=formatTime(d.currentTime);const url=`${d.baseUrl}&t=${Math.floor(d.currentTime)}s`;const txt=`"${d.title}" dakika: ${t}`;const h=`<a href="${url}">${txt}</a>`;const p=`${txt}\n${url}`;await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([h],{type:'text/html'}),'text/plain':new Blob([p],{type:'text/plain'})})]);showNotification("✅ Link Kopyalandı!");}

async function performScreenshot() {
  const v = document.querySelector('video');
  if (!v) return;
  
  // 1. Tam kaliteyi panoya kopyalamak için (Canvas)
  const c = document.createElement("canvas");
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(v, 0, 0);
  
  c.toBlob(async(b)=>{
    await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);
    showNotification("📸 Ekran Görüntüsü Kopyalandı!");
  },'image/png');

  // 2. Notlar için SIKIŞTIRILMIŞ veriyi hafızaya al (JPEG + Resize)
  // Bu fonksiyon yukarıda tanımladığımız yeni fonksiyon
  latestScreenshot = compressImage(v); 
}

async function performGenQR() { const d=getVideoData();if(!d)return;const u=`${d.baseUrl}&t=${Math.floor(d.currentTime)}s`;const t=document.createElement("div");t.style.position="absolute";t.style.left="-9999px";document.body.appendChild(t);new QRCode(t,{text:u,width:256,height:256,correctLevel:QRCode.CorrectLevel.H});setTimeout(()=>{const c=t.querySelector("canvas");if(c)c.toBlob(async(b)=>{await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);showNotification("📱 QR Kod Kopyalandı!");t.remove();});},100);}

// --- LISTENERS ---
document.addEventListener('keydown', (event) => {
  if (!event.altKey) return;
  if (event.code === 'KeyC') { event.preventDefault(); performCopyLink(); }
  if (event.code === 'KeyS') { event.preventDefault(); performScreenshot(); }
  if (event.code === 'KeyQ') { event.preventDefault(); performGenQR(); }
  if (event.code === 'KeyA') { event.preventDefault(); saveNote(); }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVideoDetails") { const d = getVideoData(); sendResponse({title:d.title,currentTime:d.currentTime,videoUrl:d.baseUrl}); }
    else if (request.action === "captureScreenshot") { 
        const v = document.querySelector('video'); 
        if(v){
            // Popup'a gönderirken de sıkıştırılmış yollayabiliriz ama 
            // popup'ta net görünmesi için full kalite yollayalım
            const c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
            const fullData = c.toDataURL("image/png");
            
            // Ama not için hafızaya sıkıştırılmış alalım
            latestScreenshot = compressImage(v);
            
            sendResponse({dataUrl: fullData});
        }
    }
    else if (request.action === "addNote") { saveNote(); }
    return true;
});
let lastUrl = location.href; 
new MutationObserver(() => { const url = location.href; if (url !== lastUrl) { lastUrl = url; setTimeout(loadAndRenderMarkers, 2000); } }).observe(document, {subtree: true, childList: true});
setTimeout(loadAndRenderMarkers, 2000);