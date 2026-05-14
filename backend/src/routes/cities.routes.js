const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { events: true, places: true } },
      },
    });
    res.json({ success: true, data: { cities } });
  } catch (error) {
    next(error);
  }
});

router.get("/nearby", async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitud y longitud son requeridas",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const kmRadius = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Coordenadas inválidas",
      });
    }

    const cities = await prisma.$queryRaw`
      SELECT 
        c.*,
        (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(c.latitude)) *
            cos(radians(c.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(c.latitude))
          )
        ) AS distance
      FROM cities c
      WHERE (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(c.latitude))
        )
      ) <= ${kmRadius}
      ORDER BY distance ASC
    `;

    res.json({ success: true, data: { cities } });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { events: true, places: true } },
      },
    });
    if (!city) {
      return res.status(404).json({ success: false, message: "Ciudad no encontrada" });
    }
    res.json({ success: true, data: { city } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;