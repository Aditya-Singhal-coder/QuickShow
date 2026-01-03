import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
    try {
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        //create signature
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (error) {
            console.log(error);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        // check and handle the event
        try {
            switch (event.type) {
                case "payment_intent.succeeded": {
                    const paymentIntent = event.data.object;
                    // find session list
                    const sessionList = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                    })                
                    
                    const session = sessionList.data[0];
                    const bookingId = session.metadata;

                    await Booking.findByIdAndUpdate(bookingId, {
                        isPaid: true,
                        paymentLink: ""
                    })
                    break;
                }
            
                default:
                    console.log('Unhandled event type');
                    
            }

            return res.json({received: true});
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.log(error);
        
    }
}