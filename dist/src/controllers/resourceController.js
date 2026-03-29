import { resourceService } from "@/services/resourceService.js";
import { StatusCodes } from "http-status-codes";
const createResource = async (req, res, next) => {
    try {
        const createdResource = await resourceService.createResource(req.body);
        res.status(StatusCodes.CREATED).json(createdResource);
    }
    catch (error) {
        next(error);
    }
};
const getResourceById = async (req, res, next) => {
    try {
        const resourceId = Number(req.params.id);
        const studentId = Number(req.jwtDecoded?.id);
        const resource = await resourceService.getLearningResourceById(resourceId, studentId);
        res.status(StatusCodes.OK).json(resource);
    }
    catch (error) {
        next(error);
    }
};
const getResourceByPublicId = async (req, res, next) => {
    try {
        const { publicId } = req.params;
        const resource = await resourceService.getResourceByPublicId(publicId);
        res.status(StatusCodes.OK).json(resource);
    }
    catch (error) {
        next(error);
    }
};
const getAllResourcesByFileType = async (req, res, next) => {
    try {
        const { fileType } = req.params;
        const resources = await resourceService.getAllResourcesByFileType(fileType);
        res.status(StatusCodes.OK).json(resources);
    }
    catch (error) {
        next(error);
    }
};
const deleteResource = async (req, res, next) => {
    try {
        const { id } = req.params;
        await resourceService.deleteResource(Number(id));
        res
            .status(StatusCodes.OK)
            .json({ message: "Resource deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
const deleteResourceByPublicId = async (req, res, next) => {
    try {
        const { publicId } = req.params;
        await resourceService.deleteResourceByPublicId(publicId);
        res
            .status(StatusCodes.OK)
            .json({ message: "Resource deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
export const resourceController = {
    createResource,
    getResourceById,
    getResourceByPublicId,
    getAllResourcesByFileType,
    deleteResource,
    deleteResourceByPublicId,
};
//# sourceMappingURL=resourceController.js.map