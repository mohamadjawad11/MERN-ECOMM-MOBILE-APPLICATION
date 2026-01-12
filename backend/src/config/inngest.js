import {Inngest} from 'inngest';
import { connectDB } from './db.js';
import { User } from '../models/user.model.js';

export const inngest = new Inngest({id:"Ecommerce Backend"});

// Function to sync new users from Clerk to our database
const syncClerkUsers = inngest.createFunction(
   {id:"Sync Clerk Users"},
   //choose the event type which is in this case user.created
   {event:"clerk/user.created"},
    //function to be executed when the event is triggered
   async ({event}) => {
    await connectDB();
    //extract user data from the event payload that Clerk sends
    const {id:clerkId, email_addresses, first_name, last_name, image_url} = event.data
    //create a new user object with the received data
    const newUser={
        clerkId,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`||"User",
        imageUrl: image_url,
        addresses:[],
        wishlist:[],
    }
    //save the new user to the database
    await User.create(newUser);
})




const deleteClerkUsers = inngest.createFunction(
    // customized id can be anything
    {id:"Delete Clerk Users"},
    // specify the event type to listen for in this case user.deleted
    {event:"clerk/user.deleted"},
    // function to be executed when the event is triggered
    async ({event}) => {
        await connectDB();
        // extract clerkId from the event payload(user id will be deleted)
        const {id:clerkId} = event.data;
        //delete user from the database based on clerkId
        await User.deleteOne({clerkId});
    }
)

export const inngestFunctions = [syncClerkUsers, deleteClerkUsers];
