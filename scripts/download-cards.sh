#!/bin/bash
# Download all 78 Rider-Waite tarot card images from Wikimedia Commons
# Images are public domain (Pamela Colman Smith, 1909)

OUTDIR="/Users/lyc/Desktop/code/tarot/public/cards"
mkdir -p "$OUTDIR"
DELAY=2
WIDTH=300

# Each line: local_name|wikimedia_path
CARD_LIST="
00-fool|9/90/RWS_Tarot_00_Fool.jpg
01-magician|d/de/RWS_Tarot_01_Magician.jpg
02-high-priestess|8/88/RWS_Tarot_02_High_Priestess.jpg
03-empress|d/d2/RWS_Tarot_03_Empress.jpg
04-emperor|c/c3/RWS_Tarot_04_Emperor.jpg
05-hierophant|8/8d/RWS_Tarot_05_Hierophant.jpg
06-lovers|3/3a/RWS_Tarot_06_Lovers.jpg
07-chariot|9/9b/RWS_Tarot_07_Chariot.jpg
08-strength|f/f5/RWS_Tarot_08_Strength.jpg
09-hermit|4/4d/RWS_Tarot_09_Hermit.jpg
10-wheel-of-fortune|3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg
11-justice|e/e0/RWS_Tarot_11_Justice.jpg
12-hanged-man|2/2b/RWS_Tarot_12_Hanged_Man.jpg
13-death|d/d7/RWS_Tarot_13_Death.jpg
14-temperance|f/f8/RWS_Tarot_14_Temperance.jpg
15-devil|5/55/RWS_Tarot_15_Devil.jpg
16-tower|5/53/RWS_Tarot_16_Tower.jpg
17-star|d/db/RWS_Tarot_17_Star.jpg
18-moon|7/7f/RWS_Tarot_18_Moon.jpg
19-sun|1/17/RWS_Tarot_19_Sun.jpg
20-judgement|d/d7/RWS_Tarot_20_Judgement.jpg
21-world|f/ff/RWS_Tarot_21_World.jpg
wands-01|1/11/Wands01.jpg
wands-02|0/0f/Wands02.jpg
wands-03|f/ff/Wands03.jpg
wands-04|a/a4/Wands04.jpg
wands-05|9/9d/Wands05.jpg
wands-06|3/3b/Wands06.jpg
wands-07|e/e4/Wands07.jpg
wands-08|6/6b/Wands08.jpg
wands-09|e/e7/Wands09.jpg
wands-10|0/0b/Wands10.jpg
wands-11|6/6a/Wands11.jpg
wands-12|1/16/Wands12.jpg
wands-13|0/0d/Wands13.jpg
wands-14|c/ce/Wands14.jpg
cups-01|3/36/Cups01.jpg
cups-02|f/f8/Cups02.jpg
cups-03|7/7a/Cups03.jpg
cups-04|3/35/Cups04.jpg
cups-05|d/d7/Cups05.jpg
cups-06|1/17/Cups06.jpg
cups-07|a/ae/Cups07.jpg
cups-08|6/60/Cups08.jpg
cups-09|2/24/Cups09.jpg
cups-10|8/84/Cups10.jpg
cups-11|a/ad/Cups11.jpg
cups-12|f/fa/Cups12.jpg
cups-13|6/62/Cups13.jpg
cups-14|0/04/Cups14.jpg
swords-01|1/1a/Swords01.jpg
swords-02|9/9e/Swords02.jpg
swords-03|0/02/Swords03.jpg
swords-04|b/bf/Swords04.jpg
swords-05|2/23/Swords05.jpg
swords-06|2/29/Swords06.jpg
swords-07|3/34/Swords07.jpg
swords-08|a/a7/Swords08.jpg
swords-09|2/2f/Swords09.jpg
swords-10|d/d4/Swords10.jpg
swords-11|4/4c/Swords11.jpg
swords-12|b/b0/Swords12.jpg
swords-13|d/d4/Swords13.jpg
swords-14|3/33/Swords14.jpg
pentacles-01|f/fd/Pents01.jpg
pentacles-02|9/9f/Pents02.jpg
pentacles-03|4/42/Pents03.jpg
pentacles-04|3/35/Pents04.jpg
pentacles-05|9/96/Pents05.jpg
pentacles-06|a/a6/Pents06.jpg
pentacles-07|6/6a/Pents07.jpg
pentacles-08|4/49/Pents08.jpg
pentacles-09|f/f0/Pents09.jpg
pentacles-10|4/42/Pents10.jpg
pentacles-11|e/ec/Pents11.jpg
pentacles-12|d/d5/Pents12.jpg
pentacles-13|8/88/Pents13.jpg
pentacles-14|1/1c/Pents14.jpg
"

SUCCESS=0
FAIL=0
TOTAL=0

echo "$CARD_LIST" | while IFS='|' read -r name path; do
  # skip empty lines
  [ -z "$name" ] && continue
  TOTAL=$((TOTAL + 1))

  url="https://upload.wikimedia.org/wikipedia/commons/${path}"
  outfile="${OUTDIR}/${name}.jpg"

  # Skip if already downloaded successfully
  if [ -f "$outfile" ]; then
    ftype=$(file -b "$outfile")
    if echo "$ftype" | grep -qi "jpeg\|image"; then
      echo "SKIP  ${name}"
      SUCCESS=$((SUCCESS + 1))
      continue
    fi
  fi

  printf "GET   %-25s ... " "$name"
  curl -sL --max-time 30 --connect-timeout 10 \
    -H "User-Agent: TarotApp/1.0 (educational project; lyc@example.com)" \
    -o "$outfile" "$url"

  ftype=$(file -b "$outfile" 2>/dev/null)
  if echo "$ftype" | grep -qi "jpeg\|image"; then
    sips -Z $WIDTH "$outfile" --out "$outfile" >/dev/null 2>&1
    size=$(du -h "$outfile" | cut -f1)
    echo "OK (${size})"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "FAIL"
    rm -f "$outfile"
    FAIL=$((FAIL + 1))
  fi

  sleep $DELAY
done

echo ""
ACTUAL=$(ls "$OUTDIR"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "Done: ${ACTUAL} images in ${OUTDIR}"
