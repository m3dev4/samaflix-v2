// import { SeriesScraper } from '../scrappe/index';

// interface Serie {
//     id: string;
//     title: string;
//     poster: string;
//     sourceUrl: string;
// }

// async function testScraper() {
//     console.log('🚀 Démarrage des tests du scraper...\n');
    
//     const scraper = new SeriesScraper();

//     try {
//         console.log('📋 Test 1: Récupération de la liste des séries');
//         console.log('🔍 Vérification des sélecteurs...');
        
//         const series = await scraper.getAllSeries();
        
//         // Log détaillé des sélecteurs trouvés
//         console.log('\n🔎 Détails des sélecteurs trouvés:');
//         console.log('--------------------------------');
//         console.log(`Container: .movie-item2`);
//         console.log(`Titre: .mi2-title`);
//         console.log(`Image: .mi2-img img`);
//         console.log(`Lien: .mi2-in-link`);
        
//         console.log(`\n✅ ${series.length} séries trouvées\n`);
        
//         // Affichage détaillé des 5 premières séries
//         console.log('📺 Liste des 5 premières séries:');
//         series.slice(0, 5).forEach((serie: Serie, index: number) => {
//             console.log(`\n${index + 1}. ${serie.title}`);
//             console.log(`   ID: ${serie.id}`);
//             console.log(`   Poster: ${serie.poster}`);
//             console.log(`   URL: ${serie.sourceUrl}`);
//         });

//     } catch (error) {
//         console.error('\n❌ Erreur pendant les tests:', error);
//         process.exit(1);
//     }
// }

// // Exécution du test
// (async () => {
//     try {
//         await testScraper();
//     } catch (error) {
//         console.error('Erreur globale:', error);
//         process.exit(1);
//     }
// })();