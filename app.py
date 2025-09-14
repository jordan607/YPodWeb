from flask import Flask, render_template, request, send_from_directory, jsonify
import yt_dlp
import os
import re
import json

app = Flask(__name__)
CACHE_DIR = "cache"
META_FILE = os.path.join(CACHE_DIR, "meta.json")
os.makedirs(CACHE_DIR, exist_ok=True)

# Load or initialize metadata
if os.path.exists(META_FILE):
    with open(META_FILE, "r", encoding="utf-8") as f:
        meta = json.load(f)
else:
    meta = {}

def save_meta():
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/list')
def list_songs():
    # Clean up meta for missing files
    files = [f for f in os.listdir(CACHE_DIR) if f.endswith('.mp3')]
    result = []
    for file in files:
        entry = meta.get(file)
        if entry:
            result.append({
                "file": file,
                "title": entry.get("title", file),
                "video_id": entry.get("video_id", ""),
            })
        else:
            result.append({
                "file": file,
                "title": file,
                "video_id": "",
            })
    return jsonify(result)

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    query = data.get('query')
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'default_search': 'ytsearch1',
        'outtmpl': f'{CACHE_DIR}/%(title).80s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(query, download=True)
            title = info.get('title', 'unknown')
            video_id = info.get('id', '')
            filename = sanitize_filename(title) + '.mp3'
            meta[filename] = {"title": title, "video_id": video_id}
            save_meta()
            return jsonify({'success': True, 'filename': filename})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/songs/<path:filename>')
def serve_song(filename):
    return send_from_directory(CACHE_DIR, filename)

@app.route('/delete/<path:filename>', methods=['DELETE'])
def delete_song(filename):
    file_path = os.path.join(CACHE_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        meta.pop(filename, None)
        save_meta()
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)