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
