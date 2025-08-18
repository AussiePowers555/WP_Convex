import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Australian states enum
const australianState = v.union(
  v.literal("NSW"),
  v.literal("VIC"),
  v.literal("QLD"),
  v.literal("WA"),
  v.literal("SA"),
  v.literal("TAS"),
  v.literal("ACT"),
  v.literal("NT")
);

// Case status progression
const caseStatus = v.union(
  v.literal("New Matter"),
  v.literal("Customer Contacted"),
  v.literal("Awaiting Approval"),
  v.literal("Bike Delivered"),
  v.literal("Bike Returned"),
  v.literal("Demands Sent"),
  v.literal("Awaiting Settlement"),
  v.literal("Settlement Agreed"),
  v.literal("Paid"),
  v.literal("Closed")
);

// Document types
const documentType = v.union(
  v.literal("claims"),
  v.literal("not-at-fault-rental"),
  v.literal("certis-rental"),
  v.literal("authority-to-act"),
  v.literal("direction-to-pay"),
  v.literal("signed-agreement"),
  v.literal("other")
);

// Communication types
const communicationType = v.union(
  v.literal("Email"),
  v.literal("Phone"),
  v.literal("SMS"),
  v.literal("Letter"),
  v.literal("Meeting"),
  v.literal("Other")
);

// Contact types
const contactType = v.union(
  v.literal("Client"),
  v.literal("Lawyer"),
  v.literal("Insurer"),
  v.literal("Repairer"),
  v.literal("Rental Company"),
  v.literal("Service Center"),
  v.literal("Other")
);

// User roles
const userRole = v.union(
  v.literal("admin"),
  v.literal("developer"),
  v.literal("lawyer"),
  v.literal("rental_company"),
  v.literal("workspace_user")
);

// User status
const userStatus = v.union(
  v.literal("active"),
  v.literal("pending_password_change"),
  v.literal("disabled")
);

// Bike status
const bikeStatus = v.union(
  v.literal("Available"),
  v.literal("On Hire"),
  v.literal("Service"),
  v.literal("Repair"),
  v.literal("Unavailable")
);

export default defineSchema({
  // Extended users table with role-based access
  users: defineTable({
    name: v.string(),
    email: v.string(),
    externalId: v.string(), // Clerk ID
    role: v.optional(userRole),
    status: v.optional(userStatus),
    workspaceId: v.optional(v.id("workspaces")),
    contactId: v.optional(v.id("contacts")),
    firstLogin: v.optional(v.boolean()),
    rememberLogin: v.optional(v.boolean()),
    lastLogin: v.optional(v.number()),
  })
    .index("byExternalId", ["externalId"])
    .index("byEmail", ["email"])
    .index("byWorkspace", ["workspaceId"]),

  // Workspaces for multi-tenant support
  workspaces: defineTable({
    name: v.string(),
    contactId: v.id("contacts"),
    type: v.optional(v.string()),
    active: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("byContact", ["contactId"])
    .index("byActive", ["active"]),

  // Contacts (lawyers, insurers, rental companies, etc.)
  contacts: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    type: contactType,
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    suburb: v.optional(v.string()),
    state: v.optional(australianState),
    postcode: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("byType", ["type"])
    .index("byEmail", ["email"]),

  // Main cases table
  cases: defineTable({
    caseNumber: v.string(), // Format: WWMM### (Week-Month-Sequence)
    workspaceId: v.optional(v.id("workspaces")),
    status: caseStatus,
    
    // Not-at-fault (NAF) party details
    nafName: v.string(),
    nafPhone: v.optional(v.string()),
    nafEmail: v.optional(v.string()),
    nafAddress: v.optional(v.string()),
    nafSuburb: v.optional(v.string()),
    nafState: v.optional(australianState),
    nafPostcode: v.optional(v.string()),
    nafDob: v.optional(v.string()),
    nafLicenceNo: v.optional(v.string()),
    nafLicenceState: v.optional(australianState),
    nafLicenceExp: v.optional(v.string()),
    nafClaimNumber: v.optional(v.string()),
    nafInsuranceCompany: v.optional(v.string()),
    nafInsurer: v.optional(v.string()),
    nafVehicleRego: v.optional(v.string()),
    nafVehicleMake: v.optional(v.string()),
    nafVehicleModel: v.optional(v.string()),
    nafVehicleYear: v.optional(v.number()),
    
    // At-fault (AF) party details
    afName: v.string(),
    afPhone: v.optional(v.string()),
    afEmail: v.optional(v.string()),
    afAddress: v.optional(v.string()),
    afSuburb: v.optional(v.string()),
    afState: v.optional(australianState),
    afPostcode: v.optional(v.string()),
    afClaimNumber: v.optional(v.string()),
    afInsuranceCompany: v.optional(v.string()),
    afInsurer: v.optional(v.string()),
    afVehicleRego: v.optional(v.string()),
    afVehicleMake: v.optional(v.string()),
    afVehicleModel: v.optional(v.string()),
    afVehicleYear: v.optional(v.number()),
    
    // Case assignments
    assignedLawyerId: v.optional(v.id("contacts")),
    assignedRentalCompanyId: v.optional(v.id("contacts")),
    assignedBikeId: v.optional(v.id("bikes")),
    
    // Financial summary (denormalized for quick access)
    invoiced: v.float64(),
    reserve: v.float64(),
    agreed: v.float64(),
    paid: v.float64(),
    
    // Accident details
    accidentDate: v.optional(v.string()),
    accidentTime: v.optional(v.string()),
    accidentDescription: v.optional(v.string()),
    accidentLocation: v.optional(v.string()),
    accidentDiagramId: v.optional(v.id("_storage")), // Reference to stored file
    
    // Metadata
    createdBy: v.id("users"),
    lastUpdatedBy: v.optional(v.id("users")),
  })
    .index("byCaseNumber", ["caseNumber"])
    .index("byWorkspace", ["workspaceId"])
    .index("byStatus", ["status"])
    .index("byLawyer", ["assignedLawyerId"])
    .index("byRentalCompany", ["assignedRentalCompanyId"])
    .index("byBike", ["assignedBikeId"]),

  // Bikes/Fleet management
  bikes: defineTable({
    registration: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.optional(v.string()),
    vin: v.optional(v.string()),
    engineNumber: v.optional(v.string()),
    status: bikeStatus,
    assignedCaseId: v.optional(v.id("cases")),
    dailyRate: v.float64(),
    weeklyRate: v.float64(),
    monthlyRate: v.float64(),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.float64()),
    currentValue: v.optional(v.float64()),
    lastServiceDate: v.optional(v.string()),
    nextServiceDue: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("byRegistration", ["registration"])
    .index("byStatus", ["status"])
    .index("byAssignedCase", ["assignedCaseId"]),

  // Bike assignments history
  bikeAssignments: defineTable({
    bikeId: v.id("bikes"),
    caseId: v.id("cases"),
    assignedDate: v.string(),
    returnedDate: v.optional(v.string()),
    dailyRate: v.float64(),
    totalDays: v.optional(v.number()),
    totalCost: v.optional(v.float64()),
    notes: v.optional(v.string()),
    assignedBy: v.id("users"),
  })
    .index("byBike", ["bikeId"])
    .index("byCase", ["caseId"])
    .index("byAssignedDate", ["assignedDate"]),

  // Financial records
  financialRecords: defineTable({
    caseId: v.id("cases"),
    type: v.union(
      v.literal("Invoice"),
      v.literal("Settlement"),
      v.literal("Payment"),
      v.literal("Adjustment")
    ),
    amount: v.float64(),
    date: v.string(),
    description: v.optional(v.string()),
    reference: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("byCase", ["caseId"])
    .index("byType", ["type"])
    .index("byDate", ["date"]),

  // Documents storage
  documents: defineTable({
    caseId: v.id("cases"),
    name: v.string(),
    type: documentType,
    fileId: v.id("_storage"),
    uploadedAt: v.number(),
    uploadedBy: v.id("users"),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  })
    .index("byCase", ["caseId"])
    .index("byType", ["type"]),

  // Communication logs
  communicationLogs: defineTable({
    caseId: v.id("cases"),
    type: communicationType,
    direction: v.union(v.literal("Inbound"), v.literal("Outbound")),
    subject: v.optional(v.string()),
    content: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.id("users"),
  })
    .index("byCase", ["caseId"])
    .index("byType", ["type"]),

  // Digital signatures
  digitalSignatures: defineTable({
    documentId: v.id("documents"),
    caseId: v.id("cases"),
    token: v.string(),
    tokenExpiry: v.number(),
    signerName: v.string(),
    signerEmail: v.string(),
    signedAt: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    signatureData: v.optional(v.string()), // Base64 encoded signature image
    status: v.union(
      v.literal("pending"),
      v.literal("signed"),
      v.literal("expired"),
      v.literal("revoked")
    ),
  })
    .index("byToken", ["token"])
    .index("byCase", ["caseId"])
    .index("byDocument", ["documentId"])
    .index("byStatus", ["status"]),

  // Insurance companies
  insuranceCompanies: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    claimsEmail: v.optional(v.string()),
    claimsPhone: v.optional(v.string()),
    active: v.boolean(),
  })
    .index("byName", ["name"])
    .index("byCode", ["code"]),

  // Commitments/Tasks
  commitments: defineTable({
    caseId: v.optional(v.id("cases")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id("users")),
  })
    .index("byCase", ["caseId"])
    .index("byStatus", ["status"])
    .index("byAssignedTo", ["assignedTo"])
    .index("byDueDate", ["dueDate"]),

  // Email templates
  emailTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("collection"),
      v.literal("reminder"),
      v.literal("notification"),
      v.literal("custom")
    ),
    variables: v.optional(v.array(v.string())), // List of available variables
    active: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("byType", ["type"])
    .index("byActive", ["active"]),

  // Audit logs for compliance
  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.string()), // JSON string of changes
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("byUser", ["userId"])
    .index("byEntity", ["entityType", "entityId"])
    .index("byTimestamp", ["timestamp"]),
});