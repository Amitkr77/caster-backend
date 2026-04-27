import express from "express";
import connectDB from "../db.js";

const router = express.Router();

/**
 * GET /api/blogs
 * Optional query: ?organization=aiexperts
 */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    console.log("DB NAME:", db.databaseName);

    const { organization, page = 1, limit = 10 } = req.query;

    // Build filter dynamically
    const filter = {};

    if (organization) {
      filter.organization = organization;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const collection = db.collection("blogs");

    if (!collection) {
      return res.status(500).json({
        success: false,
        message: "Blog collection not found in database",
      });
    } else {
      console.log("Blog collection found in database");
    }

    const [blogs, total] = await Promise.all([
      collection
        .find(filter)
        .skip(skip)
        .limit(Number(limit))
        .toArray(),

      collection.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });

  } catch (err) {
    console.error("BLOG API ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: err.message,
    });
  }
});

export const blogRoutes = router;