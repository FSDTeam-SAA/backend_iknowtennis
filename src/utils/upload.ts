import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "./AppError";

const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

const imageFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type", 400));
  }
};

const baseUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

export const uploadSingle = (fieldName: string) => baseUpload.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount = 5) =>
  baseUpload.array(fieldName, maxCount);

export const uploadFields = (fields: { name: string; maxCount?: number }[]) =>
  baseUpload.fields(fields);
