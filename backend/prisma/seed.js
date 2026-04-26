const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Kultour database...");

  // ─── Ciudad ──────────────────────────────────────────────
  const laPaz = await prisma.city.upsert({
    where: { name: "La Paz" },
    update: {},
    create: {
      name: "La Paz",
      country: "Bolivia",
      latitude: -16.5,
      longitude: -68.15,
      timezone: "America/La_Paz",
    },
  });

  console.log("✅ City created:", laPaz.name);

  // ─── Usuarios ─────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin123", 10);
  const orgPass = await bcrypt.hash("organizer123", 10);
  const userPass = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kultour.bo" },
    update: {},
    create: {
      email: "admin@kultour.bo",
      name: "Admin Kultour",
      password: adminPass,
      role: "ADMIN",
      bio: "Equipo Kultour",
    },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: "eventos@noche.bo" },
    update: {},
    create: {
      email: "eventos@noche.bo",
      name: "Noche Paceña Events",
      password: orgPass,
      role: "ORGANIZER",
      bio: "Organizamos los mejores eventos nocturnos de La Paz.",
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "cultura@lapaz.bo" },
    update: {},
    create: {
      email: "cultura@lapaz.bo",
      name: "Centro Cultural Bolivia",
      password: orgPass,
      role: "ORGANIZER",
      bio: "Promovemos el arte y la cultura boliviana.",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "juan@gmail.com" },
    update: {},
    create: {
      email: "juan@gmail.com",
      name: "Juan Mamani",
      password: userPass,
      role: "USER",
    },
  });

  console.log("✅ Users created");

  // ─── Lugares ─────────────────────────────────────────────
  const placesData = [
    {
      name: "Hallería Craft Beer",
      description:
        "El mejor bar de cervezas artesanales de La Paz. Con más de 30 variedades nacionales e importadas, terraza con vista a los Andes y música en vivo los viernes.",
      imageUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
      category: "BAR",
      address: "Calle Jaén 755, Casco Urbano Antiguo",
      latitude: -16.4955,
      longitude: -68.1334,
      phone: "+591 2-2123456",
      website: "https://halleria.bo",
      instagram: "@halleria.bo",
      rating: 4.8,
      priceRange: "$$",
      tags: ["cerveza artesanal", "música en vivo", "terraza", "noche"],
      featured: true,
      cityId: laPaz.id,
      ownerId: organizer1.id,
      openingHours: {
        lunes: "17:00 - 00:00",
        martes: "17:00 - 00:00",
        miercoles: "17:00 - 01:00",
        jueves: "17:00 - 01:00",
        viernes: "17:00 - 02:00",
        sabado: "14:00 - 02:00",
        domingo: "14:00 - 23:00",
      },
    },
    {
      name: "Gustu Restaurant",
      description:
        "Restaurante de cocina boliviana contemporánea, reconocido internacionalmente. Ingredientes locales transformados en alta gastronomía con vista panorámica a la ciudad.",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      category: "RESTAURANT",
      address: "Av. Costanera 10, Calacoto",
      latitude: -16.5378,
      longitude: -68.0773,
      phone: "+591 2-2117491",
      website: "https://gustu.bo",
      instagram: "@gusturestaurant",
      rating: 4.9,
      priceRange: "$$$",
      tags: ["alta cocina", "boliviano", "reservas", "romántico"],
      featured: true,
      cityId: laPaz.id,
    },
    {
      name: "Centro Cultural Simón I. Patiño",
      description:
        "Centro cultural de referencia en La Paz. Exposiciones de arte, teatro, danza y música en un edificio histórico del centro de la ciudad.",
      imageUrl:
        "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=800",
      category: "CULTURAL_CENTER",
      address: "Av. Ecuatorial 2503, Sopocachi",
      latitude: -16.5044,
      longitude: -68.1236,
      phone: "+591 2-2412808",
      website: "https://fundacionpatino.org",
      instagram: "@fundacion.patino",
      rating: 4.7,
      priceRange: "$",
      tags: ["arte", "cultura", "teatro", "exposiciones", "música"],
      featured: true,
      cityId: laPaz.id,
      ownerId: organizer2.id,
    },
    {
      name: "Café del Mundo",
      description:
        "Café bohemio en el corazón de Sopocachi. El lugar favorito de escritores, artistas y viajeros. Wifi gratis, buena música y el mejor café de altura del mundo.",
      imageUrl:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      category: "CAFE",
      address: "Calle Presbitero Medina 2234, Sopocachi",
      latitude: -16.5021,
      longitude: -68.1189,
      rating: 4.6,
      priceRange: "$",
      tags: ["café", "trabajo remoto", "wifi", "bohemio"],
      featured: false,
      cityId: laPaz.id,
    },
    {
      name: "Museo Nacional de Arte",
      description:
        "El principal museo de arte del país. Alberga colecciones permanentes de arte colonial, republicano y contemporáneo boliviano en un palacio barroco del siglo XVIII.",
      imageUrl:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800",
      category: "MUSEUM",
      address: "Calle Comercio esq. Socabaya, Centro",
      latitude: -16.4972,
      longitude: -68.1338,
      phone: "+591 2-2408600",
      rating: 4.5,
      priceRange: "$",
      tags: ["arte", "historia", "cultura", "colonial", "museo"],
      featured: false,
      cityId: laPaz.id,
    },
    {
      name: "Diesel Nacional",
      description:
        "El club más icónico de La Paz. Tres pisos de música electrónica, jazz y rock alternativo. Ambiente cosmopolita, barra premium y terraza con vista a la ciudad.",
      imageUrl:
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",
      category: "CLUB",
      address: "Av. 20 de Octubre 2271, Sopocachi",
      latitude: -16.5062,
      longitude: -68.1224,
      phone: "+591 2-2113028",
      instagram: "@dieselnacional",
      rating: 4.4,
      priceRange: "$$",
      tags: ["electrónica", "jazz", "rock", "noche", "copas"],
      featured: true,
      cityId: laPaz.id,
      ownerId: organizer1.id,
    },
  ];

  for (const place of placesData) {
    await prisma.place.create({ data: place });
  }

  console.log("✅ Places created:", placesData.length);

  // ─── Eventos ──────────────────────────────────────────────
  const now = new Date();
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

  const eventsData = [
    {
      title: "Festival de Jazz en las Alturas",
      description:
        "La séptima edición del festival de jazz más alto del mundo. Tres días de música en vivo con artistas nacionales e internacionales, en el corazón de La Paz a 3600msnm. Una experiencia única que fusiona jazz contemporáneo con ritmos andinos.",
      imageUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      date: addDays(now, 7),
      endDate: addDays(now, 9),
      price: 150,
      isFree: false,
      capacity: 2000,
      venue: "Plaza del Estudiante",
      address: "Plaza del Estudiante, Sopocachi, La Paz",
      latitude: -16.504,
      longitude: -68.1219,
      tags: ["jazz", "música", "festival", "internacional", "en vivo"],
      status: "PUBLISHED",
      category: "Música",
      featured: true,
      cityId: laPaz.id,
      organizerId: organizer1.id,
    },
    {
      title: "Exposición: Textiles del Altiplano",
      description:
        "Una muestra extraordinaria de más de 200 piezas textiles de comunidades del altiplano boliviano. Tejidos que cuentan historias de siglos, técnicas ancestrales y simbolismo cultural profundo. Entrada gratuita para estudiantes.",
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      date: addDays(now, 2),
      endDate: addDays(now, 30),
      price: 20,
      isFree: false,
      capacity: 500,
      venue: "Centro Cultural Simón I. Patiño",
      address: "Av. Ecuatorial 2503, Sopocachi",
      latitude: -16.5044,
      longitude: -68.1236,
      tags: ["arte", "textiles", "cultura", "exposición", "andino"],
      status: "PUBLISHED",
      category: "Arte y Cultura",
      featured: true,
      cityId: laPaz.id,
      organizerId: organizer2.id,
    },
    {
      title: "Noche de Cumbias en Diesel Nacional",
      description:
        "La noche más esperada del mes. Los mejores DJs de cumbia y salsa del país se reúnen para una noche épica. Dress code casual elegante. Preventa con 30% de descuento disponible hasta agotar stock.",
      imageUrl:
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
      date: addDays(now, 3),
      price: 80,
      isFree: false,
      capacity: 600,
      venue: "Diesel Nacional",
      address: "Av. 20 de Octubre 2271, Sopocachi",
      latitude: -16.5062,
      longitude: -68.1224,
      tags: ["cumbia", "salsa", "noche", "baile", "DJ"],
      status: "PUBLISHED",
      category: "Noche",
      featured: false,
      cityId: laPaz.id,
      organizerId: organizer1.id,
    },
    {
      title: "Feria Gastronómica Bolivia Sabe",
      description:
        "La feria gastronómica más grande de Bolivia vuelve a La Paz. Más de 50 stands con lo mejor de la cocina boliviana, talleres de cocina con chefs reconocidos, zona para niños y música folclórica en vivo. Entrada libre.",
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      date: addDays(now, 14),
      endDate: addDays(now, 16),
      price: 0,
      isFree: true,
      venue: "Campo Ferial Chuquiago Marka",
      address: "Campo Ferial, Av. del Ejército, La Paz",
      latitude: -16.4887,
      longitude: -68.1211,
      tags: ["gastronomía", "feria", "familiar", "gratuito", "comida"],
      status: "PUBLISHED",
      category: "Gastronomía",
      featured: true,
      cityId: laPaz.id,
      organizerId: organizer2.id,
    },
    {
      title: "Tour Nocturno: Leyendas de La Paz",
      description:
        "Recorre los rincones más misteriosos del casco viejo de La Paz mientras escuchas las leyendas urbanas más escalofriantes de la ciudad. Guía especializado, linterna y chocolate caliente incluidos. Cupos muy limitados.",
      imageUrl:
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800",
      date: addDays(now, 5),
      price: 60,
      isFree: false,
      capacity: 20,
      venue: "Plaza Murillo",
      address: "Plaza Murillo, Centro Histórico, La Paz",
      latitude: -16.4964,
      longitude: -68.1346,
      tags: ["tour", "nocturno", "historia", "leyendas", "centro"],
      status: "PUBLISHED",
      category: "Turismo",
      featured: false,
      cityId: laPaz.id,
      organizerId: organizer1.id,
    },
    {
      title: "Concierto Sinfónico: Beethoven 250",
      description:
        "La Orquesta Sinfónica Nacional de Bolivia presenta un tributo a Ludwig van Beethoven. Programa: Sinfonía N°5, Sonata Claro de Luna y la icónica 9ª Sinfonía con coro completo. Una noche para la eternidad.",
      imageUrl:
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800",
      date: addDays(now, 21),
      price: 120,
      isFree: false,
      capacity: 800,
      venue: "Teatro Municipal Alberto Saavedra Pérez",
      address: "Calle Genaro Sanjinés, Centro, La Paz",
      latitude: -16.496,
      longitude: -68.1337,
      tags: ["clásica", "sinfonía", "beethoven", "orquesta", "teatro"],
      status: "PUBLISHED",
      category: "Música",
      featured: false,
      cityId: laPaz.id,
      organizerId: organizer2.id,
    },
  ];

  for (const event of eventsData) {
    await prisma.event.create({ data: event });
  }

  console.log("✅ Events created:", eventsData.length);
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Test accounts:");
  console.log("   Admin:     admin@kultour.bo     / admin123");
  console.log("   Organizer: eventos@noche.bo     / organizer123");
  console.log("   User:      juan@gmail.com        / user123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
