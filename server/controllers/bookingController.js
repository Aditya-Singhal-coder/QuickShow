

import Booking from "../models/Booking.js";
import Show from "../models/Show.js"

// function to check avalilablity of selected seats for a movie for a particular show

const checkSeatsAvailablity = async (showId, selectedSeats) => {
    try {
        // get show data using the showId
        const showData = await Show.findById(showId);

        if(!showData){
            return false;
        }

        const occupiedSeats = showData.occupiedSeats;

        // check if any of the selectedSeats is in occupiedSeats
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken; // return true if all seats are available, false otherwise
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

// function to book seats for a particular show

export const createBooking = async (req, res) => {
    try {
        // first need to get the userId from req.auth
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;

        // get origin or host url or frontend url from headers
        const {origin} = req.headers;

        // check if the selected seats are available for booking
        const isAvailable = await checkSeatsAvailablity(showId, selectedSeats);
        if(!isAvailable){
            return res.json({
                success: false,
                message: 'Selected seats are not available. Please choose different seats.'
            });
        }
        // if available, create a booking entry in the Booking collection with isPaid as false
        const showData = await Show.findById(showId).populate('movie');
        // create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
            isPaid: false
        })
        // reserrve the selected seats by adding them to occupiedSeats of the show
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');
        await showData.save(); // save the updated show data in db

        // STRIPE PAYMENT GATEWAY INTEGRATION FOR NOW

        // respond with success and booking details
        return res.json({
            success: true,
            message: 'Seats booked successfully..',
            // bookingId: booking._id,
            // amount: booking.amount
        })

    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// function to get occupied seats data

export const getOccupiedSeats = async (req,res)=> {
    try {
        const {showId} = req.params;
        const showData = await Show.findById(showId);

        // get occupied seats data from showData
        const occupiedSeats = Object.keys(showData.occupiedSeats);

        return res.json({
            success: true,
            occupiedSeats
        }); 

    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
}