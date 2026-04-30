import express from "express";
import connectDB from "../db.js";

import { ObjectId } from "mongodb";
import cloudinary from "../cloudinary.js";
import { upload } from "../multer.js";

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

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("blogs");

    const { title, content, organization } = req.body;

    const newBlog = {
      title,
      content,
      organization,
      image: req.file ? req.file.path : null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newBlog);

    res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: err.message,
    });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("blogs");

    const { id } = req.params;
    const { title, content, organization } = req.body;

    const existingBlog = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(organization && { organization }),
      updatedAt: new Date(),
    };

    // 🔥 If new image uploaded → delete old one
    if (req.file) {
      // delete old image from Cloudinary
      if (existingBlog.image_public_id) {
        await cloudinary.uploader.destroy(existingBlog.image_public_id);
      }

      // store ONLY in image_url
      updateData.image_url = req.file.path;

      // keep public_id for deletion
      updateData.image_public_id = req.file.filename;
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
    });

  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: err.message,
    });
  }
});

export const blogRoutes = router