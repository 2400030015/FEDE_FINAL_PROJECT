import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    urgency: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests;
    
    if (args.search) {
      requests = await ctx.db
        .query("requests")
        .withSearchIndex("search_requests", (q) => {
          let query = q.search("title", args.search!);
          if (args.category && args.category !== "all") {
            query = query.eq("category", args.category);
          }
          if (args.urgency && args.urgency !== "all") {
            query = query.eq("urgency", args.urgency);
          }
          return query.eq("status", "open");
        })
        .collect();
    } else {
      requests = await ctx.db
        .query("requests")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .order("desc")
        .collect();
      
      if (args.category && args.category !== "all") {
        requests = requests.filter(r => r.category === args.category);
      }
      
      if (args.urgency && args.urgency !== "all") {
        requests = requests.filter(r => r.urgency === args.urgency);
      }
    }
    
    // Sort by urgency priority
    const urgencyOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return requests.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
  },
});

export const getById = query({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("requests")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    urgency: v.string(),
    location: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create request");
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const requestId = await ctx.db.insert("requests", {
      ...args,
      requesterId: userId,
      requesterName: user.name || user.email || "Anonymous",
      requesterEmail: user.email || "",
      status: "open",
    });
    
    // Update user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        requestsCount: profile.requestsCount + 1,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: user.name || user.email || "Anonymous",
        location: args.location,
        donationsCount: 0,
        requestsCount: 1,
        completedDonations: 0,
        completedRequests: 0,
      });
    }
    
    return requestId;
  },
});

export const fulfill = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to fulfill request");
    }
    
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }
    
    if (request.status !== "open") {
      throw new Error("Request is no longer open");
    }
    
    if (request.requesterId === userId) {
      throw new Error("Cannot fulfill your own request");
    }
    
    await ctx.db.patch(args.requestId, {
      status: "fulfilled",
      fulfilledBy: userId,
      fulfilledAt: Date.now(),
    });
    
    // Update requester's completed count
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        completedRequests: profile.completedRequests + 1,
      });
    }
    
    return true;
  },
});
