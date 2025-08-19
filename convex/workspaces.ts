import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new workspace
export const create = mutation({
  args: {
    name: v.string(),
    contactId: v.id("contacts"),
    type: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has permission to create workspaces
    if (user.role !== "admin" && user.role !== "developer") {
      throw new Error("Insufficient permissions to create workspaces");
    }

    // Verify contact exists
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      contactId: args.contactId,
      type: args.type,
      active: args.active !== false, // Default to true
      createdBy: user._id,
    });

    return workspaceId;
  },
});

// Update a workspace
export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    type: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
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

    const { id, ...updates } = args;

    // If contactId is being updated, verify it exists
    if (updates.contactId) {
      const contact = await ctx.db.get(updates.contactId);
      if (!contact) {
        throw new Error("Contact not found");
      }
    }

    const processedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        processedUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, processedUpdates);
  },
});

// Get all workspaces
export const list = query({
  args: {
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let workspaces;
    
    if (args.active !== undefined) {
      workspaces = await ctx.db
        .query("workspaces")
        .withIndex("byActive", (q) => q.eq("active", args.active!))
        .collect();
    } else {
      workspaces = await ctx.db.query("workspaces").collect();
    }

    // Fetch contact details for each workspace
    const enrichedWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const contact = await ctx.db.get(workspace.contactId);
        return {
          ...workspace,
          contactName: contact?.name || "Unknown",
          contactType: contact?.type || "Unknown",
        };
      })
    );

    // Sort by name
    enrichedWorkspaces.sort((a, b) => a.name.localeCompare(b.name));

    return enrichedWorkspaces;
  },
});

// Get a single workspace
export const get = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.id);
    if (!workspace) return null;

    const contact = await ctx.db.get(workspace.contactId);
    
    return {
      ...workspace,
      contactName: contact?.name || "Unknown",
      contactType: contact?.type || "Unknown",
    };
  },
});

// Get workspaces for current user
export const getMyWorkspaces = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Admin and developer can see all workspaces
    if (user.role === "admin" || user.role === "developer") {
      return await ctx.db
        .query("workspaces")
        .withIndex("byActive", (q) => q.eq("active", true))
        .collect();
    }

    // Other users only see their assigned workspace
    if (user.workspaceId) {
      const workspace = await ctx.db.get(user.workspaceId);
      return workspace ? [workspace] : [];
    }

    return [];
  },
});

// Delete a workspace
export const remove = mutation({
  args: { id: v.id("workspaces") },
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

    // Check if workspace has associated cases
    const cases = await ctx.db
      .query("cases")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.id))
      .collect();

    if (cases.length > 0) {
      throw new Error(`Cannot delete workspace with ${cases.length} associated cases`);
    }

    // Check if workspace has associated users
    const users = await ctx.db
      .query("users")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.id))
      .collect();

    if (users.length > 0) {
      throw new Error(`Cannot delete workspace with ${users.length} associated users`);
    }

    // Delete the workspace
    await ctx.db.delete(args.id);
  },
});

// Assign user to workspace
export const assignUser = mutation({
  args: {
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user has permission
    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "developer")) {
      throw new Error("Insufficient permissions");
    }

    // Verify workspace exists
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Update user's workspace
    await ctx.db.patch(args.userId, {
      workspaceId: args.workspaceId,
    });
  },
});

// Remove user from workspace
export const removeUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user has permission
    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "developer")) {
      throw new Error("Insufficient permissions");
    }

    // Update user's workspace
    await ctx.db.patch(args.userId, {
      workspaceId: undefined,
    });
  },
});

// Get workspace statistics
export const getStats = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    if (args.workspaceId) {
      // Get stats for specific workspace
      const cases = await ctx.db
        .query("cases")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();

      const users = await ctx.db
        .query("users")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();

      const totalInvoiced = cases.reduce((sum, c) => sum + c.invoiced, 0);
      const totalPaid = cases.reduce((sum, c) => sum + c.paid, 0);

      return {
        workspaceId: args.workspaceId,
        totalCases: cases.length,
        totalUsers: users.length,
        totalInvoiced,
        totalPaid,
        totalOutstanding: totalInvoiced - totalPaid,
      };
    } else {
      // Get overall stats
      const workspaces = await ctx.db.query("workspaces").collect();
      const activeWorkspaces = workspaces.filter(w => w.active);
      
      const stats = await Promise.all(
        workspaces.map(async (workspace) => {
          const cases = await ctx.db
            .query("cases")
            .withIndex("byWorkspace", (q) => q.eq("workspaceId", workspace._id))
            .collect();

          const users = await ctx.db
            .query("users")
            .withIndex("byWorkspace", (q) => q.eq("workspaceId", workspace._id))
            .collect();

          const totalInvoiced = cases.reduce((sum, c) => sum + c.invoiced, 0);
          const totalPaid = cases.reduce((sum, c) => sum + c.paid, 0);

          return {
            workspaceId: workspace._id,
            workspaceName: workspace.name,
            active: workspace.active,
            totalCases: cases.length,
            totalUsers: users.length,
            totalInvoiced,
            totalPaid,
            totalOutstanding: totalInvoiced - totalPaid,
          };
        })
      );

      return {
        totalWorkspaces: workspaces.length,
        activeWorkspaces: activeWorkspaces.length,
        workspaceStats: stats,
      };
    }
  },
});