
import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// API controller function to get user booking for the user

export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;
        // get booking data from Booking model
        const bookings = await Booking.find({user}).populate({
            path: 'show',
            populate: {path: 'movie'}
        }).sort({createdAt: -1});

        return res.send({
            success: true,
            bookings
        });
         
    } catch (error) {
        console.log(error.message);
        return res.send({
            success: false,
            message: error.message
        })
    }
}

// API controller function so that user can add any movies or remove  to their favourite list
// and update favourite movie in CLERK user metadata

export const updateFavorite = async (req, res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;

        // fetch user from clerk using clerk client
        const user = await clerkClient.users.getUser(userId);

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = [];
        }
        // add movieId to favorites array if not already present
        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId); 
        }
        else{
            // remove movieId from favorites array
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
                (item => item !== movieId)
            )
        }

        // update user metadata in clerk
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });
        res.json({
            success: true,
            message: 'Favorite updated successfully',
        });
    } catch (error) {
        console.log(error.message);
        return res.send({
            success: false,
            message: error.message
        })
    }
}

// API controller so that we can see favourite movie list

export const getFavorites = async (req, res)=> {
    try {
        const userId = req.auth().userId;
        // fetch user from clerk using clerk client
        const user = await clerkClient.users.getUser(userId);
        const favoriteMovies = user.privateMetadata.favorites || [];

        // get movie details from movie model using the ids in favoriteMovies array
        const movies = await Movie.find({ _id: { $in: favoriteMovies } });

        return res.json({
            success: true,
            movies
        });

    } catch (error) {
        console.log(error.message);
        return res.send({
            success: false,
            message: error.message
        })
    }
}