import cloudinary from "cloudinary";
import { AppError } from "./AppError";

const cloudinaryDelete = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError("Failed to delete image from cloudinary", 500);
  }
};

export default cloudinaryDelete;
