import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMotel = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    }),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    tripadvisor: v.optional(v.string()),
    hours: v.optional(v.string()),
    periods: v.optional(v.object({
      twoHours: v.optional(v.string()),
      fourHours: v.optional(v.string()),
      twelveHours: v.optional(v.string()),
    })),
    services: v.array(v.string()),
    accessories: v.array(v.string()),
    photos: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("motels", {
      ownerId: identity.subject,
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateMotel = mutation({
  args: {
    id: v.id("motels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    plan: v.optional(v.union(v.literal("free"), v.literal("premium"))),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    })),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    tripadvisor: v.optional(v.string()),
    hours: v.optional(v.string()),
    periods: v.optional(v.object({
      twoHours: v.optional(v.string()),
      fourHours: v.optional(v.string()),
      twelveHours: v.optional(v.string()),
    })),
    services: v.optional(v.array(v.string())),
    accessories: v.optional(v.array(v.string())),
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const motel = await ctx.db.get(args.id);
    if (!motel) throw new Error("Not found");
    
    // Check if owner or admin
    const user = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (motel.ownerId !== identity.subject && user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getMyMotels = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const motels = await ctx.db
      .query("motels")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", identity.subject))
      .collect();
      
    return Promise.all(motels.map(async (m) => ({
      ...m,
      photoUrls: await Promise.all(m.photos.map(p => ctx.storage.getUrl(p)))
    })));
  },
});

export const getApprovedMotels = query({
  handler: async (ctx) => {
    const motels = await ctx.db
      .query("motels")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
      
    return Promise.all(motels.map(async (m) => ({
      ...m,
      photoUrls: await Promise.all(m.photos.map(p => ctx.storage.getUrl(p)))
    })));
  },
});

export const getMotelById = query({
  args: { id: v.id("motels") },
  handler: async (ctx, args) => {
    const motel = await ctx.db.get(args.id);
    if (!motel) return null;
    
    return {
      ...motel,
      photoUrls: await Promise.all(motel.photos.map(p => ctx.storage.getUrl(p)))
    };
  }
});

export const getAllMotelsAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const user = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const motels = await ctx.db.query("motels").collect();
    return Promise.all(motels.map(async (m) => ({
      ...m,
      photoUrls: await Promise.all(m.photos.map(p => ctx.storage.getUrl(p)))
    })));
  },
});

export const updateMotelStatus = mutation({
  args: {
    id: v.id("motels"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const user = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteMotel = mutation({
  args: {
    id: v.id("motels"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const motel = await ctx.db.get(args.id);
    if (!motel) throw new Error("Not found");
    
    const user = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", identity.subject)).unique();
    if (motel.ownerId !== identity.subject && user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Delete photos from storage
    for (const photoId of motel.photos) {
      await ctx.storage.delete(photoId);
    }

    await ctx.db.delete(args.id);
  },
});
