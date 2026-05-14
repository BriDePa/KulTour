import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Compass, MapPin, Sparkles, Calendar, Star, ArrowRight,
  Play, Users, Zap, Heart, ChevronRight, Map, Search,
} from "lucide-react";
import { useFeaturedEvents, useFeaturedPlaces } from "@/hooks/useKultour";
import EventCard from "@/components/shared/EventCard";
import PlaceCard from "@/components/shared/PlaceCard";
import { cn } from "@/lib/utils";

// ─── Animation Variants ──────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Floating blob SVG background ────────────────────────
function HeroBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-gradient-to-br from-brand-blue-400/20 to-brand-green-400/10 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-gradient-to-br from-brand-orange-400/15 to-brand-blue-400/10 blur-3xl" />
      <div className="absolute top-[40%] left-[40%] w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] rounded-full bg-brand-green-400/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-card border border-surface-100"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xl font-bold font-display text-surface-900">{value}</div>
        <div className="text-xs text-surface-500 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Benefit card ─────────────────────────────────────────
function BenefitCard({ icon: Icon, title, description, gradient, delay }: { icon: any; title: string; description: string; gradient: string; delay: number }) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 overflow-hidden"
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500", gradient)} />
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", gradient)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-display font-bold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Step card ────────────────────────────────────────────
function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
  return (
    <motion.div custom={delay} variants={fadeUp} className="flex gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white font-display font-bold text-lg flex items-center justify-center shadow-soft">
        {number}
      </div>
      <div>
        <h4 className="font-display font-bold text-surface-900 mb-1">{title}</h4>
        <p className="text-sm text-surface-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Navbar Landing ───────────────────────────────────────
function LandingNav() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 mt-3">
          <div className="glass rounded-2xl px-5 py-2.5 flex items-center gap-2 font-display font-bold text-lg shadow-soft">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gradient-blue">Kultour</span>
          </div>
          <nav className="glass rounded-2xl px-2 py-1.5 hidden md:flex items-center gap-1 shadow-soft">
            {[
              { to: "/explore", label: "Explorar" },
              { to: "/map", label: "Mapa" },
              { to: "/suggestions", label: "Sugerencias" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-white/80 transition-all duration-200"
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 shadow-soft">
            <button
              onClick={() => navigate("/explore")}
              className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-1.5 rounded-xl hover:bg-white/80 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="text-sm font-semibold bg-brand-blue-500 hover:bg-brand-blue-600 text-white px-4 py-1.5 rounded-xl transition-colors"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Main Landing Page ────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const { data: featuredEvents, isLoading: eventsLoading } = useFeaturedEvents();
  const { data: featuredPlaces, isLoading: placesLoading } = useFeaturedPlaces();

  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        <HeroBlobs />

        <motion.div style={{ y, opacity }} className="relative z-10 text-center section-container">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-600 text-sm font-semibold px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-green-500 animate-pulse" />
            La Paz, Bolivia · 3600 msnm
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-8xl font-display font-semibold text-surface-900 leading-[0.95] tracking-tight mb-6 text-balance"
          >
            Descubre lo{" "}
            <span className="text-gradient-brand relative">
              mejor
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path
                  d="M4 8 Q150 2 296 8"
                  stroke="url(#underline-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#1A4FFF" />
                    <stop offset="0.5" stopColor="#10B981" />
                    <stop offset="1" stopColor="#FF9000" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{" "}
            <br className="hidden sm:block" />
            de La Paz
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Eventos únicos, lugares increíbles y planes perfectos. Todo en un solo lugar,
            diseñado para que vivas la ciudad como nunca antes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/explore")}
              className="btn-primary text-base px-8 py-4 rounded-2xl shadow-glow"
            >
              <Compass className="w-5 h-5" />
              Explorar ahora
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/suggestions")}
              className="btn-secondary text-base px-8 py-4 rounded-2xl"
            >
              <Sparkles className="w-5 h-5" />
              Obtener sugerencias
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-4"
          >
            <StatPill icon={Calendar} value="50+" label="Eventos activos" color="bg-brand-blue-500" />
            <StatPill icon={MapPin} value="120+" label="Lugares únicos" color="bg-brand-green-500" />
            <StatPill icon={Users} value="5K+" label="Exploradores" color="bg-brand-orange-500" />
            <StatPill icon={Star} value="4.9" label="Valoración" color="bg-surface-700" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-surface-400"
        >
          <span className="text-xs font-medium">Desliza para explorar</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-surface-300 flex items-center justify-center"
          >
            <div className="w-1 h-2 rounded-full bg-surface-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BENEFITS SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-surface-50">
        <div className="section-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="badge-blue text-xs uppercase tracking-widest mb-4 inline-block"
            >
              ¿Por qué Kultour?
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-display font-bold text-surface-900 text-balance"
            >
              Todo lo que necesitas para
              <br />
              <span className="text-gradient-blue">vivir La Paz</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <BenefitCard
              icon={Search}
              title="Descubrimiento inteligente"
              description="Encuentra eventos y lugares filtrados por categoría, fecha, precio y estado de ánimo. Todo a un clic."
              gradient="bg-gradient-to-br from-brand-blue-500 to-brand-blue-700"
              delay={0}
            />
            <BenefitCard
              icon={Map}
              title="Mapa interactivo"
              description="Visualiza todos los eventos y lugares en un mapa en tiempo real. Navega La Paz de forma visual e intuitiva."
              gradient="bg-gradient-to-br from-brand-green-500 to-brand-green-700"
              delay={1}
            />
            <BenefitCard
              icon={Sparkles}
              title="Sugerencias personalizadas"
              description="Cuéntanos tu plan y nosotros te recomendamos los mejores lugares y eventos para tu momento."
              gradient="bg-gradient-to-br from-brand-orange-500 to-brand-orange-700"
              delay={2}
            />
            <BenefitCard
              icon={Calendar}
              title="Agenda completa"
              description="No te pierdas nada. Conciertos, ferias, exposiciones, tours y más. Toda la agenda cultural paceña."
              gradient="bg-gradient-to-br from-surface-700 to-surface-900"
              delay={3}
            />
            <BenefitCard
              icon={Heart}
              title="Lugares curados"
              description="Bares, restaurantes, centros culturales y museos seleccionados y verificados por nuestro equipo."
              gradient="bg-gradient-to-br from-red-500 to-rose-700"
              delay={4}
            />
            <BenefitCard
              icon={Zap}
              title="Para organizadores"
              description="Crea y gestiona tus eventos desde un panel profesional. Llega a miles de personas en La Paz."
              gradient="bg-gradient-to-br from-violet-500 to-purple-700"
              delay={5}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Steps */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.span variants={fadeUp} className="badge-green text-xs uppercase tracking-widest mb-4 inline-block">
                Cómo funciona
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-4xl font-display font-bold text-surface-900 mb-12 text-balance"
              >
                En tres pasos simples <br />
                <span className="text-gradient-green">empieza a explorar</span>
              </motion.h2>

              <div className="space-y-8">
                <StepCard
                  number="01"
                  title="Elige tu estado de ánimo"
                  description="¿Cultural, fiestero, romántico o tranquilo? Selecciona el tipo de experiencia que buscas."
                  delay={0}
                />
                <StepCard
                  number="02"
                  title="Explora eventos y lugares"
                  description="Navega por nuestra selección curada o usa el mapa interactivo para descubrir qué hay cerca."
                  delay={1}
                />
                <StepCard
                  number="03"
                  title="Vive la experiencia"
                  description="Compra tu entrada, reserva tu mesa o simplemente aparece. La Paz te espera."
                  delay={2}
                />
              </div>

              <motion.div variants={fadeUp} className="mt-10">
                <button
                  onClick={() => navigate("/suggestions")}
                  className="btn-primary"
                >
                  <Sparkles className="w-4 h-4" />
                  Obtener mi plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right: Visual mockup card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-brand-blue-500 via-brand-blue-600 to-brand-green-600 rounded-4xl p-8 shadow-card-hover overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/5" />

                <div className="relative z-10 text-white">
                  <div className="flex items-center gap-2 mb-6 text-white/80 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>La Paz, Bolivia</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-1">Festival de Jazz</h3>
                  <p className="text-white/70 text-sm mb-6">Plaza del Estudiante · Sábado 20 Abr</p>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold">Bs. 150</span>
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">2000 asientos</span>
                  </div>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {["Jazz", "Live Music", "Festival"].map((t) => (
                      <span key={t} className="bg-white/15 text-white/90 text-xs px-3 py-1.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-white text-brand-blue-600 font-bold py-3.5 rounded-2xl text-sm hover:bg-white/90 transition-colors">
                    Ver evento →
                  </button>
                </div>
              </div>

              {/* Floating rating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-card-hover flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-brand-orange-500 fill-brand-orange-500" />
                <span className="text-sm font-bold text-surface-900">4.9</span>
                <span className="text-xs text-surface-500">Excelente</span>
              </motion.div>

              {/* Floating attendees badge */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-card-hover flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-brand-green-500" />
                <span className="text-sm font-bold text-surface-900">1.2K</span>
                <span className="text-xs text-surface-500">asistentes</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED EVENTS PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-surface-50">
        <div className="section-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.span variants={fadeUp} className="badge-orange text-xs uppercase tracking-widest mb-3 inline-block">
                Próximos eventos
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-surface-900">
                No te los puedes perder
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <button
                onClick={() => navigate("/explore")}
                className="btn-ghost font-semibold"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-80" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredEvents?.slice(0, 3).map((event, i) => (
                <motion.div key={event.id} custom={i} variants={fadeUp}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED PLACES PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="section-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.span variants={fadeUp} className="badge-blue text-xs uppercase tracking-widest mb-3 inline-block">
                Lugares destacados
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-display font-bold text-surface-900">
                Los favoritos de La Paz
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <button onClick={() => navigate("/explore?tab=places")} className="btn-ghost font-semibold">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>

          {placesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-72" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredPlaces?.slice(0, 3).map((place, i) => (
                <motion.div key={place.id} custom={i} variants={fadeUp}>
                  <PlaceCard place={place} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-br from-brand-blue-600 via-brand-blue-700 to-surface-900 rounded-4xl p-12 lg:p-20 text-center text-white"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-brand-green-400 blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-orange-400 blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <div className="badge mb-6 bg-white/15 text-white border-white/20 inline-flex">
                <Zap className="w-3.5 h-3.5" />
                Gratis para siempre
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold mb-6 text-balance">
                Empieza a explorar <br />
                La Paz hoy
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
                Únete a miles de paceños que ya descubren la ciudad de una forma totalmente nueva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/explore")}
                  className="bg-white text-brand-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors inline-flex items-center gap-2 justify-center"
                >
                  <Compass className="w-5 h-5" />
                  Explorar eventos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/map")}
                  className="border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors inline-flex items-center gap-2 justify-center"
                >
                  <Map className="w-5 h-5" />
                  Ver en el mapa
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-surface-900 text-white py-10">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-white" />
            </div>
            Kultour
          </div>
          <p className="text-surface-500 text-sm">© 2024 Kultour — La Paz, Bolivia</p>
        </div>
      </footer>
    </div>
  );
}
