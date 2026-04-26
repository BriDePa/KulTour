const prisma = require("../lib/prisma");

const getSuggestions = async (req, res, next) => {
  try {
    const {
      mood,       // "tranquilo", "fiestero", "cultural", "romántico", "familiar"
      budget,     // "bajo", "medio", "alto"
      timeOfDay,  // "mañana", "tarde", "noche"
      groupType,  // "solo", "pareja", "amigos", "familia"
      cityId,
    } = req.query;

    const suggestions = { events: [], places: [] };

    // ─── Filtros por mood ────────────────────────────────────
    const placeWhere = { cityId: cityId || undefined };
    const eventWhere = {
      status: "PUBLISHED",
      date: { gte: new Date() },
      cityId: cityId || undefined,
    };

    if (mood === "fiestero" || mood === "noche") {
      placeWhere.category = { in: ["BAR", "CLUB"] };
      eventWhere.category = "Noche";
    } else if (mood === "cultural") {
      placeWhere.category = { in: ["MUSEUM", "CULTURAL_CENTER", "GALLERY", "THEATER"] };
      eventWhere.category = { in: ["Arte y Cultura", "Música"] };
    } else if (mood === "tranquilo") {
      placeWhere.category = { in: ["CAFE", "PARK"] };
    } else if (mood === "romántico") {
      placeWhere.category = { in: ["RESTAURANT", "CAFE", "BAR"] };
      placeWhere.priceRange = { in: ["$$", "$$$"] };
    } else if (mood === "familiar") {
      placeWhere.category = { in: ["RESTAURANT", "PARK", "MUSEUM"] };
      eventWhere.isFree = true;
    }

    // ─── Filtros por budget ──────────────────────────────────
    if (budget === "bajo") {
      eventWhere.price = { lte: 50 };
      placeWhere.priceRange = "$";
    } else if (budget === "medio") {
      eventWhere.price = { lte: 150 };
      placeWhere.priceRange = { in: ["$", "$$"] };
    }

    // ─── Filtros por hora del día ────────────────────────────
    if (timeOfDay === "mañana" || timeOfDay === "tarde") {
      if (!mood) placeWhere.category = { in: ["CAFE", "MUSEUM", "PARK", "RESTAURANT"] };
    } else if (timeOfDay === "noche") {
      if (!mood) placeWhere.category = { in: ["BAR", "CLUB", "RESTAURANT"] };
    }

    const [events, places] = await Promise.all([
      prisma.event.findMany({
        where: eventWhere,
        take: 4,
        orderBy: [{ featured: "desc" }, { date: "asc" }],
        include: {
          city: { select: { name: true } },
          organizer: { select: { name: true } },
        },
      }),
      prisma.place.findMany({
        where: placeWhere,
        take: 4,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        include: {
          city: { select: { name: true } },
        },
      }),
    ]);

    suggestions.events = events;
    suggestions.places = places;

    const suggestionText = buildSuggestionText({ mood, budget, timeOfDay, groupType });

    res.json({
      success: true,
      data: {
        ...suggestions,
        meta: {
          mood,
          budget,
          timeOfDay,
          groupType,
          text: suggestionText,
          totalResults: events.length + places.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

function buildSuggestionText({ mood, budget, timeOfDay, groupType }) {
  const moodMap = {
    tranquilo: "una tarde relajada",
    fiestero: "una noche de fiesta",
    cultural: "una salida cultural",
    romántico: "una velada romántica",
    familiar: "un plan familiar",
  };

  const groupMap = {
    solo: "solo/a",
    pareja: "en pareja",
    amigos: "con amigos",
    familia: "en familia",
  };

  const moodText = moodMap[mood] || "un plan perfecto";
  const groupText = groupMap[groupType] || "";

  return `Aquí tienes nuestras recomendaciones para ${moodText}${groupText ? ` ${groupText}` : ""} en La Paz.`;
}

module.exports = { getSuggestions };
