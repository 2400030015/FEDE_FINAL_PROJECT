import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let donations;
    
    if (args.search) {
      donations = await ctx.db
        .query("donations")
        .withSearchIndex("search_donations", (q) => {
          let query = q.search("title", args.search!);
          if (args.category && args.category !== "all") {
            query = query.eq("category", args.category);
          }
          return query.eq("status", "available");
        })
        .collect();
    } else {
      donations = await ctx.db
        .query("donations")
        .withIndex("by_status", (q) => q.eq("status", "available"))
        .order("desc")
        .collect();
      
      if (args.category && args.category !== "all") {
        donations = donations.filter(d => d.category === args.category);
      }
    }
    
    return donations;
  },
});

export const getById = query({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserDonations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    condition: v.string(),
    location: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create donation");
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const donationId = await ctx.db.insert("donations", {
      ...args,
      donorId: userId,
      donorName: user.name || user.email || "Anonymous",
      donorEmail: user.email || "",
      status: "available",
    });
    
    // Update user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        donationsCount: profile.donationsCount + 1,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: user.name || user.email || "Anonymous",
        location: args.location,
        donationsCount: 1,
        requestsCount: 0,
        completedDonations: 0,
        completedRequests: 0,
      });
    }
    
    return donationId;
  },
});

export const reserve = mutation({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to reserve donation");
    }
    
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      throw new Error("Donation not found");
    }
    
    if (donation.status !== "available") {
      throw new Error("Donation is no longer available");
    }
    
    if (donation.donorId === userId) {
      throw new Error("Cannot reserve your own donation");
    }
    
    await ctx.db.patch(args.donationId, {
      status: "reserved",
      reservedBy: userId,
      reservedAt: Date.now(),
    });
    
    return true;
  },
});

export const complete = mutation({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      throw new Error("Donation not found");
    }
    
    if (donation.donorId !== userId) {
      throw new Error("Only the donor can mark as completed");
    }
    
    await ctx.db.patch(args.donationId, {
      status: "completed",
    });
    
    // Update donor's completed count
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        completedDonations: profile.completedDonations + 1,
      });
    }
    
    return true;
  },
});
