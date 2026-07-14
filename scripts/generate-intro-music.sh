#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP="$ROOT/assets/social/reel-scenes/music"
OUT="$ROOT/assets/social/mymealmap-intro-music.mp3"
mkdir -p "$TMP"

make_chord() {
  name=$1
  root=$2
  third=$3
  fifth=$4
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "sine=frequency=$root:duration=4.5:sample_rate=48000" \
    -f lavfi -i "sine=frequency=$third:duration=4.5:sample_rate=48000" \
    -f lavfi -i "sine=frequency=$fifth:duration=4.5:sample_rate=48000" \
    -f lavfi -i "anoisesrc=color=pink:duration=4.5:sample_rate=48000" \
    -filter_complex "[0:a]volume=0.18[a0];[1:a]volume=0.12[a1];[2:a]volume=0.09[a2];[3:a]lowpass=f=900,volume=0.012[a3];[a0][a1][a2][a3]amix=inputs=4:normalize=0,lowpass=f=2400,afade=t=in:st=0:d=0.35,afade=t=out:st=4:d=0.5[a]" \
    -map "[a]" -c:a pcm_s16le "$TMP/$name.wav"
}

make_chord c 261.63 329.63 392.00
make_chord am 220.00 261.63 329.63
make_chord f 174.61 220.00 261.63
make_chord g 196.00 246.94 293.66

printf "file '%s'\nfile '%s'\nfile '%s'\nfile '%s'\n" \
  "$TMP/c.wav" "$TMP/am.wav" "$TMP/f.wav" "$TMP/g.wav" > "$TMP/concat.txt"

ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -af "aecho=0.8:0.72:90:0.16,afade=t=in:st=0:d=0.8,afade=t=out:st=16.3:d=1.7,loudnorm=I=-20:TP=-2:LRA=5" \
  -c:a libmp3lame -b:a 192k "$OUT"

echo "Generated $OUT"
