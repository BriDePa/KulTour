import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, ArrowRight, Palette, PartyPopper, Coffee, Heart, Users, User, CircleDollarSign, Gem, Sunrise, Sun, Moon, HelpCircle, Theater, DollarSign, MapPin } from "lucide-react";
import { useSuggestions } from "@/hooks/useKultour";
import EventCard from "@/components/shared/EventCard";
import PlaceCard from "@/components/shared/PlaceCard";
import { cn } from "@/lib/utils";
import type { SuggestionQuery } from "@/types";

function OptionButton({
  icon: Icon, label, description, selected, onClick, iconColor,
}: {
  icon: any; label: string; description: string; selected: boolean; onClick: () => void; iconColor?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3",
        selected
          ? "border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30 shadow-glow dark:shadow-glow-dark"
          : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:bg-brand-blue-50/30 dark:hover:bg-brand-blue-900/20"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconColor || "bg-brand-blue-100 dark:bg-brand-blue-900/30")}>
        <Icon className={cn("w-5 h-5", selected ? "text-brand-blue-500" : "text-surface-500 dark:text-surface-400")} />
      </div>
      <div>
        <p className="font-semibold text-surface-900 dark:text-surface-100 text-sm">{label}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue-500 dark:bg-brand-blue-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </motion.button>
  );
}

function Step({ number, title, children, active }: { number: number; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <div className={cn("transition-opacity duration-300", active ? "opacity-100" : "opacity-60")}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white text-sm font-bold flex items-center justify-center">
          {number}
        </div>
        <h3 className="font-display font-bold text-surface-900 dark:text-surface-50">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SuggestionsPage() {
  const [query, setQuery] = useState<SuggestionQuery>({});
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, refetch } = useSuggestions(query, submitted);

  const handleSubmit = () => {
    if (!query.mood) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setQuery({});
    setSubmitted(false);
  };

  const canSubmit = !!query.mood;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 dark:from-violet-700 to-brand-blue-700 dark:to-surface-800 pt-10 pb-20">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-surface-800/40 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">
              ¿Qué plan buscas?
            </h1>
            <p className="text-white/70 dark:text-white/60 text-lg max-w-xl mx-auto">
              Cuéntanos cómo te sientes y encontramos el plan perfecto para ti en La Paz
            </p>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-10">
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-surface-800 rounded-4xl shadow-card-hover dark:shadow-card-hover-dark p-8 space-y-8">
              {/* Step 1: Mood */}
              <Step number={1} title="¿Cuál es tu estado de ánimo?" active>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "cultural", icon: Theater, iconColor: "bg-violet-100 dark:bg-violet-900/30", label: "Cultural", description: "Arte, museos y teatro" },
                    { value: "fiestero", icon: PartyPopper, iconColor: "bg-pink-100 dark:bg-pink-900/30", label: "Fiestero", description: "Música, bares y clubs" },
                    { value: "tranquilo", icon: Coffee, iconColor: "bg-amber-100 dark:bg-amber-900/30", label: "Tranquilo", description: "Cafés, parques y relax" },
                    { value: "romántico", icon: Heart, iconColor: "bg-red-100 dark:bg-red-900/30", label: "Romántico", description: "Cenas y lugares íntimos" },
                    { value: "familiar", icon: Users, iconColor: "bg-green-100 dark:bg-green-900/30", label: "Familiar", description: "Planes para toda la familia" },
                  ].map((opt) => (
                    <OptionButton
                      key={opt.value}
                      icon={opt.icon}
                      iconColor={opt.iconColor}
                      label={opt.label}
                      description={opt.description}
                      selected={query.mood === opt.value}
                      onClick={() => setQuery((q) => ({ ...q, mood: opt.value as any }))}
                    />
                  ))}
                </div>
              </Step>

              {/* Step 2: Group */}
              <Step number={2} title="¿Con quién vas?" active={!!query.mood}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "solo", icon: User, iconColor: "bg-surface-100 dark:bg-surface-700", label: "Solo/a" },
                    { value: "pareja", icon: Heart, iconColor: "bg-red-100 dark:bg-red-900/30", label: "En pareja" },
                    { value: "amigos", icon: Users, iconColor: "bg-blue-100 dark:bg-blue-900/30", label: "Amigos" },
                    { value: "familia", icon: Users, iconColor: "bg-green-100 dark:bg-green-900/30", label: "Familia" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, groupType: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium",
                        query.groupType === opt.value
                          ? "border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400"
                          : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:border-brand-blue-200 dark:hover:border-brand-blue-600"
                      )}
                    >
                      <opt.icon className={cn("w-6 h-6", query.groupType === opt.value ? "text-brand-blue-500" : "text-surface-500 dark:text-surface-400")} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Step>

              {/* Step 3: Budget */}
              <Step number={3} title="¿Cuál es tu presupuesto?" active={!!query.mood}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "bajo", icon: CircleDollarSign, iconColor: "bg-brand-green-50 dark:bg-brand-green-900/30", label: "Económico", desc: "< Bs. 50" },
                    { value: "medio", icon: CircleDollarSign, iconColor: "bg-brand-orange-50 dark:bg-brand-orange-900/30", label: "Moderado", desc: "Bs. 50–150" },
                    { value: "alto", icon: Gem, iconColor: "bg-violet-50 dark:bg-violet-900/30", label: "Premium", desc: "> Bs. 150" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, budget: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-sm",
                        query.budget === opt.value
                          ? "border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30"
                          : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-brand-blue-200 dark:hover:border-brand-blue-600"
                      )}
                    >
                      <opt.icon className={cn("w-6 h-6", opt.value === "bajo" ? "text-brand-green-500" : opt.value === "medio" ? "text-brand-orange-500" : "text-violet-500")} />
                      <span className="font-semibold text-surface-900 dark:text-surface-100">{opt.label}</span>
                      <span className="text-xs text-surface-500 dark:text-surface-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Step>

              {/* Step 4: Time */}
              <Step number={4} title="¿A qué hora?" active={!!query.mood}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "mañana", icon: Sunrise, iconColor: "bg-amber-100 dark:bg-amber-900/30", label: "Mañana" },
                    { value: "tarde", icon: Sun, iconColor: "bg-orange-100 dark:bg-orange-900/30", label: "Tarde" },
                    { value: "noche", icon: Moon, iconColor: "bg-indigo-100 dark:bg-indigo-900/30", label: "Noche" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, timeOfDay: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium",
                        query.timeOfDay === opt.value
                          ? "border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400"
                          : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:border-brand-blue-200 dark:hover:border-brand-blue-600"
                      )}
                    >
                      <opt.icon className={cn("w-6 h-6", query.timeOfDay === opt.value ? "text-brand-blue-500" : "text-surface-500 dark:text-surface-400")} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Step>

              {/* Submit */}
              <motion.button
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200",
                  canSubmit
                    ? "btn-primary shadow-glow dark:shadow-glow-dark"
                    : "bg-surface-200 dark:bg-surface-700 text-surface-400 dark:text-surface-500 cursor-not-allowed"
                )}
              >
                <Sparkles className="w-5 h-5" />
                Mostrar mis sugerencias
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {!canSubmit && (
                <p className="text-center text-xs text-surface-400 dark:text-surface-500">
                  Selecciona al menos tu estado de ánimo para continuar
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-brand-blue-500 dark:text-brand-blue-400 animate-spin" />
                <p className="text-surface-500 dark:text-surface-400 font-medium">Encontrando el plan perfecto…</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-6 mb-8 flex items-center justify-between gap-4">
                  <div>
                    <div className="badge-blue mb-2">Tus sugerencias</div>
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50">
                      {data?.meta.text}
                    </h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                      {data?.meta.totalResults} recomendaciones encontradas
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="btn-secondary text-sm flex-shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Nuevo plan
                  </button>
                </div>

                {data && data.events.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-6 flex items-center gap-2">
                      <Theater className="w-5 h-5 text-brand-blue-500" /> Eventos recomendados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {data && data.places.length > 0 && (
                  <div>
                    <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-green-500" /> Lugares recomendados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.places.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                      ))}
                    </div>
                  </div>
                )}

                {data && data.events.length === 0 && data.places.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="w-8 h-8 text-surface-400 dark:text-surface-500" />
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">Sin resultados exactos</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-6">Prueba con otros filtros</p>
                    <button onClick={handleReset} className="btn-primary">
                      <RefreshCw className="w-4 h-4" />
                      Intentar de nuevo
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}