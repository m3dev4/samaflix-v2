import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../public');

// Créer une image SVG avec le texte "SF"
const svgImage = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a1a1a"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold" font-size="240" fill="#00A8E1">SF</text>
</svg>
`;

// Générer l'image PNG de base
async function generateBaseIcon() {
  try {
    console.log('Génération de l\'icône de base...');
    
    await sharp(Buffer.from(svgImage))
      .png()
      .toFile(join(publicDir, 'samaflix.png'));
    
    console.log('✨ Icône de base générée avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

generateBaseIcon(); 