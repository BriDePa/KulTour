const prisma = require("../lib/prisma");

const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      cityId,
      featured,
      search,
      isFree,
      sortBy = "date",
      order = "asc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: "PUBLISHED",
      date: { gte: new Date() },
    };

    if (category) where.category = category;
    if (cityId) where.cityId = cityId;
    if (featured === "true") where.featured = true;
    if (isFree === "true") where.isFree = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          city: { select: { name: true } },
          organizer: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
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

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        city: true,
        organizer: { select: { id: true, name: true, avatar: true, bio: true } },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Evento no encontrado",
      });
    }

    res.json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      date,
      endDate,
      price,
      isFree,
      capacity,
      venue,
      address,
      latitude,
      longitude,
      tags,
      category,
      ticketUrl,
      cityId,
    } = req.body;

    if (!title || !description || !date || !venue || !address || !cityId) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: title, description, date, venue, address, cityId",
      });
    }

    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      return res.status(404).json({ success: false, message: "Ciudad no encontrada" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        imageUrl,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        price: isFree ? 0 : parseFloat(price) || 0,
        isFree: isFree || false,
        capacity: capacity ? parseInt(capacity) : null,
        venue,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        tags: tags || [],
        category,
        ticketUrl,
        cityId,
        organizerId: req.user.id,
        status: "PUBLISHED",
      },
      include: {
        city: { select: { name: true } },
        organizer: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Evento creado exitosamente",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ success: false, message: "Evento no encontrado" });
    }

    if (event.organizerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
      include: {
        city: { select: { name: true } },
        organizer: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, message: "Evento actualizado", data: { event: updated } });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ success: false, message: "Evento no encontrado" });
    }

    if (event.organizerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }

    await prisma.event.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({ success: true, message: "Evento cancelado exitosamente" });
  } catch (error) {
    next(error);
  }
};

const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        featured: true,
        status: "PUBLISHED",
        date: { gte: new Date() },
      },
      take: 6,
      orderBy: { date: "asc" },
      include: {
        city: { select: { name: true } },
        organizer: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
};
