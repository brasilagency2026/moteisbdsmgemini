import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch it.
      if (user.name !== args.name || user.email !== args.email) {
        await ctx.db.patch(user._id, { name: args.name, email: args.email });
      }
      return user._id;
    }

    // If it's a new identity, create a new User.
    return await ctx.db.insert("users", {
      userId,
      name: args.name,
      email: args.email,
      role: "user",
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
