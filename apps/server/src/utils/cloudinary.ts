import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import streamifier from "streamifier";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * Supports both file path (local) and buffer (memory)
 */
export const uploadImage = async (
  file: Express.Multer.File | Buffer,
  folder: string = "appify"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    if (Buffer.isBuffer(file)) {
      streamifier.createReadStream(file).pipe(uploadStream);
    } else {
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    }
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Controller: Upload single image
 * POST /api/upload/image
 */
export const uploadSingleImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError("No image provided", 400);
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Fallback to local upload for development
      const localPath = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        data: {
          url: localPath,
          publicId: null,
        },
      });
    }

    const result = await uploadImage(req.file);

    res.json({
      success: true,
      data: result,
    });
  }
);

export default cloudinary;
