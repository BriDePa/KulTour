const prisma = require("../lib/prisma");

const getPlaces = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      cityId,
      featured,
      search,
      sortBy = "rating",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (category) where.category = category;
    if (cityId) where.cityId = cityId;
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          city: { select: { name: true } },
          owner: { select: { id: true, name: true } },
        },
      }),
      prisma.place.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        places,
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

const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        city: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!place) {
      return res.status(404).json({ success: false, message: "Lugar no encontrado" });
    }

    res.json({ success: true, data: { place } });
  } catch (error) {
    next(error);
  }
};

const createPlace = async (req, res, next) => {
  try {
    const {
      name,
      description,
      imageUrl,
      category,
      address,
      latitude,
      longitude,
      phone,
      website,
      instagram,
      openingHours,
      priceRange,
      tags,
      cityId,
    } = req.body;

    if (!name || !description || !address || !cityId) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: name, description, address, cityId",
      });
    }

    const place = await prisma.place.create({
      data: {
        name,
        description,
        imageUrl,
        category: category || "OTHER",
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        website,
        instagram,
        openingHours,
        priceRange,
        tags: tags || [],
        cityId,
        ownerId: req.user.id,
      },
      include: {
        city: { select: { name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Lugar creado exitosamente",
      data: { place },
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedPlaces = async (req, res, next) => {
  try {
    const places = await prisma.place.findMany({
      where: { featured: true },
      take: 6,
      orderBy: { rating: "desc" },
      include: {
        city: { select: { name: true } },
      },
    });

    res.json({ success: true, data: { places } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlaces, getPlaceById, createPlace, getFeaturedPlaces };
