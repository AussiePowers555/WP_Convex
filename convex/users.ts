import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    // For now, return null (no auth)
    // Later you can implement session-based auth here
    return null;
  },
});

// Simple user creation for future auth implementation
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();
    
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      externalId: args.email, // Use email as external ID for now
    });
  },
});

// Helper function for future auth implementation
export async function getCurrentUser(ctx: QueryCtx) {
  // For now, return null (no auth)
  // Later you can implement session-based auth here
  return null;
}

// Get user by email (for future auth)
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();
  },
});