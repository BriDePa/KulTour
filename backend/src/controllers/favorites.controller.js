const prisma = require("../lib/prisma");

const getFavorites = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };

    if (type === "events") {
      where.eventId = { not: null };
    } else if (type === "places") {
      where.placeId = { not: null };
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            include: {
              city: { select: { id: true, name: true } },
              organizer: { select: { id: true, name: true } },
            },
          },
          place: {
            include: {
              city: { select: { id: true, name: true } },
              _count: { select: { reviews: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        favorites,
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

const addFavorite = async (req, res, next) => {
  try {
    const { eventId, placeId } = req.body;

    if (!eventId && !placeId) {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar eventId o placeId",
      });
    }

    if (eventId && placeId) {
      return res.status(400).json({
        success: false,
        message: "Solo puedes agregar un favorito a la vez (evento o lugar)",
      });
    }

    const existing = await prisma.favorite.findFirst({
      where: { userId: req.user.id, eventId: eventId || undefined, placeId: placeId || undefined },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Este elemento ya está en tus favoritos",
      });
    }

    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: "Evento no encontrado" });
      }
    }

    if (placeId) {
      const place = await prisma.place.findUnique({ where: { id: placeId } });
      if (!place) {
        return res.status(404).json({ success: false, message: "Lugar no encontrado" });
      }
    }

    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, eventId: eventId || null, placeId: placeId || null },
      include: {
        event: { include: { city: { select: { name: true } } } },
        place: { include: { city: { select: { name: true } } } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Agregado a favoritos",
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: "Favorito no encontrado" });
    }

    if (favorite.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.favorite.delete({ where: { id } });

    res.json({ success: true, message: "Eliminado de favoritos" });
  } catch (error) {
    next(error);
  }
};

const checkFavorite = async (req, res, next) => {
  try {
    const { itemId, type, eventId, placeId } = req.query;

    let targetId = itemId;
    let targetType = type;

    if (!targetId) {
      if (eventId) {
        targetId = eventId;
        targetType = "event";
      } else if (placeId) {
        targetId = placeId;
        targetType = "place";
      }
    }

    if (!targetType) {
      targetType = "place";
    }

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar itemId o eventId/placeId",
        code: "MISSING_ITEM_ID",
      });
    }

    const where = {
      userId: req.user.id,
      ...(targetType === "event" ? { eventId: targetId } : { placeId: targetId }),
    };

    const favorite = await prisma.favorite.findFirst({ where });

    res.json({ success: true, data: { isFavorite: !!favorite, favorite } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };