
// import axios from 'axios';
// import Movie from '../models/Movie.js';
// import Show from '../models/Show.js';

// // function to get now playing movies and movies data from TMDB API

// export const getNowPlayingMovies = async (req, res) => {
//     try {
//         const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing' , 
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.TMDB_API_KEY}`
//                 }
//             }
//         )

//         // get movies from data using results key
//         const movies = data.results;
//         return res.json({success: true, movies: movies});
//     } catch (error) {
//         console.log(error);
//         return res.json({success: false, message: error.message});
//     }
// }

import axios from "axios";
import https from "https";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// create https agent to prevent ECONNRESET
const agent = new https.Agent({
    keepAlive: false
});

// -------------------------------------------
// TMDB Config : Retry + Timeout + KeepAlive
// -------------------------------------------
const tmdb = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    timeout: 15000,
    httpsAgent: new https.Agent({ keepAlive: true }),
    headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
    }
});

// auto retry if broken connection
tmdb.interceptors.response.use(null, async (error) => {
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
        console.log("🔁 Retrying TMDB request...");
        return tmdb(error.config);
    }
    return Promise.reject(error);
});



// const api = axios.create({
//   baseURL: "https://api.themoviedb.org/3",
//   timeout: 5000, // 5 sec
// });

// // retry logic
// api.interceptors.response.use(null, async (error) => {
//   if (error.code === "ECONNRESET") {
//     console.log("Retrying TMDB request...");
//     return api(error.config);
//   }
//   return Promise.reject(error);
// });


export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get(
            "https://api.themoviedb.org/3/movie/now_playing",
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                },
                httpsAgent: agent,
                timeout: 10000 // important
            }
        );

        const movies = data.results || [];
        return res.json({ success: true, movies });
    } catch (error) {
        console.log("TMDB ERROR:", error.code || error.message);

        // fallback so your admin page NEVER becomes blank
        return res.json({
            success: true,
            movies: []   // <-- prevents UI crash
        });
    }
};



// controller to add a new show to the database when admin adds a new show
// export const addShow = async (req, res) => {
//     try {
//         const {movieId, showsInput, showPrice} = req.body;

//          // Validation: showsInput must be array
//         if (!Array.isArray(showsInput)) {
//             return res.json({ success: false, message: "showsInput must be an array" });
//         }

//         // check if movie is avalilable in DB using movieId
//         // if not available, fetch movie data from TMDB API and store it in DB
//         let movie = await Movie.findById(movieId);
//         if(!movie){
//             // fetch movie details from TMDB API
//             const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
//                 tmdb.get(`/movie/${movieId}`),
//                 tmdb.get(`/movie/${movieId}/credits`)
//             ]);


//             const movieApiData = movieDetailsResponse.data;
//             const movieCreditsData = movieCreditsResponse.data;

//             // create object to store in DB
//             const movieDetails = {
//                 _id: movieId,
//                 title: movieApiData.title,
//                 overview: movieApiData.overview,
//                 release_date: movieApiData.release_date,
//                 poster_path: movieApiData.poster_path,
//                 backdrop_path: movieApiData.backdrop_path,
//                 vote_average: movieApiData.vote_average,
//                 vote_count: movieApiData.vote_count,
//                 runtime: movieApiData.runtime,
//                 genres: movieApiData.genres.map(genre => genre.name),
//                 cast: movieCreditsData.cast.slice(0, 10).map(actor => ({
//                     name: actor.name,
//                     character: actor.character
//                 })),
//                 original_language: movieApiData.original_language,
//                 tagline: movieApiData.tagline || ''
//             }

//             // store movieDetails in DB
//             // for this we need to create a new movie document using Movie model
//             movie = await Movie.create(movieDetails);
//         }

//         // Validate showsInput
//         if (!Array.isArray(showsInput) || showsInput.length === 0) {
//             return res.json({
//                 success: false,
//                 message: "Invalid showsInput format. Expected: [{ date: 'YYYY-MM-DD', times: ['HH:MM'] }]"
//             });
//         }

//         // create shows for the movie using showsInput and showPrice
//         // showsInput is an array of date-time strings
//         const showToCreate = [];
//         showsInput.forEach(show => {
//             if (!show.date || !Array.isArray(show.times)) return; // protect
//             const showDate = show.date;
//             const showTimes = show.times;
//             showTimes.forEach(time => {
//                 const showDateTime = new Date(`${showDate}T${time}`);
//                 showToCreate.push({
//                     movie: movieId,
//                     showDateTime: new Date(showDateTime),
//                     showPrice,
//                     occupiedSeats: {}
//                 });
//             });
//         });

//         if(showToCreate.length > 0){
//             await Show.insertMany(showToCreate);
//         }

//         return res.json({success: true, message: 'Shows added successfully'});

//     } catch (error) {
//         console.log(error);
//         return res.json({success: false, message: error.message});
//     }
// }


// -------------------------------------------
// ADD SHOW CONTROLLER
// -------------------------------------------
export const addShow = async (req, res) => {
    try {
        const { movieId, showPrice, showsInput } = req.body;

        // Validation: showsInput must be array
        if (!Array.isArray(showsInput)) {
            return res.json({ success: false, message: "showsInput must be an array" });
        }

        // Check movie exists in DB
        let movie = await Movie.findById(movieId);

        if (!movie) {
            console.log("🎬 Fetching movie from TMDB:", movieId);

            try {
                const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                    tmdb.get(`/movie/${movieId}`),
                    tmdb.get(`/movie/${movieId}/credits`)
                ]);

                const movieApiData = movieDetailsResponse.data;
                const movieCreditsData = movieCreditsResponse.data;

                // --- validation to prevent undefined fields ---
                if (
                    !movieApiData.title ||
                    !movieApiData.release_date ||
                    !movieApiData.poster_path ||
                    !movieApiData.backdrop_path
                ) {
                    console.log(`⚠ Missing required TMDB fields for movie ${movieId}, using fallback.`);
                    
                    movie = await Movie.create({
                        _id: movieId,
                        title: movieApiData.title || "Unknown Movie",
                        overview: movieApiData.overview || "No overview available",
                        backdrop_path: movieApiData.backdrop_path || "/default_fallback.jpg",
                        poster_path: movieApiData.poster_path || "/default_fallback.jpg",
                        vote_average: movieApiData.vote_average || 0,
                        release_date: movieApiData.release_date || "2000-01-01",
                        vote_count: movieApiData.vote_count || 0,
                        runtime: movieApiData.runtime || 0,
                        genres: movieApiData.genres?.map(g => g.name) || [],
                        cast: movieCreditsData.cast?.slice(0, 10).map(c => ({
                            name: c.name,
                            character: c.character
                        })) || [],
                        original_language: movieApiData.original_language || "en",
                        tagline: movieApiData.tagline || ""
                    });

                    // skip normal creation
                    return;
                }


                movie = await Movie.create({
                    _id: movieId,
                    title: movieApiData.title,
                    overview: movieApiData.overview,
                    release_date: movieApiData.release_date,
                    poster_path: movieApiData.poster_path,
                    backdrop_path: movieApiData.backdrop_path,
                    vote_average: movieApiData.vote_average,
                    vote_count: movieApiData.vote_count,
                    runtime: movieApiData.runtime,
                    genres: movieApiData.genres?.map(g => g.name) || [],
                    cast: movieCreditsData.cast?.slice(0, 10).map(c => ({
                        name: c.name,
                        character: c.character
                    }))
                     || [],
                    original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || ''
                });

            } catch (err) {
                console.log("❌ TMDB fetch failed:", err.code || err.message);

                // fallback so the system doesn't crash
                // fallback so the system doesn't crash
                movie = await Movie.create({
                    _id: movieId,
                    title: "Unknown Movie",
                    overview: "No overview available",
                    backdrop_path: "/default_fallback.jpg",
                    poster_path: "/default_fallback.jpg",
                    vote_average: 0,
                    release_date: "2000-01-01",
                    vote_count: 0,
                    runtime: 0,
                    genres: [],
                    cast: [],
                    original_language: "en",
                    tagline: ""
                });

            }
        }

        // Create shows
        for (const showData of showsInput) {
            const { date, times } = showData;

            if (!Array.isArray(times)) continue;

            times.forEach(async time => {
                const formattedDateTime = new Date(`${date}T${time}:00`);

                await Show.create({
                    movie: movieId,
                    showDateTime: formattedDateTime,
                    price: showPrice
                });
            });
        }

        return res.json({
            success: true,
            message: "Shows added successfully"
        });

    } catch (error) {
        console.log("❌ SERVER ERROR:", error);
        return res.json({ success: false, message: "Something went wrong" });
    }
};


// controller to get all shows from the database

export const getShows = async (req,res) => {
    try {
        // first get show from Show model
        const shows =  await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1});

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))
        return res.json({success: true, shows: Array.from(uniqueShows)});

    } catch (error) {
        console.log(error);
        
        return res.json({success: false, message: error.message});
    }
}

// Controller to get a single show from database

export const getSingleShow = async (req,res) => {
    try {
        // get movie id using params
        const {movieId} = req.params;
        
        // get all upcoming shows in theater for the movies
        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}});
        const movie = await Movie.findById(movieId);

        // get all the date time for the show 
        const dateTime = {};
        shows.forEach((show)=> {
            const date = show.showDateTime.toISOString().split('T')[0];
            if(!dateTime[date]){
                dateTime[date] = [];
            }
            dateTime[date].push({time: show.showDateTime, showId: show._id})
        })

        return res.json({
            success: true,
            movie,
            dateTime
        })
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message});
    }
}