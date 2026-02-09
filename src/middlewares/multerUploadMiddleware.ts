import ApiError from "@/utils/ApiError.js";
import {
  ALLOW_DOC_TYPES,
  ALLOW_IMAGE_TYPES,
  ALLOW_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/utils/validators.js";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import path from "path";

const memory = multer.memoryStorage();

const videoDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/videos"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const createUpload = (
  allow: string[],
  limit: number,
  storage: multer.StorageEngine,
) => {
  return multer({
    storage,
    limits: { fileSize: limit },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile?: boolean) => void,
    ): void => {
      if (!allow.includes(file.mimetype)) {
        return cb(
          new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            "Format not allowed! Please upload a file with valid types: doc/mp4/jpg/png",
          ),
          false,
        );
      }

      cb(null, true);
    },
  });
};

const uploadImage = createUpload(ALLOW_IMAGE_TYPES, MAX_IMAGE_SIZE, memory);

const uploadDoc = createUpload(ALLOW_DOC_TYPES, MAX_FILE_SIZE, memory);

const uploadVideo = createUpload(ALLOW_VIDEO_TYPES, MAX_VIDEO_SIZE, memory);

const uploadVideoLarge = createUpload(
  ALLOW_VIDEO_TYPES,
  MAX_VIDEO_SIZE,
  videoDiskStorage,
);

export const multerUploadMiddleware = {
  uploadImage,
  uploadDoc,
  uploadVideo,
  uploadVideoLarge,
};
