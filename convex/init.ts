import { internalMutation } from "./_generated/server";

// This function runs on deployment to ensure the database is initialized
export const init = internalMutation({
  handler: async (ctx) => {
    // Check if there are any users
    const existingUsers = await ctx.db.query("users").take(1);
    
    if (existingUsers.length === 0) {
      console.log("Initializing database...");
      // Database is initialized via schema
      console.log("Database initialized successfully");
    } else {
      console.log("Database already initialized");
    }
  },
});