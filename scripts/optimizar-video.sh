#!/usr/bin/env bash
# Genera las versiones web del video del hero (sin audio) y su imagen de respaldo.
# Uso: bash scripts/optimizar-video.sh "ruta/al/video-original.MOV"
# Requiere ffmpeg con libx264 y libsvtav1.
#
# El original es vertical 4:5 (1080x1350). Salidas en video/:
#   hero-desktop.(av1.mp4|mp4)  864x1080, el cuadro completo (columna del hero en escritorio, tambien 4:5)
#   hero-mobile.(av1.mp4|mp4)   1080x1080, recorte cuadrado centrado (hero a ancho completo en tablet/movil)
# y en img/hero-video-(desktop|mobile).jpg el primer cuadro con el mismo recorte: es la imagen que se ve
# mientras carga el video o si no se reproduce (luego npm run imagenes genera sus AVIF/WebP).
set -euo pipefail

ORIGEN="${1:?Indica la ruta del video original}"
mkdir -p video

# nombre | filtro de recorte y escala
VERSIONES=(
  "hero-desktop|scale=864:1080"
  "hero-mobile|crop=w=iw:h=iw:x=0:y=(ih-oh)/2,scale=1080:1080"
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
