const sharp = require('sharp');
const path = require('path');

const BLUE = '#2563EB';
const WHITE = '#FFFFFF';

async function createIcon(size, filename, padding = 0) {
  const textSize = Math.floor(size * 0.35);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${padding ? WHITE : BLUE}" rx="0"/>
    ${padding ? `<rect x="${padding}" y="${padding}" width="${size - padding*2}" height="${size - padding*2}" fill="${BLUE}" rx="${Math.floor(size*0.15)}"/>` : ''}
    <text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="bold" font-size="${textSize}" fill="${WHITE}" text-anchor="middle" dominant-baseline="middle">TH</text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets', filename));
  console.log(`Created ${filename}`);
}

async function createSplash() {
  const size = 1284;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${WHITE}"/>
    <rect x="442" y="442" width="400" height="400" fill="${BLUE}" rx="60"/>
    <text x="642" y="660" font-family="Arial, sans-serif" font-weight="bold" font-size="160" fill="${WHITE}" text-anchor="middle" dominant-baseline="middle">TH</text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'assets', 'splash.png'));
  console.log('Created splash.png');
}

(async () => {
  // Main icon (1024x1024)
  await createIcon(1024, 'icon.png');
  // Adaptive icon foreground (1024x1024 with padding)
  await createIcon(1024, 'adaptive-icon.png', 200);
  // Splash
  await createSplash();
})();
