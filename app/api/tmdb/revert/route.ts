import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

interface Update {
  old: string;
  new: string;
}

export async function POST(request: Request) {
  try {
    const { updates } = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Lire le fichier JSON
    const filePath = path.join(process.cwd(), 'data/dulourd_data.json');
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);

    let revertedCount = 0;

    // Parcourir chaque série et restaurer l'ancien titre
    for (const serie of data.series) {
      const update = updates.find(u => u.new === serie.title);
      if (update) {
        serie.title = update.old;
        revertedCount++;
      }
    }

    // Sauvegarder les modifications
    if (revertedCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    return NextResponse.json({
      success: true,
      revertedCount,
      message: `${revertedCount} titres ont été restaurés`
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation des modifications:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      },
      { status: 500 }
    );
  }
} 