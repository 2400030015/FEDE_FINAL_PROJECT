import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  donations: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    condition: v.string(),
    location: v.string(),
    donorId: v.id("users"),
    donorName: v.string(),
    donorEmail: v.string(),
    status: v.string(), // "available", "reserved", "completed"
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    reservedBy: v.optional(v.id("users")),
    reservedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_donor", ["donorId"])
    .searchIndex("search_donations", {
      searchField: "title",
      filterFields: ["category", "status"],
    }),

  requests: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    urgency: v.string(), // "low", "medium", "high", "urgent"
    location: v.string(),
    requesterId: v.id("users"),
    requesterName: v.string(),
    requesterEmail: v.string(),
    status: v.string(), // "open", "fulfilled", "closed"
    tags: v.array(v.string()),
    fulfilledBy: v.optional(v.id("users")),
    fulfilledAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_urgency", ["urgency"])
    .index("by_requester", ["requesterId"])
    .searchIndex("search_requests", {
      searchField: "title",
      filterFields: ["category", "status", "urgency"],
    }),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.optional(v.string()),
    location: v.string(),
    donationsCount: v.number(),
    requestsCount: v.number(),
    completedDonations: v.number(),
    completedRequests: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
