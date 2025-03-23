import { Series } from "@/types";
import {
    enrichSeriesWithProviders, 
    fetchCategoryActionAndAdventure, 
    fetchCategoryComedy, 
    fetchCategoryDocumentary, 
    fetchCategoryHorror, 
    fetchCategoryRomance, 
    fetchLatestSeries, 
    fetchPopularSeries, 
    fetchSeriesActionAndAdventure, 
    fetchSeriesAnimation, 
    fetchSeriesComedy, 
    fetchSeriesCrime, 
    fetchSeriesDocumentary, 
    fetchSeriesDrama, 
    fetchSeriesHorror, 
    fetchSeriesSciFiAndFantasy, 
    fetchTopRatedSeries,
    fetchSeriesByProviderAndRegion // Import the new function
} from "@/utils/tmdb";

const formatAndEnrichSerie = async (results: any[]): Promise<Series[]> => {
    const formattedSeries = results.map((serie) => ({
        id: serie.id,
        name: serie.name,
        overview: serie.overview,
        poster_view: serie.poster_path,
        backdrop_path: serie.backdrop_path,
        first_air_date: serie.first_air_date,
        vote_average: serie.vote_average,
        origin_country: serie.origin_country,
        genre_ids: serie.genre_ids,
        providers: serie.providers?.FR || undefined
    }))
    return enrichSeriesWithProviders(formattedSeries)
}

export async function getSeries() {
    const popularSerie = await fetchPopularSeries()
    const topRatedseries = await fetchTopRatedSeries()
    const latestSeries = await fetchLatestSeries()
    const actionSeries = await fetchSeriesActionAndAdventure();
    const animationSeries = await fetchSeriesAnimation();
    const comedySeries = await fetchSeriesComedy();
    const crimeSeries = await fetchSeriesCrime();
    const dramaSeries = await fetchSeriesDrama();
    const horrorSeries = await fetchSeriesHorror();
    const sciFiSeries = await fetchSeriesSciFiAndFantasy();
    const documentarySeries = await fetchSeriesDocumentary();
  

    const heroSerie = popularSerie.results[0]

    const [
        enrichedPopularSeries,
        enrichedTopRatedSeries,
        enrichedLatestSeries,
        enrichedHeroSeries,
        enrichedActionAndAdventureSeries,
        enrichedComedySeries,
        enrichedHororSeries,
        enrichedRomanceSeries,
        enrichedDocumentarySeries
    ] = await Promise.all([
        formatAndEnrichSerie(popularSerie.results.slice(0, 50)),
        formatAndEnrichSerie(topRatedseries.results.slice(0, 20)),
        formatAndEnrichSerie(latestSeries.results.slice(0, 20)),
        formatAndEnrichSerie([heroSerie]),
        formatAndEnrichSerie(actionSeries.results.slice(0, 20)),
        formatAndEnrichSerie(animationSeries.results.slice(0, 20)),
        formatAndEnrichSerie(comedySeries.results.slice(0, 20)),
        formatAndEnrichSerie(crimeSeries.results.slice(0, 20)),
        formatAndEnrichSerie(dramaSeries.results.slice(0, 20)),
        formatAndEnrichSerie(horrorSeries.results.slice(0, 20)),
        formatAndEnrichSerie(sciFiSeries.results.slice(0, 20)),
        formatAndEnrichSerie(documentarySeries.results.slice(0, 20))
    ])

    return {
        hero: enrichedHeroSeries[0],
        popular: enrichedPopularSeries,
        topRated: enrichedTopRatedSeries,
        latest: enrichedLatestSeries,
        actionAndAdventure: enrichedActionAndAdventureSeries,
        comedy: enrichedComedySeries,
        horror: enrichedHororSeries,
        romance: enrichedRomanceSeries,
        documentary: enrichedDocumentarySeries
    }
}

export async function getSeriesByProviderAndRegion(providers: string[], region: string) {
    const results = await fetchSeriesByProviderAndRegion(providers, region);
    const formattedSeries = results.map((serie) => ({
        title: serie.title,
        poster: serie.poster,
        rating: serie.rating,
        genre: serie.genre,
        provider: providers.join(', ')
    }));
    return formattedSeries;
}



