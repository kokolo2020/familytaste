#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CHROME=${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}
SCENE_HTML="file://$ROOT/assets/social/reel-scenes/scenes.html"
OUT="$ROOT/assets/social"
TMP="$OUT/reel-scenes/rendered"
MUSIC=${1:-$OUT/mymealmap-intro-music.mp3}

mkdir -p "$TMP"

render_scene() {
  name=$1
  size=$2
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --screenshot="$TMP/$name.png" --window-size="$size" "$SCENE_HTML?scene=$name"
}

if [ "${SKIP_SCENES:-0}" != "1" ]; then
  render_scene 1 1080,1920
  render_scene 2 1080,1920
  render_scene 3 1080,1920
  render_scene 4 1080,1920
  render_scene 5 1080,1920
  render_scene cover 1080,1680
  render_scene share 1200,630
fi

cp "$TMP/cover.png" "$OUT/mymealmap-intro-cover.png"
cp "$TMP/share.png" "$OUT/mymealmap-share.png"

make_clip() {
  scene=$1
  frames=$2
  zoom=$3
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$TMP/$scene.png" \
    -vf "zoompan=z='min(zoom+$zoom,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=1080x1920:fps=30,format=yuv420p" \
    -frames:v "$frames" -an -c:v libx264 -preset medium -crf 18 "$TMP/clip-$scene.mp4"
}

make_clip 1 75 0.00045
make_clip 2 120 0.00028
make_clip 3 150 0.00022
make_clip 4 120 0.0003
make_clip 5 135 0.00032

ffmpeg -hide_banner -loglevel error -y \
  -i "$TMP/clip-1.mp4" -i "$TMP/clip-2.mp4" -i "$TMP/clip-3.mp4" -i "$TMP/clip-4.mp4" -i "$TMP/clip-5.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=2[v1];[v1][2:v]xfade=transition=fade:duration=0.5:offset=5.5[v2];[v2][3:v]xfade=transition=fade:duration=0.5:offset=10[v3];[v3][4:v]xfade=transition=fade:duration=0.5:offset=13.5,format=yuv420p[v]" \
  -map "[v]" -t 18 -an -c:v libx264 -preset medium -crf 18 -movflags +faststart "$TMP/silent.mp4"

if [ -f "$MUSIC" ]; then
  ffmpeg -hide_banner -loglevel error -y -i "$TMP/silent.mp4" -stream_loop -1 -i "$MUSIC" \
    -filter_complex "[1:a]atrim=0:18,afade=t=in:st=0:d=0.7,afade=t=out:st=16.2:d=1.8,volume=0.28[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT/mymealmap-intro-reel.mp4"
else
  cp "$TMP/silent.mp4" "$OUT/mymealmap-intro-reel.mp4"
fi

echo "Rendered $OUT/mymealmap-intro-reel.mp4"
