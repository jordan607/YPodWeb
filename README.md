🎧 YPodWeb on Android (Termux)

YPodWeb is a lightweight YouTube audio streaming and caching web app that you can run entirely on your Android device using Termux
. It turns your phone into a local Spotify-style player—no root, no downloads from Play Store required.

📲 Features

🎵 Stream YouTube audio with title and thumbnail

📥 Cache songs locally for offline playback

🌐 Use any mobile browser via http://127.0.0.1:5000

❤️ Favorites saved via browser localStorage

🧹 Delete cached songs

🎚 Volume and seek slider controls

⚙️ Installation Steps (One-time Setup)
1. Install Termux

Download from F-Droid
 (recommended)

Run it once and give storage permissions:

termux-setup-storage

2. Copy-paste and run this script in Termux:
pkg update -y && pkg upgrade -y
pkg install -y python git ffmpeg
git clone https://github.com/jordan607/YPodWeb.git
cd YPodWeb
pip install --upgrade pip
pip install -r requirements.txt
python app.py


🔁 You only need to do this once. Next time, just run:

cd YPodWeb && python app.py

🖥 Access in Browser

Open Chrome (or any browser) on your phone

Visit: http://127.0.0.1:5000

Add it to your home screen for a Spotify-style experience

🛠 How It Works

Uses yt_dlp to stream/download audio from YouTube

Flask serves the local website

FFmpeg handles conversion

static/cache/ stores downloaded .mp3 files

Everything is local — no external servers or accounts

📁 Files & Structure
YPodWeb/
├── app.py                # Flask server
├── templates/index.html  # Main HTML UI
├── static/
│   ├── js/               # Frontend logic
│   ├── css/              # Styling
│   └── cache/            # Saved songs
└── requirements.txt      # Python dependencies

⚠️ Notes

Some YouTube videos might fail to download due to CAPTCHA or login restrictions. This is a YouTube limitation.

Performance may vary depending on your device's specs.
