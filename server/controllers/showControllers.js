
import axios from 'axios';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

// function to get now playing movies and movies data from TMDB API

export const getNowPlayingMovies = async (req, res) => {
    try {
        const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing' , 
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                }
            }
        )

        // get movies from data using results key
        const movies = data.results;
        res.json({success: true, movies: movies});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}


// controller to add a new show to the database when admin adds a new show
export const addShow = async (req, res) => {
    try {
        const {movieId, showsInput, showPrice} = req.body;
        // check if movie is avalilable in DB using movieId
        // if not available, fetch movie data from TMDB API and store it in DB
        let movie = await Movie.findById(movieId);
        if(!movie){
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                })
            ]);
            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            // create object to store in DB
            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                release_date: movieApiData.release_date,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                vote_average: movieApiData.vote_average,
                vote_count: movieApiData.vote_count,
                runtime: movieApiData.runtime,
                genres: movieApiData.genres.map(genre => genre.name),
                cast: movieCreditsData.cast.slice(0, 10).map(actor => ({
                    name: actor.name,
                    character: actor.character
                })),
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || ''
            }

            // store movieDetails in DB
            // for this we need to create a new movie document using Movie model
            movie = await Movie.create(movieDetails);
        }

        // create shows for the movie using showsInput and showPrice
        // showsInput is an array of date-time strings
        const showToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            const showTimes = show.times;
            showTimes.forEach(time => {
                const showDateTime = new Date(`${showDate}T${time}`);
                showToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(showDateTime),
                    showPrice,
                    occupiedSeats: {}
                });
            });
        });

        if(showToCreate.length > 0){
            await Show.insertMany(showToCreate);
        }

        res.json({success: true, message: 'Shows added successfully'});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}


