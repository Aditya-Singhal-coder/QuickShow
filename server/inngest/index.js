import { Inngest } from "inngest";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* =========================
   USER CREATED
========================= */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk-create" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    if (!email_addresses || email_addresses.length === 0) {
      throw new Error("No email found for user");
    }

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
  }
);

/* =========================
   USER DELETED
========================= */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

/* =========================
   USER UPDATED
========================= */
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-from-clerk-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses?.[0]?.email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];
