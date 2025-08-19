import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new contact
export const create = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    type: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    postcode: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if email already exists
    if (args.email) {
      const existing = await ctx.db
        .query("contacts")
        .withIndex("byEmail", (q) => q.eq("email", args.email!))
        .unique();

      if (existing) {
        throw new Error("A contact with this email already exists");
      }
    }

    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      company: args.company,
      type: args.type as any,
      phone: args.phone,
      email: args.email,
      address: args.address,
      suburb: args.suburb,
      state: args.state as any,
      postcode: args.postcode,
      notes: args.notes,
    });

    return contactId;
  },
});

// Update a contact
export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    type: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    postcode: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existing = await ctx.db
        .query("contacts")
        .withIndex("byEmail", (q) => q.eq("email", updates.email!))
        .unique();

      if (existing && existing._id !== id) {
        throw new Error("A contact with this email already exists");
      }
    }

    const processedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === "type") {
          processedUpdates[key] = value as any;
        } else if (key === "state") {
          processedUpdates[key] = value as any;
        } else {
          processedUpdates[key] = value;
        }
      }
    }

    await ctx.db.patch(id, processedUpdates);
  },
});

// Get all contacts
export const list = query({
  args: {
    type: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let contacts;
    
    if (args.type) {
      contacts = await ctx.db
        .query("contacts")
        .withIndex("byType", (q) => q.eq("type", args.type as any))
        .collect();
    } else {
      contacts = await ctx.db.query("contacts").collect();
    }

    if (args.searchTerm) {
      const search = args.searchTerm.toLowerCase();
      contacts = contacts.filter((c) => 
        c.name.toLowerCase().includes(search) ||
        c.company?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search)
      );
    }

    // Sort by name
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    return contacts;
  },
});

// Get lawyers
export const getLawyers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .withIndex("byType", (q) => q.eq("type", "Lawyer"))
      .collect();
  },
});

// Get rental companies
export const getRentalCompanies = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .withIndex("byType", (q) => q.eq("type", "Rental Company"))
      .collect();
  },
});

// Get insurers
export const getInsurers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .withIndex("byType", (q) => q.eq("type", "Insurer"))
      .collect();
  },
});

// Get a single contact
export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete a contact
export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user has permission
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user || (user.role !== "admin" && user.role !== "developer")) {
      throw new Error("Insufficient permissions");
    }

    // Check if contact is referenced in workspaces
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("byContact", (q) => q.eq("contactId", args.id))
      .collect();

    if (workspaces.length > 0) {
      throw new Error("Cannot delete contact that has associated workspaces");
    }

    // Check if contact is assigned to cases
    const casesAsLawyer = await ctx.db
      .query("cases")
      .withIndex("byLawyer", (q) => q.eq("assignedLawyerId", args.id))
      .collect();

    const casesAsRental = await ctx.db
      .query("cases")
      .withIndex("byRentalCompany", (q) => q.eq("assignedRentalCompanyId", args.id))
      .collect();

    if (casesAsLawyer.length > 0 || casesAsRental.length > 0) {
      throw new Error("Cannot delete contact that is assigned to cases");
    }

    // Delete the contact
    await ctx.db.delete(args.id);
  },
});

// Get contact statistics
export const getStats = query({
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();

    const byType = contacts.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lawyers = contacts.filter(c => c.type === "Lawyer").length;
    const rentalCompanies = contacts.filter(c => c.type === "Rental Company").length;
    const insurers = contacts.filter(c => c.type === "Insurer").length;
    const repairers = contacts.filter(c => c.type === "Repairer").length;
    const others = contacts.filter(c => 
      !["Lawyer", "Rental Company", "Insurer", "Repairer"].includes(c.type)
    ).length;

    return {
      total: contacts.length,
      byType,
      lawyers,
      rentalCompanies,
      insurers,
      repairers,
      others,
    };
  },
});