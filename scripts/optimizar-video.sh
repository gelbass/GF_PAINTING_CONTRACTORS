#!/usr/bin/env bash
# Genera las versiones web del video del hero (sin audio) y su imagen de respaldo.
# Uso: bash scripts/optimizar-video.sh "ruta/al/video-original.MOV"
# Requiere ffmpeg con libx264 y libsvtav1.
#
# Salidas en video/:
#   hero-desktop.(av1.mp4|mp4)  864x1080, recorte vertical (columna del hero en escritorio)
#   hero-mobile.(av1.mp4|mp4)   1080x1080, recorte cuadrado (hero a ancho completo en tablet/movil)
# El recorte no es fijo: en cada escena sigue a las personas (ver ESCENAS).
# y en img/hero-video-(desktop|mobile).jpg el primer cuadro con el mismo recorte: es la imagen que se ve
# mientras carga el video o si no se reproduce (luego npm run imagenes genera sus AVIF/WebP).
set -euo pipefail

ORIGEN="${1:?Indica la ruta del video original}"
mkdir -p video

# Encuadre por escena del video original: inicio fin centro_inicial centro_final, en segundos y en
# fraccion del ancho (0 = borde izquierdo, 1 = derecho). Dentro de la escena el encuadre se desplaza
# suavemente del centro inicial al final. Si cambia el video, hay que revisar estos valores.
ESCENAS=(
  "0 3 0.62 0.62"
  "3 5.8667 0.47 0.60"
  "5.8667 10.1333 0.29 0.29"
  "10.1333 13.1333 0.38 0.32"
  "13.1333 16.1333 0.45 0.50"
  "16.1333 20.3 0.42 0.48"
)

# Arma la expresion de ffmpeg del centro del encuadre en funcion del tiempo t
centro="0.5"
for ((i = ${#ESCENAS[@]} - 1; i >= 0; i--)); do
  read -r ini fin c0 c1 <<< "${ESCENAS[$i]}"
  centro="if(lt(t,$fin),$c0+($c1-$c0)*(t-$ini)/($fin-$ini),$centro)"
done
recorte() { echo "crop=w=$1:h=ih:x='max(0,min(iw-ow,($centro)*iw-ow/2))':y=0"; }

# nombre | filtro de recorte y escala
VERSIONES=(
  "hero-desktop|$(recorte 'ih*0.8'),scale=864:1080"
  "hero-mobile|$(recorte 'ih'),scale=1080:1080"
)

for v in "${VERSIONES[@]}"; do
  nombre="${v%%|*}"
  filtro="${v#*|},fps=30,format=yuv420p"

  ffmpeg -v error -y -i "$ORIGEN" -frames:v 1 -vf "${v#*|}" -q:v 3 "img/${nombre/hero-/hero-video-}.jpg"

  # AV1: el mas liviano; lo usan Chrome, Edge, Firefox y los iPhone/Mac con decodificador AV1.
  SVT_LOG=1 ffmpeg -v error -y -i "$ORIGEN" -an -vf "$filtro" \
    -c:v libsvtav1 -preset 4 -crf 30 -g 60 -svtav1-params tune=0 \
    -movflags +faststart "video/$nombre.av1.mp4"

  # H.264: respaldo universal (todos los iPhone, Safari antiguo, Android antiguo).
  ffmpeg -v error -y -i "$ORIGEN" -an -vf "$filtro" \
    -c:v libx264 -preset slow -crf 23 -profile:v high -level 4.0 -g 60 \
    -movflags +faststart "video/$nombre.mp4"

  ls -l "video/$nombre".*
done
