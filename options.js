// options.js (v2.3 - Akıllı Görünüm)

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderLibrary() {
    const container = document.getElementById('library-container');
    
    // Depolama bilgisi
    chrome.storage.local.getBytesInUse(null, (bytes) => {
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        const infoDiv = document.getElementById('storage-info');
        if(infoDiv) {
            infoDiv.textContent = `Depolama: ${mb} MB`;
            infoDiv.style.color = bytes > 50 * 1024 * 1024 ? 'orange' : '#888';
        }
    });

    chrome.storage.local.get(null, (items) => {
        const videoIDs = Object.keys(items);
        
        if (videoIDs.length === 0) {
            container.innerHTML = '<div class="no-notes">Henüz kaydedilmiş not yok...</div>';
            return;
        }

        container.innerHTML = '';

        videoIDs.forEach(videoID => {
            const data = items[videoID];
            if (!data) return;

            let notes = []; let title = "İsimsiz Video"; let url = `https://www.youtube.com/watch?v=${videoID}`;
            if (Array.isArray(data)) { notes = data; title = `Video ID: ${videoID}`; } 
            else { notes = data.notes || []; title = data.title || `Video ID: ${videoID}`; url = data.url || url; }

            if (notes.length === 0) return;

            // Video Bloğu
            const block = document.createElement('div');
            block.className = 'video-block';

            // Başlık
            const header = document.createElement('div');
            header.className = 'video-header';
            const link = document.createElement('a'); link.href = url; link.className = 'video-link'; link.textContent = `📺 ${title}`; link.target = "_blank";
            const deleteBtn = document.createElement('button'); deleteBtn.className = 'btn-delete'; deleteBtn.textContent = 'Sil';
            deleteBtn.onclick = () => { if(confirm('Silinsin mi?')) { chrome.storage.local.remove(videoID, () => renderLibrary()); } };

            header.appendChild(link); header.appendChild(deleteBtn); block.appendChild(header);

            // Liste
            const ul = document.createElement('ul');
            ul.className = 'note-list';

            notes.sort((a, b) => a.time - b.time);

            notes.forEach(note => {
                const li = document.createElement('li');
                li.className = 'note-item';

                // Kontrol: Açıklama var mı?
                const hasDesc = note.description && note.description.trim() !== "";

                // 1. Satır: Header
                const headerRow = document.createElement('div');
                headerRow.className = 'note-header-row';

                const timeLink = document.createElement('a');
                timeLink.href = `${url}&t=${Math.floor(note.time)}s`;
                timeLink.className = 'timestamp-link';
                timeLink.textContent = formatTime(note.time);
                timeLink.target = "_blank";

                const contentDiv = document.createElement('div');
                contentDiv.className = 'note-content';

                const textSpan = document.createElement('span');
                textSpan.className = 'note-text';
                textSpan.textContent = note.text;
                contentDiv.appendChild(textSpan);

                if (note.image) {
                    const img = document.createElement('img');
                    img.src = note.image; img.className = 'note-image';
                    img.style.height = "30px"; 
                    img.style.width = "auto";
                    img.title = "Resmi Büyüt";
                    img.onclick = () => { const w = window.open(""); w.document.write('<img src="' + note.image + '" style="max-width:100%"/>'); };
                    contentDiv.appendChild(img);
                }

                // Buton
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'btn-toggle-desc';
                toggleBtn.innerHTML = '📝';
                toggleBtn.title = "Detaylı açıklama ekle/düzenle";
                
                // YENİ MANTIK: Eğer açıklama varsa butonu "Aktif" ve "Dolu" yap
                if (hasDesc) {
                    toggleBtn.classList.add('has-content'); // Turuncu yap
                    toggleBtn.classList.add('active');      // Mavi yap (Açık durumu)
                    toggleBtn.title = "Açıklamayı gizle";
                }

                headerRow.appendChild(timeLink);
                headerRow.appendChild(contentDiv);
                headerRow.appendChild(toggleBtn);

                // 2. Satır: Açıklama Kutusu
                const descArea = document.createElement('textarea');
                descArea.className = 'note-description';
                descArea.placeholder = 'Detaylı açıklama ekle...';
                descArea.maxLength = 250;
                descArea.value = note.description || "";

                // YENİ MANTIK: Eğer açıklama varsa kutuyu GÖSTER (block), yoksa GİZLE (none)
                descArea.style.display = hasDesc ? 'block' : 'none';

                // Butona Tıklama Olayı
                toggleBtn.onclick = () => {
                    if (descArea.style.display === 'block') {
                        descArea.style.display = 'none'; // Gizle
                        toggleBtn.classList.remove('active');
                    } else {
                        descArea.style.display = 'block'; // Göster
                        toggleBtn.classList.add('active');
                        descArea.focus();
                    }
                };

                // Kayıt Olayı
                descArea.addEventListener('change', () => {
                    saveDescription(videoID, note.time, descArea.value);
                    
                    // İkon durumunu güncelle
                    if (descArea.value.trim() !== "") {
                        toggleBtn.classList.add('has-content');
                    } else {
                        toggleBtn.classList.remove('has-content');
                    }
                    
                    descArea.style.borderColor = "green";
                    setTimeout(() => descArea.style.borderColor = "#e0e0e0", 1000);
                });

                li.appendChild(headerRow);
                li.appendChild(descArea);
                ul.appendChild(li);
            });

            block.appendChild(ul);
            container.appendChild(block);
        });
        
        const searchInput = document.getElementById('search-input');
        if(searchInput) { searchInput.value = ""; setupSearch(); }
    });
}

function saveDescription(videoID, time, newDesc) {
    chrome.storage.local.get([videoID], (result) => {
        let data = result[videoID];
        if (!data) return;
        let notes = Array.isArray(data) ? data : data.notes;
        let title = Array.isArray(data) ? "" : data.title;
        let url = Array.isArray(data) ? "" : data.url;

        const targetIndex = notes.findIndex(n => n.time === time);
        if (targetIndex > -1) {
             notes[targetIndex].description = newDesc;
             const saveData = { title: title, url: url, notes: notes };
             chrome.storage.local.set({ [videoID]: saveData });
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const noResultMsg = document.getElementById('no-result-msg');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const blocks = document.querySelectorAll('.video-block');
        let hasVisibleItem = false;

        blocks.forEach(block => {
            const text = block.innerText.toLowerCase();
            const textareas = block.querySelectorAll('textarea');
            let descMatch = false;
            textareas.forEach(ta => {
                if (ta.value.toLowerCase().includes(searchTerm)) descMatch = true;
            });

            if (text.includes(searchTerm) || descMatch) {
                block.style.display = "block";
                hasVisibleItem = true;
            } else {
                block.style.display = "none";
            }
        });

        if(noResultMsg) noResultMsg.style.display = (!hasVisibleItem && blocks.length > 0) ? "block" : "none";
    });
}

document.addEventListener('DOMContentLoaded', renderLibrary);