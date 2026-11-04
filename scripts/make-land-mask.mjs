// One-off: derives public/textures/land.png (512x256, 1-channel land mask) from the
// MIT-licensed three.js example Earth specular map. Run: node scripts/make-land-mask.mjs <input.jpg>
import sharp from 'sharp';
const input = process.argv[2];
await sharp(input).resize(512, 256).greyscale().threshold(90).png({ colours: 2, compressionLevel: 9 }).toFile('public/textures/land.png');
console.log('ok');
