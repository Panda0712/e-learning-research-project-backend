import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const addItemToOrder = async (data) => {
    try {
        // Check order exists
        const order = await prisma.order.findUnique({
            where: { id: data.orderId, isDestroyed: false },
        });
        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
        }
        // Check course exists
        const course = await prisma.course.findUnique({
            where: { id: data.courseId, isDestroyed: false },
        });
        if (!course) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
        }
        // Check if course already in order (unique constraint)
        const existingItem = await prisma.orderItem.findUnique({
            where: {
                orderId_courseId: {
                    orderId: data.orderId,
                    courseId: data.courseId,
                },
            },
        });
        if (existingItem && !existingItem.isDestroyed) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "This course already exists in this order!");
        }
        // If previously deleted, restore it
        if (existingItem && existingItem.isDestroyed) {
            const restoredItem = await prisma.orderItem.update({
                where: { id: existingItem.id },
                data: {
                    price: data.price,
                    lecturerId: data.lecturerId || null,
                    isDestroyed: false,
                },
                include: {
                    order: true,
                    course: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            lecturerName: true,
                            thumbnail: true,
                        },
                    },
                },
            });
            // Update order total price
            await updateOrderTotalPrice(data.orderId);
            return restoredItem;
        }
        // Create new item
        const newItem = await prisma.orderItem.create({
            data: {
                orderId: data.orderId,
                courseId: data.courseId,
                price: data.price,
                lecturerId: data.lecturerId || null,
            },
            include: {
                order: true,
                course: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        lecturerName: true,
                        thumbnail: true,
                    },
                },
            },
        });
        // Update order total price
        await updateOrderTotalPrice(data.orderId);
        return newItem;
    }
    catch (error) {
        throw error;
    }
};
const getOrderItemsByOrderId = async (orderId) => {
    try {
        // Check order exists
        const order = await prisma.order.findUnique({
            where: { id: orderId, isDestroyed: false },
        });
        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
        }
        const items = await prisma.orderItem.findMany({
            where: { orderId, isDestroyed: false },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        lecturerName: true,
                        thumbnail: true,
                        duration: true,
                        level: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return items;
    }
    catch (error) {
        throw error;
    }
};
const getOrderItemById = async (itemId) => {
    try {
        const item = await prisma.orderItem.findUnique({
            where: { id: itemId, isDestroyed: false },
            include: {
                order: {
                    select: {
                        id: true,
                        studentId: true,
                        totalPrice: true,
                        status: true,
                        createdAt: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        lecturerName: true,
                        thumbnail: true,
                        duration: true,
                        level: true,
                        overview: true,
                    },
                },
            },
        });
        if (!item) {
            throw new ApiError(StatusCodes.NOT_FOUND, "OrderItem not found!");
        }
        return item;
    }
    catch (error) {
        throw error;
    }
};
const removeItemFromOrder = async (itemId) => {
    try {
        const item = await prisma.orderItem.findUnique({
            where: { id: itemId, isDestroyed: false },
        });
        if (!item) {
            throw new ApiError(StatusCodes.NOT_FOUND, "OrderItem not found!");
        }
        // Soft delete
        const deletedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: { isDestroyed: true },
            include: {
                order: true,
                course: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
        });
        // Update order total price
        await updateOrderTotalPrice(item.orderId);
        return deletedItem;
    }
    catch (error) {
        throw error;
    }
};
const updateOrderItem = async (itemId, data) => {
    try {
        const item = await prisma.orderItem.findUnique({
            where: { id: itemId, isDestroyed: false },
        });
        if (!item) {
            throw new ApiError(StatusCodes.NOT_FOUND, "OrderItem not found!");
        }
        const updateData = {};
        if (data.price !== undefined) {
            updateData.price = data.price;
        }
        if (data.lecturerId !== undefined) {
            updateData.lecturerId = data.lecturerId || null;
        }
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: updateData,
            include: {
                order: true,
                course: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        lecturerName: true,
                        thumbnail: true,
                    },
                },
            },
        });
        // Update order total price if price changed
        if (data.price !== undefined) {
            await updateOrderTotalPrice(item.orderId);
        }
        return updatedItem;
    }
    catch (error) {
        throw error;
    }
};
const deleteOrderItem = async (itemId) => {
    try {
        const item = await prisma.orderItem.findUnique({
            where: { id: itemId, isDestroyed: false },
        });
        if (!item) {
            throw new ApiError(StatusCodes.NOT_FOUND, "OrderItem not found!");
        }
        // Hard delete from database
        await prisma.orderItem.delete({
            where: { id: itemId },
        });
        // Update order total price
        await updateOrderTotalPrice(item.orderId);
        return { message: "OrderItem deleted successfully!" };
    }
    catch (error) {
        throw error;
    }
};
// Helper function to recalculate order total price
const updateOrderTotalPrice = async (orderId) => {
    try {
        const items = await prisma.orderItem.findMany({
            where: { orderId, isDestroyed: false },
        });
        const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
        await prisma.order.update({
            where: { id: orderId },
            data: { totalPrice },
        });
    }
    catch (error) {
        console.error("Error updating order total price:", error);
    }
};
const getCommissionsByLecturerAndCourseId = async (lecturerId, courseId, query) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId, isDestroyed: false },
    });
    if (!course)
        throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    if (course.lecturerId !== lecturerId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
    }
    const skip = (query.page - 1) * query.limit;
    const rows = await prisma.orderItem.findMany({
        where: {
            courseId,
            lecturerId,
            isDestroyed: false,
            order: { isDestroyed: false },
        },
        include: {
            order: { include: { student: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
    });
    const mapped = rows
        .filter((r) => {
        const q = query.q.trim().toLowerCase();
        if (!q)
            return true;
        const name = `${r.order.student.firstName} ${r.order.student.lastName}`.toLowerCase();
        return name.includes(q);
    })
        .map((r) => {
        const price = Number(r.price || 0);
        return {
            id: r.id,
            customerName: `${r.order.student.firstName} ${r.order.student.lastName}`.trim(),
            date: r.createdAt,
            status: r.order.paymentStatus === "paid" ? "received" : "pending",
            price,
            commission: price * 0.95,
        };
    });
    const summary = {
        totalCommission: mapped.reduce((s, i) => s + i.commission, 0),
        received: mapped
            .filter((i) => i.status === "received")
            .reduce((s, i) => s + i.commission, 0),
        pending: mapped
            .filter((i) => i.status === "pending")
            .reduce((s, i) => s + i.commission, 0),
    };
    return { summary, data: mapped };
};
export const orderItemService = {
    addItemToOrder,
    getOrderItemsByOrderId,
    getOrderItemById,
    removeItemFromOrder,
    updateOrderItem,
    deleteOrderItem,
    getCommissionsByLecturerAndCourseId,
};
//# sourceMappingURL=orderItemService.js.map