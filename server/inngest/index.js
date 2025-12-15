import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to a database

// const syncUserCreation = inngest.createFunction(
//     {id: 'sync-user-from-clerk'},
//     {event: 'clerk/user.created'}, // user.creation is an event provided by inngest 
//     async ({event}) => {
//         const {id, first_name, last_name, email_address, image_url} = event.data
//         const userData = {
//             _id: id,
//             email: email_address[0].email_address,
//             name: first_name + ' ' + last_name,
//             image: image_url
//         }
//         // store the user data in db
//         await User.create(userData)
//     }
// )

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        image_url,
      } = event.data;

      // Skip if no email is provided
      if (!email_addresses?.length) {
        console.warn(`User ${id} has no email, skipping sync.`);
        return { skipped: true };
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "Anonymous",
        image: image_url || null,
      };

      // Upsert user in MongoDB
      const user = await User.findByIdAndUpdate(
        id,
        userData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`User ${id} synced successfully.`);
      return { success: true, user };
    } catch (err) {
      console.error("Failed to sync user:", err);
      return { success: false, error: err.message };
    }
  }
);

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
    {id: 'update-user-from-clerk'},
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