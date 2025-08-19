import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Generate case number in format WWMM### (Week-Month-Sequence)
function generateCaseNumber(): string {
  const now = new Date();
  const weekNumber = Math.ceil((now.getDate() + now.getDay()) / 7);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const sequence = Math.floor(Math.random() * 900) + 100; // Random 3-digit number
  return `${weekNumber.toString().padStart(2, '0')}${month}${sequence}`;
}

// Create a new case
export const create = mutation({
  args: {
    status: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
    
    // NAF party details
    nafName: v.string(),
    nafPhone: v.optional(v.string()),
    nafEmail: v.optional(v.string()),
    nafAddress: v.optional(v.string()),
    nafSuburb: v.optional(v.string()),
    nafState: v.optional(v.string()),
    nafPostcode: v.optional(v.string()),
    nafDob: v.optional(v.string()),
    nafLicenceNo: v.optional(v.string()),
    nafLicenceState: v.optional(v.string()),
    nafLicenceExp: v.optional(v.string()),
    nafClaimNumber: v.optional(v.string()),
    nafInsuranceCompany: v.optional(v.string()),
    nafInsurer: v.optional(v.string()),
    nafVehicleRego: v.optional(v.string()),
    nafVehicleMake: v.optional(v.string()),
    nafVehicleModel: v.optional(v.string()),
    nafVehicleYear: v.optional(v.number()),
    
    // AF party details
    afName: v.string(),
    afPhone: v.optional(v.string()),
    afEmail: v.optional(v.string()),
    afAddress: v.optional(v.string()),
    afSuburb: v.optional(v.string()),
    afState: v.optional(v.string()),
    afPostcode: v.optional(v.string()),
    afClaimNumber: v.optional(v.string()),
    afInsuranceCompany: v.optional(v.string()),
    afInsurer: v.optional(v.string()),
    afVehicleRego: v.optional(v.string()),
    afVehicleMake: v.optional(v.string()),
    afVehicleModel: v.optional(v.string()),
    afVehicleYear: v.optional(v.number()),
    
    // Assignments
    assignedLawyerId: v.optional(v.id("contacts")),
    assignedRentalCompanyId: v.optional(v.id("contacts")),
    
    // Accident details
    accidentDate: v.optional(v.string()),
    accidentTime: v.optional(v.string()),
    accidentDescription: v.optional(v.string()),
    accidentLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo purposes, create a default user if none exists
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

    // Generate unique case number
    let caseNumber = generateCaseNumber();
    let existingCase = await ctx.db
      .query("cases")
      .withIndex("byCaseNumber", (q) => q.eq("caseNumber", caseNumber))
      .unique();
    
    // Regenerate if case number already exists
    while (existingCase) {
      caseNumber = generateCaseNumber();
      existingCase = await ctx.db
        .query("cases")
        .withIndex("byCaseNumber", (q) => q.eq("caseNumber", caseNumber))
        .unique();
    }

    const caseId = await ctx.db.insert("cases", {
      caseNumber,
      status: (args.status as any) || "New Matter",
      workspaceId: args.workspaceId,
      
      // NAF party
      nafName: args.nafName,
      nafPhone: args.nafPhone,
      nafEmail: args.nafEmail,
      nafAddress: args.nafAddress,
      nafSuburb: args.nafSuburb,
      nafState: args.nafState as any,
      nafPostcode: args.nafPostcode,
      nafDob: args.nafDob,
      nafLicenceNo: args.nafLicenceNo,
      nafLicenceState: args.nafLicenceState as any,
      nafLicenceExp: args.nafLicenceExp,
      nafClaimNumber: args.nafClaimNumber,
      nafInsuranceCompany: args.nafInsuranceCompany,
      nafInsurer: args.nafInsurer,
      nafVehicleRego: args.nafVehicleRego,
      nafVehicleMake: args.nafVehicleMake,
      nafVehicleModel: args.nafVehicleModel,
      nafVehicleYear: args.nafVehicleYear,
      
      // AF party
      afName: args.afName,
      afPhone: args.afPhone,
      afEmail: args.afEmail,
      afAddress: args.afAddress,
      afSuburb: args.afSuburb,
      afState: args.afState as any,
      afPostcode: args.afPostcode,
      afClaimNumber: args.afClaimNumber,
      afInsuranceCompany: args.afInsuranceCompany,
      afInsurer: args.afInsurer,
      afVehicleRego: args.afVehicleRego,
      afVehicleMake: args.afVehicleMake,
      afVehicleModel: args.afVehicleModel,
      afVehicleYear: args.afVehicleYear,
      
      // Assignments
      assignedLawyerId: args.assignedLawyerId,
      assignedRentalCompanyId: args.assignedRentalCompanyId,
      
      // Financial defaults
      invoiced: 0,
      reserve: 0,
      agreed: 0,
      paid: 0,
      
      // Accident details
      accidentDate: args.accidentDate,
      accidentTime: args.accidentTime,
      accidentDescription: args.accidentDescription,
      accidentLocation: args.accidentLocation,
      
      // Metadata
      createdBy: user._id,
    });

    return caseId;
  },
});

// Update a case
export const update = mutation({
  args: {
    id: v.id("cases"),
    status: v.optional(v.string()),
    
    // NAF party details
    nafName: v.optional(v.string()),
    nafPhone: v.optional(v.string()),
    nafEmail: v.optional(v.string()),
    nafAddress: v.optional(v.string()),
    nafSuburb: v.optional(v.string()),
    nafState: v.optional(v.string()),
    nafPostcode: v.optional(v.string()),
    nafDob: v.optional(v.string()),
    nafLicenceNo: v.optional(v.string()),
    nafLicenceState: v.optional(v.string()),
    nafLicenceExp: v.optional(v.string()),
    nafClaimNumber: v.optional(v.string()),
    nafInsuranceCompany: v.optional(v.string()),
    nafInsurer: v.optional(v.string()),
    nafVehicleRego: v.optional(v.string()),
    nafVehicleMake: v.optional(v.string()),
    nafVehicleModel: v.optional(v.string()),
    nafVehicleYear: v.optional(v.number()),
    
    // AF party details
    afName: v.optional(v.string()),
    afPhone: v.optional(v.string()),
    afEmail: v.optional(v.string()),
    afAddress: v.optional(v.string()),
    afSuburb: v.optional(v.string()),
    afState: v.optional(v.string()),
    afPostcode: v.optional(v.string()),
    afClaimNumber: v.optional(v.string()),
    afInsuranceCompany: v.optional(v.string()),
    afInsurer: v.optional(v.string()),
    afVehicleRego: v.optional(v.string()),
    afVehicleMake: v.optional(v.string()),
    afVehicleModel: v.optional(v.string()),
    afVehicleYear: v.optional(v.number()),
    
    // Assignments
    assignedLawyerId: v.optional(v.id("contacts")),
    assignedRentalCompanyId: v.optional(v.id("contacts")),
    assignedBikeId: v.optional(v.id("bikes")),
    
    // Financial
    invoiced: v.optional(v.number()),
    reserve: v.optional(v.number()),
    agreed: v.optional(v.number()),
    paid: v.optional(v.number()),
    
    // Accident details
    accidentDate: v.optional(v.string()),
    accidentTime: v.optional(v.string()),
    accidentDescription: v.optional(v.string()),
    accidentLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo purposes, use default user
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

    const { id, ...updates } = args;
    
    // Convert string values to proper enum types
    const processedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        processedUpdates[key] = value;
      }
    }
    
    if (processedUpdates.status) {
      processedUpdates.status = processedUpdates.status as any;
    }
    if (processedUpdates.nafState) {
      processedUpdates.nafState = processedUpdates.nafState as any;
    }
    if (processedUpdates.nafLicenceState) {
      processedUpdates.nafLicenceState = processedUpdates.nafLicenceState as any;
    }
    if (processedUpdates.afState) {
      processedUpdates.afState = processedUpdates.afState as any;
    }

    processedUpdates.lastUpdatedBy = user._id;

    await ctx.db.patch(id, processedUpdates);
  },
});

// Get all cases
export const list = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    status: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let cases;
    
    // Apply filters based on arguments
    if (args.workspaceId && args.status) {
      // Can't use multiple indexes, so filter by workspace then filter in memory
      cases = await ctx.db
        .query("cases")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();
      cases = cases.filter(c => c.status === args.status);
    } else if (args.workspaceId) {
      cases = await ctx.db
        .query("cases")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();
    } else if (args.status) {
      cases = await ctx.db
        .query("cases")
        .withIndex("byStatus", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      cases = await ctx.db.query("cases").collect();
    }

    // Apply search filter if provided
    if (args.searchTerm) {
      const search = args.searchTerm.toLowerCase();
      cases = cases.filter((c) => 
        c.caseNumber.toLowerCase().includes(search) ||
        c.nafName.toLowerCase().includes(search) ||
        c.afName.toLowerCase().includes(search) ||
        c.nafVehicleRego?.toLowerCase().includes(search) ||
        c.afVehicleRego?.toLowerCase().includes(search)
      );
    }

    // Apply limit if provided
    if (args.limit) {
      cases = cases.slice(0, args.limit);
    }

    // Sort by creation time (newest first)
    cases.sort((a, b) => b._creationTime - a._creationTime);

    return cases;
  },
});

// Get a single case by ID
export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a case by case number
export const getByNumber = query({
  args: { caseNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("byCaseNumber", (q) => q.eq("caseNumber", args.caseNumber))
      .unique();
  },
});

// Delete a case
export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    // For demo purposes, allow all deletions (no auth required)

    // Delete related records first
    const documents = await ctx.db
      .query("documents")
      .withIndex("byCase", (q) => q.eq("caseId", args.id))
      .collect();
    
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    const communications = await ctx.db
      .query("communicationLogs")
      .withIndex("byCase", (q) => q.eq("caseId", args.id))
      .collect();
    
    for (const comm of communications) {
      await ctx.db.delete(comm._id);
    }

    const financials = await ctx.db
      .query("financialRecords")
      .withIndex("byCase", (q) => q.eq("caseId", args.id))
      .collect();
    
    for (const fin of financials) {
      await ctx.db.delete(fin._id);
    }

    const assignments = await ctx.db
      .query("bikeAssignments")
      .withIndex("byCase", (q) => q.eq("caseId", args.id))
      .collect();
    
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    // Finally delete the case
    await ctx.db.delete(args.id);
  },
});

// Get case statistics
export const getStats = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    let cases;
    
    if (args.workspaceId) {
      cases = await ctx.db
        .query("cases")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();
    } else {
      cases = await ctx.db.query("cases").collect();
    }

    const totalCases = cases.length;
    const totalInvoiced = cases.reduce((sum, c) => sum + c.invoiced, 0);
    const totalPaid = cases.reduce((sum, c) => sum + c.paid, 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    const statusCounts = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCases,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      statusCounts,
      averageInvoiced: totalCases > 0 ? totalInvoiced / totalCases : 0,
      collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
    };
  },
});

// Update financial information
export const updateFinancials = mutation({
  args: {
    id: v.id("cases"),
    invoiced: v.optional(v.number()),
    reserve: v.optional(v.number()),
    agreed: v.optional(v.number()),
    paid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...financials } = args;
    
    const updates: any = {};
    for (const [key, value] of Object.entries(financials)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);

    // Create financial record for audit trail
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

    if (user && Object.keys(updates).length > 0) {
      await ctx.db.insert("financialRecords", {
        caseId: id,
        type: "Adjustment",
        amount: updates.paid || updates.invoiced || updates.agreed || 0,
        date: new Date().toISOString(),
        description: `Financial update: ${Object.keys(updates).join(", ")}`,
        createdBy: user._id,
      });
    }
  },
});