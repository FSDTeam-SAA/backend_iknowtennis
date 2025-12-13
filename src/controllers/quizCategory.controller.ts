import { Request, Response, NextFunction } from "express";
import QuizCategory from "../models/quizCategory.model";
import { AppError } from "../utils/AppError";
import cloudinaryUpload from "../utils/cloudinaryUpload";
import cloudinaryDelete from "../utils/cloudinaryDelete";

// create quiz category
export const createQuizCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      quizCategoryName,
      quizCount,
      quizCategoryState,
      quizPoint,
      quizCategoryDetails,
    } = req.body;

    if (!quizCategoryName || !quizCategoryDetails)
      throw new AppError("Required fields are missing", 400);

    if (!req.file) throw new AppError("Quiz category image is required", 400);

    const { url, publicId } = await cloudinaryUpload(req.file.path);

    const quizCategory = await QuizCategory.create({
      quizCategoryName,
      quizCount,
      quizCategoryState,
      quizPoint,
      quizCategoryDetails,
      quizCategoryImage: url,
      quizCategoryImageId: publicId,
    });

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Quiz category created successfully",
      data: quizCategory,
    });
  } catch (error) {
    next(error);
  }
};

// update quiz category
export const updateQuizCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const quizCategory = await QuizCategory.findById(id);
    if (!quizCategory) throw new AppError("Quiz category not found", 404);

    if (req.file) {
      if (quizCategory.quizCategoryImageId) {
        await cloudinaryDelete(quizCategory.quizCategoryImageId);
      }

      const { url, publicId } = await cloudinaryUpload(req.file.path);

      quizCategory.quizCategoryImage = url;
      quizCategory.quizCategoryImageId = publicId;
    }

    quizCategory.quizCategoryName =
      req.body.quizCategoryName ?? quizCategory.quizCategoryName;
    quizCategory.quizCount = req.body.quizCount ?? quizCategory.quizCount;
    quizCategory.quizCategoryState =
      req.body.quizCategoryState ?? quizCategory.quizCategoryState;
    quizCategory.quizPoint = req.body.quizPoint ?? quizCategory.quizPoint;
    quizCategory.quizCategoryDetails =
      req.body.quizCategoryDetails ?? quizCategory.quizCategoryDetails;

    await quizCategory.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Quiz category updated successfully",
      data: quizCategory,
    });
  } catch (error) {
    next(error);
  }
};

// get all quiz categories
export const getAllQuizCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { quizCategoryName, sortByPoint, sortByCount } = req.query;

    const filter: any = {};

    if (quizCategoryName) {
      filter.quizCategoryName = {
        $regex: quizCategoryName,
        $options: "i",
      };
    }

    const sort: any = {};

    if (sortByPoint === "high") sort.quizPoint = -1;
    if (sortByPoint === "low") sort.quizPoint = 1;

    if (sortByCount === "high") sort.quizCount = -1;
    if (sortByCount === "low") sort.quizCount = 1;

    if (Object.keys(sort).length === 0) {
      sort.createdAt = -1;
    }

    const [categories, total] = await Promise.all([
      QuizCategory.find(filter).sort(sort).skip(skip).limit(limit),
      QuizCategory.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Quiz categories fetched successfully",
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get single quiz category
export const getSingleQuizCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const quizCategory = await QuizCategory.findById(id);

    if (!quizCategory) throw new AppError("Quiz category not found", 404);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Quiz category fetched successfully",
      data: quizCategory,
    });
  } catch (error) {
    next(error);
  }
};

// delete quiz category
export const deleteQuizCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizCategory = await QuizCategory.findById(req.params.id);
    if (!quizCategory) throw new AppError("Quiz category not found", 404);

    await cloudinaryDelete(quizCategory.quizCategoryImageId);
    await quizCategory.deleteOne();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Quiz category deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
