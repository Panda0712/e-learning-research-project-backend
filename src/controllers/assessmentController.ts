import { Request, Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessmentService.js';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await assessmentService.createAssessment(req.body);
    res.status(201).json({ message: "Tạo bài kiểm tra thành công", data });
  } catch (error) { next(error); }
};

const getLecturerList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lecturerId } = req.query;
    const data = await assessmentService.getAssessmentsForLecturer(Number(lecturerId));
    res.status(200).json({ data });
  } catch (error) { next(error); }
};

const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await assessmentService.getAssessmentById(Number(id));
    res.status(200).json({ data });
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await assessmentService.updateAssessment(Number(id), req.body);
    res.status(200).json({ message: "Cập nhật thành công", data });
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await assessmentService.deleteAssessment(Number(id));
    res.status(200).json({ message: "Đã xóa bài kiểm tra" });
  } catch (error) { next(error); }
};

const getSubmissionList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await assessmentService.getSubmissionsDetail(Number(id));
    res.status(200).json({ data });
  } catch (error) { next(error); }
};

const giveFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { submissionId, feedback } = req.body;
    const data = await assessmentService.updateFeedback(submissionId, feedback);
    res.status(200).json({ message: "Đã lưu nhận xét", data });
  } catch (error) { next(error); }
};

export const assessmentController = {
  create,
  getLecturerList,
  getOne,
  update,
  remove,
  getSubmissionList,
  giveFeedback
};