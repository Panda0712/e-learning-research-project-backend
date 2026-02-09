import { env } from "@/configs/environment.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME!,
  api_key: env.CLOUDINARY_API_KEY!,
  api_secret: env.CLOUDINARY_API_SECRET!,
});

const streamUpload = (
  fileBuffer: Buffer,
  folderName: string,
  resource_type: "image" | "raw" | "video",
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName, resource_type },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const uploadImage = (buffer: Buffer) =>
  streamUpload(buffer, "elearning/images", "image");

const uploadDoc = (buffer: Buffer) =>
  streamUpload(buffer, "elearning/docs", "raw");

const uploadVideo = (buffer: Buffer) =>
  streamUpload(buffer, "elearning/videos", "video");

const uploadVideoLarge = (filePath: string) => {
  return cloudinaryV2.uploader.upload_large(filePath, {
    folder: "elearning/videos",
    resource_type: "video",
    chunk_size: 6 * 1024 * 1024,
  });
};

export const CloudinaryProvider = {
  uploadImage,
  uploadDoc,
  uploadVideo,
  uploadVideoLarge,
};
