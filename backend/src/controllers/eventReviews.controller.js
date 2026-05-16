const prisma = require("../lib/prisma");

const getEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.eventReview.findMany({
        where: { eventId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.eventReview.count({ where: { eventId } }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createEventReview = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating es requerido y debe estar entre 1 y 5",
      });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ success: false, message: "Evento no encontrado" });
    }

    const existingReview = await prisma.eventReview.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Ya has realizado una reseña para este evento",
      });
    }

    const review = await prisma.eventReview.create({
      data: {
        userId,
        eventId,
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const reviews = await prisma.eventReview.findMany({
      where: { eventId },
      select: { rating: true },
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.event.update({
      where: { id: eventId },
      data: { rating: avgRating },
    });

    if (event.organizerId !== userId) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          type: "REVIEW_RECEIVED",
          title: "Nueva reseña en tu evento",
          message: `Un usuario ha dejado una reseña de ${rating} estrellas en "${event.title}"`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Reseña creada exitosamente",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

const updateEventReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await prisma.eventReview.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    const updated = await prisma.eventReview.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating: parseInt(rating) }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const reviews = await prisma.eventReview.findMany({
      where: { eventId: review.eventId },
      select: { rating: true },
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.event.update({
      where: { id: review.eventId },
      data: { rating: avgRating },
    });

    res.json({
      success: true,
      message: "Reseña actualizada",
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEventReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.eventReview.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (review.userId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.eventReview.delete({ where: { id } });

    const reviews = await prisma.eventReview.findMany({
      where: { eventId: review.eventId },
      select: { rating: true },
    });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.event.update({
      where: { id: review.eventId },
      data: { rating: avgRating },
    });

    res.json({ success: true, message: "Reseña eliminada" });
  } catch (error) {
    next(error);
  }
};

const getMyEventReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.eventReview.findMany({
        where: { userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          event: { select: { id: true, title: true, imageUrl: true } },
        },
      }),
      prisma.eventReview.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventReviews,
  createEventReview,
  updateEventReview,
  deleteEventReview,
  getMyEventReviews,
};