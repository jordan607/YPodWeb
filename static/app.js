let audio = new Audio();
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let playlistData = [];
let currentIndex = -1;
let isPlaying = false;
let viewMode = 'all'; // 'all' or 'favourites'

function setSidebarSelection() {
  document.getElementById('sidebar-all').classList.toggle('selected', viewMode === 'all');
  document.getElementById('sidebar-fav').classList.toggle('selected', viewMode === 'favourites');
}

document.getElementById('sidebar-all').onclick = function() {
  viewMode = 'all';
  setSidebarSelection();
  document.getElementById('playlist-title').textContent = 'All Songs';
  fetchPlaylist();
};
document.getElementById('sidebar-fav').onclick = function() {
  viewMode = 'favourites';
  setSidebarSelection();
  document.getElementById('playlist-title').textContent = 'Favourites';
  fetchPlaylist();
};

function updatePlayerBar() {
  const bar = document.getElementById('player-bar');
  const nowPlaying = document.getElementById('now-playing');
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (currentIndex >= 0 && files[currentIndex]) {
    const song = playlistData.find(s => s.file === files[currentIndex]);
    nowPlaying.textContent = song ? song.title : '';
    bar.style.display = 'flex';
    document.getElementById('playpause-btn').innerHTML = isPlaying ? '&#10073;&#10073;' : '&#9654;';
  } else {
    bar.style.display = 'none';
  }
}

// document.getElementById("volume").oninput = e => {
//   audio.volume = e.target.value;
//   document.getElementById("bar-volume").value = e.target.value;
// };
document.getElementById("bar-volume").oninput = e => {
  audio.volume = e.target.value;
  document.getElementById("bar-volume").value = e.target.value;
};

audio.ontimeupdate = () => {
  const progress = document.getElementById("progress");
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  } else {
    progress.value = 0;
  }
};

audio.onplay = () => {
  isPlaying = true;
  updatePlayerBar();
};
audio.onpause = () => {
  isPlaying = false;
  updatePlayerBar();
};

audio.onended = () => {
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (files.length > 0) {
    if (currentIndex + 1 < files.length) {
      playByIndex(currentIndex + 1);
    } else {
      // Loop back to first song
      playByIndex(0);
    }
  } else {
    isPlaying = false;
    updatePlayerBar();
  }
};

function toggleTheme() { 
  const body = document.body;
  const btn = document.getElementById('theme-toggle');
  body.classList.toggle('light');
  const light = body.classList.contains('light');
  btn.textContent = light ? '🌙' : '☀️';
  localStorage.setItem('theme', light ? 'light' : 'dark');
}

function fetchPlaylist() {
  fetch('/list').then(res => res.json()).then(data => {
    playlistData = data;
    const pl = document.getElementById('playlist');
    pl.innerHTML = '';
    let files = [];
    if (viewMode === 'favourites') {
      files = data.filter(song => favorites.includes(song.title)).map(song => song.file);
    } else { // 'all'
      files = data.map(song => song.file);
    }
    files.forEach((file, idx) => {
      const song = data.find(s => s.file === file);
      if (!song) return;
      const isFav = favorites.includes(song.title);
      const div = document.createElement('div');
      div.className = 'song';
      div.innerHTML = `
        <img class="thumb" src="https://img.youtube.com/vi/${song.video_id}/default.jpg">
        <div class="song-info">
          <span class="song-title">${song.title}</span>
        </div>
        <div class="song-actions">
          <button title="Play" onclick="playByIndex(${idx})">&#9654;</button>
          <button title="Delete" onclick="remove('${song.file}')">&#128465;</button>
          <button title="Favorite" class="fav" onclick="toggleFavorite('${song.title}', this)">${isFav ? '★' : '☆'}</button>
        </div>
      `;
      pl.appendChild(div);
    });
  });
}

function download() {
  const query = document.getElementById('query').value;
  fetch('/download', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ query })
  }).then(() => {
    setTimeout(fetchPlaylist, 2000); // Wait briefly for download
  });
}

function playByIndex(idx) {
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (idx >= 0 && idx < files.length) {
    const song = playlistData.find(s => s.file === files[idx]);
    if (song) {
      currentIndex = idx;
      audio.src = `/songs/${song.file}`;
      audio.play();
      updatePlayerBar();
    }
  }
}

function remove(file) {
  fetch('/delete/' + encodeURIComponent(file), { method: 'DELETE' }).then(fetchPlaylist);
}

function toggleFavorite(title, btn) {
  if (favorites.includes(title)) {
    favorites = favorites.filter(t => t !== title);
    btn.innerText = '☆';
  } else {
    favorites.push(title);
    btn.innerText = '★';
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  fetchPlaylist();
}

document.getElementById('playpause-btn').onclick = function() {
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (audio.src) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  } else if (files.length > 0) {
    playByIndex(0);
  }
};
document.getElementById('prev-btn').onclick = function() {
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (currentIndex > 0) playByIndex(currentIndex - 1);
};
document.getElementById('next-btn').onclick = function() {
  let files = [];
  if (viewMode === 'favourites') {
    files = playlistData.filter(song => favorites.includes(song.title)).map(song => song.file);
  } else { // 'all'
    files = playlistData.map(song => song.file);
  }
  if (files.length === 0) return;
  if (currentIndex + 1 < files.length) {
    playByIndex(currentIndex + 1);
  } else {
    // Loop to first song
    playByIndex(0);
  }
};

window.onload = function() {
  setSidebarSelection();
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
    document.getElementById('theme-toggle').textContent = '🌙';
  } else {
    document.getElementById('theme-toggle').textContent = '☀️';
  }
  fetchPlaylist();
};