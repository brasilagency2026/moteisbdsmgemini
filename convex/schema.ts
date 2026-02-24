import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("owner"), v.literal("user"))),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  motels: defineTable({
    ownerId: v.string(),
    name: v.string(),
    description: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("paused")),
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
    createdAt: v.number(),
  }).index("by_ownerId", ["ownerId"]).index("by_status", ["status"]),
});
