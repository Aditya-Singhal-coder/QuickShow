import mongoose from "mongoose";

// contatin movie information and date-time and price and other things

const showSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,// string
        required: true,
        ref: 'Movie'
    },
    showDateTime: {
        type: Date,
        required: true
    },
    showPrice: {
        type: Number,
        required: true
    },
    occupiedSeats: {
        type: Array,
        default: {}
    },
},{minimize: false, timestamps:true });

const Show = mongoose.model("Show", showSchema);

export default Show;