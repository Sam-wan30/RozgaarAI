const exportWidth = 1536;
const exportHeight = 1024;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatSlideNumber(value) {
  return String(value).padStart(2, "0");
}

export function createPlaceholderSvg(slide, { width = exportWidth, height = exportHeight } = {}) {
  const slideNumber = formatSlideNumber(slide.id);
  const path = slide.suggestedPath || `/presentation/slides/slide-${slideNumber}.webp`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8fbff"/>
          <stop offset="0.52" stop-color="#eef8f5"/>
          <stop offset="1" stop-color="#ffffff"/>
        </linearGradient>
        <radialGradient id="blue" cx="20%" cy="18%" r="58%">
          <stop offset="0" stop-color="#38bdf8" stop-opacity="0.34"/>
          <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="green" cx="82%" cy="80%" r="60%">
          <stop offset="0" stop-color="#22c55e" stop-opacity="0.27"/>
          <stop offset="1" stop-color="#22c55e" stop-opacity="0"/>
        </radialGradient>
        <pattern id="dots" width="38" height="38" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#2563eb" opacity="0.16"/>
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#0f172a" flood-opacity="0.13"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" rx="34" fill="url(#base)"/>
      <rect width="${width}" height="${height}" rx="34" fill="url(#blue)"/>
      <rect width="${width}" height="${height}" rx="34" fill="url(#green)"/>
      <rect width="${width}" height="${height}" rx="34" fill="url(#dots)"/>
      <rect x="78" y="74" width="${width - 156}" height="${height - 148}" rx="30" fill="#ffffff" opacity="0.66" stroke="#bfdbfe" stroke-width="2" filter="url(#shadow)"/>
      <text x="132" y="162" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="800">RozgaarAI Pitch Deck</text>
      <text x="${width - 132}" y="162" fill="#2563eb" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="900" text-anchor="end">${slideNumber}</text>
      <line x1="132" y1="206" x2="${width - 132}" y2="206" stroke="#dbeafe" stroke-width="3"/>
      <text x="${width / 2}" y="438" fill="#0f172a" font-family="Manrope, Inter, Arial, sans-serif" font-size="78" font-weight="900" text-anchor="middle">${escapeXml(slide.title)}</text>
      <text x="${width / 2}" y="534" fill="#2563eb" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" text-anchor="middle">Slide image will be added here</text>
      <text x="${width / 2}" y="606" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle">Recommended image ratio: 3:2 (1536 x 1024)</text>
      <text x="${width / 2}" y="674" fill="#0f766e" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800" text-anchor="middle">${escapeXml(path)}</text>
      <rect x="754" y="746" width="412" height="80" rx="40" fill="#ecfdf5" stroke="#bbf7d0" stroke-width="2"/>
      <text x="${width / 2}" y="798" fill="#166534" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900" text-anchor="middle">PNG, JPG or WebP ready</text>
    </svg>
  `.trim();
}

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load slide image: ${src}`));
    image.src = src;
  });
}

function drawContainedImage(context, image, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const frameRatio = width / height;
  const drawWidth = imageRatio > frameRatio ? width : height * imageRatio;
  const drawHeight = imageRatio > frameRatio ? width / imageRatio : height;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export async function renderSlideToPng(slide, { width = exportWidth, height = exportHeight } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const source = slide.image || svgToDataUrl(createPlaceholderSvg(slide, { width, height }));

  try {
    const image = await loadImage(source);
    drawContainedImage(context, image, width, height);
  } catch (error) {
    if (!slide.image) throw error;
    const fallback = await loadImage(svgToDataUrl(createPlaceholderSvg(slide, { width, height })));
    drawContainedImage(context, fallback, width, height);
  }

  return canvas.toDataURL("image/png", 0.96);
}
