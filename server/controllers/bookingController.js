import stripe from 'stripe'

import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import { inngest } from '../inngest/index.js';

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

        // STRIPE PAYMENT GATEWAY INTEGRATION 

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // create line items for stripe checkout session
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100, // amount in cents
            },
            quantity: 1
        }]

        // create a stripe checkout session
        const session = await stripeInstance.checkout.sessions.create({
            // after  payment url need to go
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now()/1000) + 30* 60 // session expires in 30 minutes

        })

        booking.paymentLink = session.url;
        await booking.save(); // save the booking with payment link

        // Run Inngest scheduler function to check payment status after 10 min
        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        })

        // respond with success and booking details
        return res.json({
            success: true,
            url: session.url
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