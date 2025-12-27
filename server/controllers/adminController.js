// controller to check if user is admin

import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";

export const isAdmin = async (req,res) => {
    return res.json({
        success: true,
        isAdmin: true
    })
}

// controller to get dashboard data

export const getDashboardData = async (req,res) => {
    try {
        // get all those booking data from Booking collection where isPaid is true
        const bookings = await Booking.find({isPaid: true});

        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        // now we have bookings, total user and active shows means all data required for dashboard
        const dashboardData = { 
            totalRevenue: bookings.reduce((acc,booking) => acc + booking.amount, 0),
            totalBookings: bookings.length,
            totalUsers: totalUser,
            activeShows: activeShows.length
        }

        return res.json({
            success: true,
            dashboardData
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// controller to get all shows

export const getAllShows = async (req,res) => {
    try {
        // get shows from Show model
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1});
        res.json({success: true, shows});
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// controller to get all bookings details for admin dashboard

export const getAllBookings = async (req, res) => {
    try {
        // get all booking data from Booking model
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1});
        res.json({success: true, bookings});

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}