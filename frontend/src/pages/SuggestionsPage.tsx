import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { useSuggestions } from "@/hooks/useKultour";
import EventCard from "@/components/shared/EventCard";
import PlaceCard from "@/components/shared/PlaceCard";
import { cn } from "@/lib/utils";
import type { SuggestionQuery } from "@/types";

// ─── Option button ────────────────────────────────────────
function OptionButton({
  emoji, label, description, selected, onClick,
}: {
  emoji: string; label: string; description: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3",
        selected
          ? "border-brand-blue-400 bg-brand-blue-50 shadow-glow"
          : "border-surface-200 bg-white hover:border-brand-blue-200 hover:bg-brand-blue-50/30"
      )}
    >
      <span className="text-2xl mt-0.5 flex-shrink-0">{emoji}</span>
      <div>
        <p className="font-semibold text-surface-900 text-sm">{label}</p>
        <p className="text-xs text-surface-500 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </motion.button>
  );
}

// ─── Step component ───────────────────────────────────────
function Step({ number, title, children, active }: { number: number; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <div className={cn("transition-opacity duration-300", active ? "opacity-100" : "opacity-60")}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white text-sm font-bold flex items-center justify-center">
          {number}
        </div>
        <h3 className="font-display font-bold text-surface-900">{title}</h3>
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
    if (submitted) refetch();
  };

  const handleReset = () => {
    setQuery({});
    setSubmitted(false);
  };

  const canSubmit = !!query.mood;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-brand-blue-700 pt-10 pb-20">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">
              ¿Qué plan buscas?
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
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
            <div className="bg-white rounded-4xl shadow-card-hover p-8 space-y-8">
              {/* Step 1: Mood */}
              <Step number={1} title="¿Cuál es tu estado de ánimo?" active>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "cultural", emoji: "🎭", label: "Cultural", description: "Arte, museos y teatro" },
                    { value: "fiestero", emoji: "🎉", label: "Fiestero", description: "Música, bares y clubs" },
                    { value: "tranquilo", emoji: "☕", label: "Tranquilo", description: "Cafés, parques y relax" },
                    { value: "romántico", emoji: "💑", label: "Romántico", description: "Cenas y lugares íntimos" },
                    { value: "familiar", emoji: "👨‍👩‍👧", label: "Familiar", description: "Planes para toda la familia" },
                  ].map((opt) => (
                    <OptionButton
                      key={opt.value}
                      emoji={opt.emoji}
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
                    { value: "solo", emoji: "🧍", label: "Solo/a" },
                    { value: "pareja", emoji: "💑", label: "En pareja" },
                    { value: "amigos", emoji: "👥", label: "Amigos" },
                    { value: "familia", emoji: "👨‍👩‍👧", label: "Familia" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, groupType: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium",
                        query.groupType === opt.value
                          ? "border-brand-blue-400 bg-brand-blue-50 text-brand-blue-700"
                          : "border-surface-200 bg-white text-surface-600 hover:border-brand-blue-200"
                      )}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Step>

              {/* Step 3: Budget */}
              <Step number={3} title="¿Cuál es tu presupuesto?" active={!!query.mood}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "bajo", emoji: "💚", label: "Económico", desc: "< Bs. 50" },
                    { value: "medio", emoji: "💛", label: "Moderado", desc: "Bs. 50–150" },
                    { value: "alto", emoji: "💎", label: "Premium", desc: "> Bs. 150" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, budget: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-sm",
                        query.budget === opt.value
                          ? "border-brand-blue-400 bg-brand-blue-50"
                          : "border-surface-200 bg-white hover:border-brand-blue-200"
                      )}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="font-semibold text-surface-900">{opt.label}</span>
                      <span className="text-xs text-surface-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Step>

              {/* Step 4: Time */}
              <Step number={4} title="¿A qué hora?" active={!!query.mood}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "mañana", emoji: "🌅", label: "Mañana" },
                    { value: "tarde", emoji: "☀️", label: "Tarde" },
                    { value: "noche", emoji: "🌙", label: "Noche" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuery((q) => ({ ...q, timeOfDay: opt.value as any }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium",
                        query.timeOfDay === opt.value
                          ? "border-brand-blue-400 bg-brand-blue-50 text-brand-blue-700"
                          : "border-surface-200 bg-white text-surface-600 hover:border-brand-blue-200"
                      )}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
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
                    ? "btn-primary shadow-glow"
                    : "bg-surface-200 text-surface-400 cursor-not-allowed"
                )}
              >
                <Sparkles className="w-5 h-5" />
                Mostrar mis sugerencias
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {!canSubmit && (
                <p className="text-center text-xs text-surface-400">
                  Selecciona al menos tu estado de ánimo para continuar
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          /* ─── Results ─── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-brand-blue-500 animate-spin" />
                <p className="text-surface-500 font-medium">Encontrando el plan perfecto…</p>
              </div>
            ) : (
              <>
                {/* Result header */}
                <div className="bg-white rounded-3xl shadow-card p-6 mb-8 flex items-center justify-between gap-4">
                  <div>
                    <div className="badge-blue mb-2">Tus sugerencias</div>
                    <h2 className="text-xl font-display font-bold text-surface-900">
                      {data?.meta.text}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">
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

                {/* Events */}
                {data && data.events.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2">
                      🎭 Eventos recomendados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Places */}
                {data && data.places.length > 0 && (
                  <div>
                    <h3 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2">
                      📍 Lugares recomendados
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
                    <div className="text-6xl mb-4">🤔</div>
                    <h3 className="text-xl font-bold text-surface-900 mb-2">Sin resultados exactos</h3>
                    <p className="text-surface-500 mb-6">Prueba con otros filtros</p>
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
