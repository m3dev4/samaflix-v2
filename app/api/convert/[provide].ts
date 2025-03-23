import { NextApiRequest, NextApiResponse } from 'next';

// Exemple pour uqload
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    // 1. Faire une requête vers la page embed
    const embedResponse = await fetch(`https://uqload.net/embed-${id}.html`);
    const html = await embedResponse.text();
    
    // 2. Extraire l'URL du m3u8
    const m3u8Match = html.match(/source:\s*['"]([^'"]+\.m3u8)['"]/);
    if (!m3u8Match) {
      throw new Error('URL m3u8 non trouvée');
    }
    
    // 3. Retourner l'URL
    res.json({ m3u8Url: m3u8Match[1] });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: 'Erreur de conversion' });
  }
}