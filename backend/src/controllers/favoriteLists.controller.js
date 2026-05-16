const prisma = require("../lib/prisma");

const getLists = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const lists = await prisma.favoriteList.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            event: { select: { id: true, title: true, imageUrl: true, date: true, venue: true } },
            place: { select: { id: true, name: true, imageUrl: true, category: true, address: true } },
          },
        },
      },
    });

    res.json({ success: true, data: { lists } });
  } catch (error) {
    next(error);
  }
};

const createList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Nombre es requerido" });
    }

    const list = await prisma.favoriteList.create({
      data: {
        userId,
        name,
        description,
        isPublic: isPublic || false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Lista creada exitosamente",
      data: { list },
    });
  } catch (error) {
    next(error);
  }
};

const updateList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, isPublic } = req.body;

    const list = await prisma.favoriteList.findUnique({ where: { id } });
    if (!list) {
      return res.status(404).json({ success: false, message: "Lista no encontrada" });
    }

    if (list.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    const updated = await prisma.favoriteList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json({
      success: true,
      message: "Lista actualizada",
      data: { list: updated },
    });
  } catch (error) {
    next(error);
  }
};

const deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.favoriteList.findUnique({ where: { id } });
    if (!list) {
      return res.status(404).json({ success: false, message: "Lista no encontrada" });
    }

    if (list.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.favoriteList.delete({ where: { id } });

    res.json({ success: true, message: "Lista eliminada" });
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { eventId, placeId } = req.body;

    if (!eventId && !placeId) {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar eventId o placeId",
      });
    }

    const list = await prisma.favoriteList.findUnique({ where: { id } });
    if (!list) {
      return res.status(404).json({ success: false, message: "Lista no encontrada" });
    }

    if (list.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    const existingItem = await prisma.favoriteListItem.findFirst({
      where: {
        listId: id,
        ...(eventId && { eventId }),
        ...(placeId && { placeId }),
      },
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: "El elemento ya está en esta lista",
      });
    }

    const item = await prisma.favoriteListItem.create({
      data: {
        listId: id,
        eventId: eventId || null,
        placeId: placeId || null,
      },
      include: {
        event: { select: { id: true, title: true, imageUrl: true } },
        place: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Elemento agregado a la lista",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.id;

    const list = await prisma.favoriteList.findUnique({ where: { id } });
    if (!list) {
      return res.status(404).json({ success: false, message: "Lista no encontrada" });
    }

    if (list.userId !== userId) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.favoriteListItem.delete({ where: { id: itemId } });

    res.json({ success: true, message: "Elemento eliminado de la lista" });
  } catch (error) {
    next(error);
  }
};

const getListItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.favoriteList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            event: { select: { id: true, title: true, description: true, imageUrl: true, date: true, venue: true, price: true, isFree: true } },
            place: { select: { id: true, name: true, description: true, imageUrl: true, category: true, address: true, rating: true } },
          },
        },
      },
    });

    if (!list) {
      return res.status(404).json({ success: false, message: "Lista no encontrada" });
    }

    if (list.userId !== userId && !list.isPublic) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    res.json({ success: true, data: { list } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLists,
  createList,
  updateList,
  deleteList,
  addItem,
  removeItem,
  getListItems,
};