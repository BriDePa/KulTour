const prisma = require("../lib/prisma");

const getReviewsByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) {
      return res.status(404).json({ success: false, message: "Lugar no encontrado" });
    }

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { placeId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.review.count({ where: { placeId } }),
      prisma.review.aggregate({
        where: { placeId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const ratingBreakdown = await prisma.review.groupBy({
      by: ["rating"],
      where: { placeId },
      _count: true,
    });

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingBreakdown.forEach((r) => {
      breakdown[r.rating] = r._count;
    });

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
        stats: {
          average: stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(1)) : 0,
          total: stats._count,
          breakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!placeId || !rating) {
      return res.status(400).json({
        success: false,
        message: "placeId y rating son requeridos",
      });
    }

    const parsedRating = parseInt(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "El rating debe ser un número entre 1 y 5",
      });
    }

    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) {
      return res.status(404).json({ success: false, message: "Lugar no encontrado" });
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Ya has publicado una reseña para este lugar. Puedes actualizarla.",
      });
    }

    const [review] = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          userId,
          placeId,
          rating: parsedRating,
          comment: comment ? comment.trim() : null,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      const stats = await tx.review.aggregate({
        where: { placeId },
        _avg: { rating: true },
      });

      await tx.place.update({
        where: { id: placeId },
        data: { rating: parseFloat((stats._avg.rating || 0).toFixed(1)) },
      });

      if (place.ownerId) {
        await tx.notification.create({
          data: {
            userId: place.ownerId,
            type: "REVIEW_RECEIVED",
            title: "Nueva reseña",
            message: `${req.user.name} dejó una reseña de ${parsedRating} estrellas en ${place.name}`,
          },
        });
      }

      return [r];
    });

    res.status(201).json({
      success: true,
      message: "Reseña publicada exitosamente",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    if (rating) {
      const parsedRating = parseInt(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: "El rating debe ser un número entre 1 y 5",
        });
      }
    }

    const [updated] = await prisma.$transaction(async (tx) => {
      const u = await tx.review.update({
        where: { id },
        data: {
          rating: rating ? parseInt(rating) : undefined,
          comment: comment !== undefined ? (comment ? comment.trim() : null) : undefined,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      const stats = await tx.review.aggregate({
        where: { placeId: review.placeId },
        _avg: { rating: true },
      });

      await tx.place.update({
        where: { id: review.placeId },
        data: { rating: parseFloat((stats._avg.rating || 0).toFixed(1)) },
      });

      return [u];
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

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (review.userId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });

      const stats = await tx.review.aggregate({
        where: { placeId: review.placeId },
        _avg: { rating: true },
      });

      await tx.place.update({
        where: { id: review.placeId },
        data: { rating: stats._avg.rating ? parseFloat((stats._avg.rating).toFixed(1)) : 0 },
      });
    });

    res.json({ success: true, message: "Reseña eliminada" });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          place: { select: { id: true, name: true, imageUrl: true, city: { select: { name: true } } } },
        },
      }),
      prisma.review.count({ where: { userId: req.user.id } }),
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
  getReviewsByPlace,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
};