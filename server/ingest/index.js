import { Inngest } from "inngest";
import User from "../models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to a database

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'}, // user.creation is an event provided by inngest 
    async ({event}) => {
        const {id, first_name, last_name, email_address, image_url} = event.data
        const userData = {
            _id: id,
            email: email_address[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        // store the user data in db
        await User.create(userData)
    }
)

// Inngest function to delete user from db
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'}, // user.creation is an event provided by inngest 
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest function to update the user data in db
const syncUserUpdation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.updated'}, // user.creation is an event provided by inngest 
    async ({event}) => {
        const {id, first_name, last_name, email_address, image_url} = event.data
        const userData = {
            _id: id,
            email: email_address[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        // store the user data in db
        await User.findByIdAndUpdate(id, userData)
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];