const prisma = require("../lib/prisma");

const globalSearch = async (req, res, next) => {
  try {
    const {
      q,
      type,
      cityId,
      category,
      cursor,
      limit = 12,
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "El término de búsqueda debe tener al menos 2 caracteres",
      });
    }

    const searchTerm = q.trim();
    const take = Math.min(parseInt(limit), 50);
    const isCursorBased = !!cursor;

    const searchQuery = {
      contains: searchTerm,
      mode: "insensitive",
    };

    const baseWhere = { ...(cityId && { cityId }) };

    const searchType = type || "all";

    const eventTake = searchType === "places" ? 0 : take;
    const placeTake = searchType === "events" ? 0 : take;

    const [events, places] = await Promise.all([
      prisma.event.findMany({
        where: {
          ...baseWhere,
          status: "PUBLISHED",
          OR: [
            { title: searchQuery },
            { description: searchQuery },
            { venue: searchQuery },
            { tags: { has: searchTerm } },
          ],
          ...(category && { category }),
          ...(isCursorBased && cursor.startsWith("event:") && {
            id: { gt: cursor.replace("event:", "") },
          }),
        },
        take: eventTake,
        orderBy: [
          { featured: "desc" },
          { date: "asc" },
        ],
        include: {
          city: { select: { id: true, name: true } },
          organizer: { select: { id: true, name: true } },
        },
      }),
      prisma.place.findMany({
        where: {
          ...baseWhere,
          OR: [
            { name: searchQuery },
            { description: searchQuery },
            { address: searchQuery },
            { tags: { has: searchTerm } },
          ],
          ...(category && { category }),
          ...(isCursorBased && cursor.startsWith("place:") && {
            id: { gt: cursor.replace("place:", "") },
          }),
        },
        take: placeTake,
        orderBy: [
          { featured: "desc" },
          { rating: "desc" },
        ],
        include: {
          city: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    let nextCursor = null;
    if (eventTake > 0 && events.length === eventTake) {
      nextCursor = `event:${events[events.length - 1]?.id}`;
    } else if (placeTake > 0 && places.length === placeTake) {
      nextCursor = `place:${places[places.length - 1]?.id}`;
    }

    res.json({
      success: true,
      data: {
        events: searchType !== "places" ? events : [],
        places: searchType !== "events" ? places : [],
        meta: {
          query: searchTerm,
          totalEvents: searchType !== "places" ? events.length : 0,
          totalPlaces: searchType !== "events" ? places.length : 0,
          hasMore: !!nextCursor,
          nextCursor,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };