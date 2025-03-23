import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const publicDir = join(__dirname, '../public');
const outputDir = join(publicDir, 'icons');

// Créer le dossier icons s'il n'existe pas
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function isValidImage(filePath) {
  try {
    console.log('  Lecture du fichier:', filePath);
    const buffer = readFileSync(filePath);
    console.log('  Taille du buffer:', buffer.length, 'bytes');
    
    try {
      const metadata = await sharp(buffer).metadata();
      console.log('  Métadonnées:', metadata);
      return true;
    } catch (sharpError) {
      console.log('  Erreur sharp:', sharpError.message);
      
      // Si sharp échoue avec un ICO, on considère quand même que c'est une image valide
      if (filePath.toLowerCase().endsWith('.ico')) {
        console.log('  Fichier ICO détecté, on le considère comme valide');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.log('  Erreur de lecture:', error.message);
    return false;
  }
}

async function findSourceImage() {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.ico', '.svg'];
  const files = readdirSync(publicDir);
  
  console.log('\nRecherche des images dans:', publicDir);
  console.log('Fichiers trouvés:', files);
  
  // Chercher d'abord samaflix avec une extension valide
  for (const ext of validExtensions) {
    const filename = `samaflix${ext}`;
    const filePath = join(publicDir, filename);
    console.log(`\nVérification de ${filename}...`);
    if (files.includes(filename)) {
      console.log('- Fichier trouvé');
      const isValid = await isValidImage(filePath);
      console.log('- Image valide:', isValid);
      if (isValid) {
        return filePath;
      }
    }
  }
  
  // Si pas trouvé, chercher n'importe quelle image avec "logo" ou "icon"
  for (const file of files) {
    const filePath = join(publicDir, file);
    const ext = extname(file).toLowerCase();
    if (validExtensions.includes(ext) && 
        (file.toLowerCase().includes('logo') || file.toLowerCase().includes('icon'))) {
      console.log(`\nVérification de ${file}...`);
      const isValid = await isValidImage(filePath);
      console.log('- Image valide:', isValid);
      if (isValid) {
        return filePath;
      }
    }
  }
  
  return null;
}

async function convertToValidImage(inputFile) {
  try {
    console.log('Lecture du fichier source...');
    const inputBuffer = readFileSync(inputFile);
    console.log('Fichier lu avec succès:', inputBuffer.length, 'bytes');
    
    // Si c'est un ICO, on le convertit d'abord en PNG
    if (inputFile.toLowerCase().endsWith('.ico')) {
      console.log('Conversion ICO -> PNG...');
      // On prend la plus grande taille disponible
      return await sharp(inputBuffer, { density: 300 })
        .png()
        .toBuffer();
    }
    
    console.log('Conversion en PNG avec canal alpha...');
    return await sharp(inputBuffer)
      .ensureAlpha()
      .flatten({ background: { r: 26, g: 26, b: 26, alpha: 1 } })
      .png()
      .toBuffer();
  } catch (error) {
    console.error("\n❌ Erreur lors de la conversion de l'image :", error.message);
    throw error;
  }
}

async function generateIcons() {
  try {
    // Trouver l'image source
    const inputFile = await findSourceImage();
    if (!inputFile) {
      console.error('\n❌ Aucune image source trouvée dans le dossier public/');
      console.log('\nVeuillez placer une image (png, jpg, webp, svg ou ico) nommée :');
      console.log('- samaflix.png (recommandé)');
      console.log('- samaflix.jpg');
      console.log('- samaflix.webp');
      console.log('- samaflix.svg');
      console.log('Ou une image contenant "logo" ou "icon" dans son nom\n');
      process.exit(1);
    }

    console.log(`\n📁 Utilisation de l'image source : ${inputFile}`);
    console.log('\n🔄 Conversion et validation de l\'image...');

    // Convertir l'image en un format valide
    const imageBuffer = await convertToValidImage(inputFile);
    
    console.log('✓ Image convertie avec succès');
    console.log('\n🔄 Génération des icônes en cours...\n');

    for (const size of sizes) {
      await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 26, b: 26, alpha: 1 }
        })
        .toFile(join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`  ✓ Généré icon-${size}x${size}.png`);
    }

    // Générer l'icône Safari Pinned Tab
    await sharp(imageBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .toFile(join(outputDir, 'safari-pinned-tab.svg'));
    
    console.log('  ✓ Généré safari-pinned-tab.svg');
    console.log('\n✨ Toutes les icônes ont été générées avec succès !\n');
  } catch (error) {
    console.error('\n❌ Erreur lors de la génération des icônes:', error.message);
    process.exit(1);
  }
}

generateIcons(); 