import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new bike
export const create = mutation({
  args: {
    registration: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.optional(v.string()),
    vin: v.optional(v.string()),
    engineNumber: v.optional(v.string()),
    status: v.optional(v.string()),
    dailyRate: v.number(),
    weeklyRate: v.number(),
    monthlyRate: v.number(),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    lastServiceDate: v.optional(v.string()),
    nextServiceDue: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No authentication required for demo

    // Check if registration already exists
    const existing = await ctx.db
      .query("bikes")
      .withIndex("byRegistration", (q) => q.eq("registration", args.registration))
      .unique();

    if (existing) {
      throw new Error("A bike with this registration already exists");
    }

    const bikeId = await ctx.db.insert("bikes", {
      registration: args.registration,
      make: args.make,
      model: args.model,
      year: args.year,
      color: args.color,
      vin: args.vin,
      engineNumber: args.engineNumber,
      status: (args.status as any) || "Available",
      dailyRate: args.dailyRate,
      weeklyRate: args.weeklyRate,
      monthlyRate: args.monthlyRate,
      purchaseDate: args.purchaseDate,
      purchasePrice: args.purchasePrice,
      currentValue: args.currentValue,
      lastServiceDate: args.lastServiceDate,
      nextServiceDue: args.nextServiceDue,
      notes: args.notes,
    });

    return bikeId;
  },
});

// Update a bike
export const update = mutation({
  args: {
    id: v.id("bikes"),
    registration: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    vin: v.optional(v.string()),
    engineNumber: v.optional(v.string()),
    status: v.optional(v.string()),
    dailyRate: v.optional(v.number()),
    weeklyRate: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    lastServiceDate: v.optional(v.string()),
    nextServiceDue: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No authentication required for demo

    const { id, ...updates } = args;

    // If registration is being updated, check for duplicates
    if (updates.registration) {
      const existing = await ctx.db
        .query("bikes")
        .withIndex("byRegistration", (q) => q.eq("registration", updates.registration!))
        .unique();

      if (existing && existing._id !== id) {
        throw new Error("A bike with this registration already exists");
      }
    }

    const processedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        processedUpdates[key] = key === "status" ? value as any : value;
      }
    }

    await ctx.db.patch(id, processedUpdates);
  },
});

// Get all bikes
export const list = query({
  args: {
    status: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bikes;
    
    if (args.status) {
      bikes = await ctx.db
        .query("bikes")
        .withIndex("byStatus", (q) => 
          q.eq("status", args.status as any)
        )
        .collect();
    } else {
      bikes = await ctx.db.query("bikes").collect();
    }

    if (args.searchTerm) {
      const search = args.searchTerm.toLowerCase();
      bikes = bikes.filter((b) => 
        b.registration.toLowerCase().includes(search) ||
        b.make.toLowerCase().includes(search) ||
        b.model.toLowerCase().includes(search) ||
        b.vin?.toLowerCase().includes(search)
      );
    }

    // Sort by registration
    bikes.sort((a, b) => a.registration.localeCompare(b.registration));

    return bikes;
  },
});

// Get a single bike
export const get = query({
  args: { id: v.id("bikes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get available bikes
export const getAvailable = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("bikes")
      .withIndex("byStatus", (q) => q.eq("status", "Available"))
      .collect();
  },
});

// Assign bike to case
export const assignToCase = mutation({
  args: {
    bikeId: v.id("bikes"),
    caseId: v.id("cases"),
    dailyRate: v.number(),
    assignedDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No authentication required for demo
    
    // Use default user for demo
    let user = await ctx.db.query("users").first();
    
    if (!user) {
      // Create a default demo user
      const userId = await ctx.db.insert("users", {
        name: "Demo User",
        email: "demo@pbikerescue.com",
        externalId: "demo-user",
        role: "admin",
        status: "active",
        firstLogin: false,
      });
      user = await ctx.db.get(userId);
    }

    // Check if bike is available
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.status !== "Available") {
      throw new Error("Bike is not available");
    }

    // Update bike status
    await ctx.db.patch(args.bikeId, {
      status: "On Hire" as any,
      assignedCaseId: args.caseId,
    });

    // Update case with assigned bike
    await ctx.db.patch(args.caseId, {
      assignedBikeId: args.bikeId,
    });

    // Create assignment record
    const assignmentId = await ctx.db.insert("bikeAssignments", {
      bikeId: args.bikeId,
      caseId: args.caseId,
      assignedDate: args.assignedDate || new Date().toISOString(),
      dailyRate: args.dailyRate,
      notes: args.notes,
      assignedBy: user._id,
    });

    return assignmentId;
  },
});

// Return bike from case
export const returnFromCase = mutation({
  args: {
    bikeId: v.id("bikes"),
    returnedDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // No authentication required for demo

    const bike = await ctx.db.get(args.bikeId);
    if (!bike || !bike.assignedCaseId) {
      throw new Error("Bike is not assigned to a case");
    }

    // Find the active assignment
    const assignment = await ctx.db
      .query("bikeAssignments")
      .withIndex("byBike", (q) => q.eq("bikeId", args.bikeId))
      .filter((q) => q.eq(q.field("returnedDate"), undefined))
      .first();

    if (!assignment) {
      throw new Error("No active assignment found");
    }

    // Calculate rental period and cost
    const assignedDate = new Date(assignment.assignedDate);
    const returnedDate = new Date(args.returnedDate || new Date().toISOString());
    const totalDays = Math.ceil((returnedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalCost = totalDays * assignment.dailyRate;

    // Update assignment record
    await ctx.db.patch(assignment._id, {
      returnedDate: returnedDate.toISOString(),
      totalDays,
      totalCost,
      notes: args.notes,
    });

    // Update bike status
    await ctx.db.patch(args.bikeId, {
      status: "Available" as any,
      assignedCaseId: undefined,
    });

    // Update case financial summary
    const case_ = await ctx.db.get(bike.assignedCaseId);
    if (case_) {
      await ctx.db.patch(bike.assignedCaseId, {
        invoiced: case_.invoiced + totalCost,
        assignedBikeId: undefined,
      });
    }

    return { totalDays, totalCost };
  },
});

// Delete a bike
export const remove = mutation({
  args: { id: v.id("bikes") },
  handler: async (ctx, args) => {
    // No authentication required for demo - allow all deletions

    // Check if bike is assigned
    const bike = await ctx.db.get(args.id);
    if (bike?.assignedCaseId) {
      throw new Error("Cannot delete bike while assigned to a case");
    }

    // Delete assignment history
    const assignments = await ctx.db
      .query("bikeAssignments")
      .withIndex("byBike", (q) => q.eq("bikeId", args.id))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    // Delete the bike
    await ctx.db.delete(args.id);
  },
});

// Get fleet statistics
export const getStats = query({
  handler: async (ctx) => {
    const bikes = await ctx.db.query("bikes").collect();

    const total = bikes.length;
    const available = bikes.filter(b => b.status === "Available").length;
    const onHire = bikes.filter(b => b.status === "On Hire").length;
    const inService = bikes.filter(b => b.status === "Service").length;
    const inRepair = bikes.filter(b => b.status === "Repair").length;
    const unavailable = bikes.filter(b => b.status === "Unavailable").length;

    const totalValue = bikes.reduce((sum, b) => sum + (b.currentValue || 0), 0);
    const averageValue = total > 0 ? totalValue / total : 0;

    // Get upcoming service requirements
    const today = new Date();
    const upcomingService = bikes.filter(b => {
      if (!b.nextServiceDue) return false;
      const dueDate = new Date(b.nextServiceDue);
      const daysUntilService = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilService <= 30 && daysUntilService >= 0;
    });

    return {
      total,
      available,
      onHire,
      inService,
      inRepair,
      unavailable,
      utilizationRate: total > 0 ? (onHire / total) * 100 : 0,
      totalValue,
      averageValue,
      upcomingServiceCount: upcomingService.length,
      upcomingService: upcomingService.map(b => ({
        id: b._id,
        registration: b.registration,
        nextServiceDue: b.nextServiceDue,
      })),
    };
  },
});

// Get bike assignment history
export const getAssignmentHistory = query({
  args: {
    bikeId: v.optional(v.id("bikes")),
    caseId: v.optional(v.id("cases")),
  },
  handler: async (ctx, args) => {
    let assignments;
    
    if (args.bikeId) {
      assignments = await ctx.db
        .query("bikeAssignments")
        .withIndex("byBike", (q) => q.eq("bikeId", args.bikeId!))
        .collect();
    } else if (args.caseId) {
      assignments = await ctx.db
        .query("bikeAssignments")
        .withIndex("byCase", (q) => q.eq("caseId", args.caseId!))
        .collect();
    } else {
      assignments = await ctx.db.query("bikeAssignments").collect();
    }

    // Sort by assigned date (newest first)
    assignments.sort((a, b) => 
      new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
    );

    // Fetch related data
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const bike = await ctx.db.get(assignment.bikeId);
        const case_ = await ctx.db.get(assignment.caseId);
        const assignedBy = await ctx.db.get(assignment.assignedBy);

        return {
          ...assignment,
          bike: bike ? {
            registration: bike.registration,
            make: bike.make,
            model: bike.model,
          } : null,
          case: case_ ? {
            caseNumber: case_.caseNumber,
            nafName: case_.nafName,
          } : null,
          assignedByName: assignedBy?.name || "Unknown",
        };
      })
    );

    return enrichedAssignments;
  },
});