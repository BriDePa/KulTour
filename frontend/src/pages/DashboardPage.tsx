import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Plus, Calendar, MapPin, Tag, Image,
  DollarSign, Users, Clock, Ticket, CheckCircle2,
  AlertTriangle, Loader2, List, BarChart3, PartyPopper
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEvents, useCreateEvent, useCities } from "@/hooks/useKultour";
import { useToastStore } from "@/store/toastStore";
import EventCard from "@/components/shared/EventCard";
import { cn, EVENT_CATEGORIES } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type { CreateEventForm } from "@/types";

type Tab = "overview" | "create" | "events";

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{hint}</p>}
    </div>
  );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 right-6 z-50 bg-brand-green-500 text-white px-6 py-4 rounded-2xl shadow-card-hover dark:shadow-card-hover-dark flex items-center gap-3 max-w-sm"
    >
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white text-lg leading-none">×</button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [form, setForm] = useState<Partial<CreateEventForm>>({
    isFree: false,
    price: 0,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 50 });
  const { data: cities } = useCities();
  const createEvent = useCreateEvent();
  const { success: toastSuccess, error: toastError } = useToastStore();

  if (!isAuthenticated) {
    return (
      <div className="section-container py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-brand-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">Acceso restringido</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Debes iniciar sesión para acceder al panel de organizador.</p>
        <Link to="/" className="btn-primary">Iniciar sesión</Link>
      </div>
    );
  }

  if (user?.role === "USER") {
    return (
      <div className="section-container py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-brand-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">Rol insuficiente</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Solo los organizadores pueden acceder a este panel.</p>
        <Link to="/explore" className="btn-primary">Explorar eventos</Link>
      </div>
    );
  }

  const myEvents = eventsData?.events.filter((e) => e.organizer.id === user?.id) || [];

  const updateForm = (key: keyof CreateEventForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags?.includes(tag)) {
      updateForm("tags", [...(form.tags || []), tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateForm("tags", form.tags?.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.venue || !form.address || !form.cityId) return;

    try {
      await createEvent.mutateAsync(form as CreateEventForm);
      toastSuccess("¡Evento publicado!", "Tu evento ya es visible en Kultour");
      setForm({ isFree: false, price: 0, tags: [] });
      setActiveTab("events");
    } catch (err: any) {
      toastError(
        "Error al crear evento",
        err?.response?.data?.message || "Revisa los campos e intenta de nuevo"
      );
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-surface-800 dark:from-surface-900 to-surface-900 dark:to-surface-950 pt-10 pb-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-xl font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Hola, {user?.name.split(" ")[0]}
                  </h1>
                  <p className="text-surface-400 dark:text-surface-500 text-sm">Panel de organizador</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("create")}
              className="btn-primary hidden md:flex"
            >
              <Plus className="w-4 h-4" />
              Nuevo evento
            </button>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-1.5 flex gap-1 mb-8 w-full sm:w-auto sm:inline-flex">
          {[
            { id: "overview" as Tab, icon: BarChart3, label: "Resumen" },
            { id: "create"   as Tab, icon: Plus,      label: "Crear evento" },
            { id: "events"   as Tab, icon: List,       label: `Mis eventos (${myEvents.length})` },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 flex-1 sm:flex-none justify-center",
                activeTab === id
                  ? "bg-surface-900 dark:bg-surface-700 text-white shadow-soft"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Eventos creados", value: myEvents.length, icon: Calendar, color: "from-brand-blue-500 to-brand-blue-700" },
                { label: "Eventos activos", value: myEvents.filter(e => e.status === "PUBLISHED").length, icon: CheckCircle2, color: "from-brand-green-500 to-brand-green-700" },
                { label: "Eventos gratuitos", value: myEvents.filter(e => e.isFree).length, icon: Tag, color: "from-brand-orange-500 to-brand-orange-700" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white", color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-surface-900 dark:text-surface-50">{value}</div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 font-medium">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 dark:from-brand-blue-600 dark:to-surface-800 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-display font-bold mb-2">¿Listo para crear tu próximo evento?</h3>
                <p className="text-white/70 dark:text-white/60 text-sm">Llega a miles de personas en La Paz con un evento bien presentado.</p>
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className="bg-white text-brand-blue-600 dark:text-brand-blue-500 font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Crear evento
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Tab: Create Event ── */}
        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-8">
              <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50 mb-8">
                Crear nuevo evento
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Título del evento" required>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="Ej: Festival de Jazz en las Alturas"
                    className="input-base"
                    required
                  />
                </Field>

                <Field label="Descripción" required hint="Describe el evento con detalle para atraer más asistentes">
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Cuenta todo sobre tu evento: qué es, por qué vale la pena, qué incluye..."
                    rows={4}
                    className="input-base resize-none"
                    required
                  />
                </Field>

                <Field label="URL de imagen" hint="URL de una imagen representativa del evento (recomendado 16:9)">
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                    <input
                      type="url"
                      value={form.imageUrl || ""}
                      onChange={(e) => updateForm("imageUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="input-base pl-10"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Fecha y hora de inicio" required>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                      <input
                        type="datetime-local"
                        value={form.date || ""}
                        onChange={(e) => updateForm("date", e.target.value)}
                        className="input-base pl-10"
                        required
                      />
                    </div>
                  </Field>
                  <Field label="Fecha y hora de fin">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                      <input
                        type="datetime-local"
                        value={form.endDate || ""}
                        onChange={(e) => updateForm("endDate", e.target.value)}
                        className="input-base pl-10"
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre del lugar" required>
                    <input
                      type="text"
                      value={form.venue || ""}
                      onChange={(e) => updateForm("venue", e.target.value)}
                      placeholder="Ej: Teatro Municipal"
                      className="input-base"
                      required
                    />
                  </Field>
                  <Field label="Dirección" required>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                      <input
                        type="text"
                        value={form.address || ""}
                        onChange={(e) => updateForm("address", e.target.value)}
                        placeholder="Calle y número, barrio"
                        className="input-base pl-10"
                        required
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Ciudad" required>
                    <select
                      value={form.cityId || ""}
                      onChange={(e) => updateForm("cityId", e.target.value)}
                      className="input-base bg-white dark:bg-surface-800"
                      required
                    >
                      <option value="">Selecciona ciudad...</option>
                      {cities?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Categoría">
                    <select
                      value={form.category || ""}
                      onChange={(e) => updateForm("category", e.target.value)}
                      className="input-base bg-white dark:bg-surface-800"
                    >
                      <option value="">Sin categoría</option>
                      {EVENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="bg-surface-50 dark:bg-surface-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-surface-800 dark:text-surface-200">Precio</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => updateForm("isFree", !form.isFree)}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors duration-200 relative",
                          form.isFree ? "bg-brand-green-500" : "bg-surface-300 dark:bg-surface-600"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                          form.isFree ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Evento gratuito</span>
                    </label>
                  </div>
                  {!form.isFree && (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={form.price || 0}
                        onChange={(e) => updateForm("price", parseFloat(e.target.value))}
                        placeholder="0"
                        className="input-base pl-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 dark:text-surface-500 font-medium">BOB</span>
                    </div>
                  )}
                </div>

                <Field label="Capacidad" hint="Número máximo de asistentes (opcional)">
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                    <input
                      type="number"
                      min="1"
                      value={form.capacity || ""}
                      onChange={(e) => updateForm("capacity", parseInt(e.target.value))}
                      placeholder="Sin límite"
                      className="input-base pl-10"
                    />
                  </div>
                </Field>

                <Field label="URL de venta de entradas" hint="Link externo donde comprar entradas (opcional)">
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                    <input
                      type="url"
                      value={form.ticketUrl || ""}
                      onChange={(e) => updateForm("ticketUrl", e.target.value)}
                      placeholder="https://..."
                      className="input-base pl-10"
                    />
                  </div>
                </Field>

                <Field label="Etiquetas" hint="Escribe y presiona Enter para agregar">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Ej: jazz, música, festival..."
                      className="input-base flex-1"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-secondary px-4 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                  {form.tags && form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <span key={tag} className="badge bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400 gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500 dark:hover:text-red-400 transition-colors ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>

                {createEvent.isError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {(createEvent.error as any)?.response?.data?.message || "Error al crear el evento"}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createEvent.isPending}
                    className="btn-primary flex-1 justify-center"
                  >
                    {createEvent.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Publicar evento
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Tab: My Events ── */}
        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-3xl" />
                ))}
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark">
                <Calendar className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">
                  Todavía no tienes eventos
                </h3>
                <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">Crea tu primer evento y llega a miles de personas.</p>
                <button onClick={() => setActiveTab("create")} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Crear primer evento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}