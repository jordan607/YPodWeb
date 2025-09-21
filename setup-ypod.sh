#!/data/data/com.termux/files/usr/bin/bash

echo "🎵 Starting YPodWeb Auto Installer for Termux..."

# Step 1: Update packages
echo "🔄 Updating packages..."
pkg update -y && pkg upgrade -y

# Step 2: Install dependencies
echo "📦 Installing Python, Git, and FFmpeg..."
pkg install -y python git ffmpeg

# Step 3: Optional - Storage permission
echo "📂 Requesting storage permission..."
termux-setup-storage

# Step 4: Clone the repository
echo "📥 Cloning YPodWeb from GitHub..."
git clone https://github.com/jordan607/YPodWeb.git

# Step 5: Navigate into project
cd YPodWeb || exit

# Step 6: Install Python dependencies
echo "🐍 Installing Python requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 7: Launch the app
echo "🚀 Starting YPodWeb server on http://127.0.0.1:5000 ..."
python app.py
