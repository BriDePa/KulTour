import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Compass, ArrowRight } from "lucide-react";
import { create } from "zustand";
import { authService } from "@/services/api.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// ─── Auth Modal Store ─────────────────────────────────────
interface AuthModalStore {
  isOpen: boolean;
  mode: "login" | "register";
  open: (mode?: "login" | "register") => void;
  close: () => void;
  setMode: (mode: "login" | "register") => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  mode: "login",
  open: (mode = "login") => set({ isOpen: true, mode }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}));

// ─── Input Field ──────────────────────────────────────────
function AuthInput({
  icon: Icon, type = "text", placeholder, value, onChange, error,
  rightElement,
}: {
  icon: any; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  error?: string; rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "input-base pl-10 pr-10",
            error && "border-red-400 focus:border-red-400 focus:ring-red-400/10"
          )}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>}
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToastStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido";
    if (!password) e.password = "La contraseña es requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await authService.login({ email, password });
      setAuth(user, token);
      success("¡Bienvenido!", `Hola de nuevo, ${user.name.split(" ")[0]} 👋`);
      onSuccess();
      if (user.role === "ORGANIZER" || user.role === "ADMIN") {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Email o contraseña incorrectos";
      toastError("Error al ingresar", msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        icon={Mail} type="email" placeholder="tu@email.com"
        value={email} onChange={setEmail} error={errors.email}
      />
      <AuthInput
        icon={Lock} type={showPass ? "text" : "password"}
        placeholder="Contraseña"
        value={password} onChange={setPassword} error={errors.password}
        rightElement={
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="text-surface-400 hover:text-surface-600 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      {errors.general && (
        <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl">
          {errors.general}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3.5"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando…</>
        ) : (
          <>Ingresar <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {/* Demo accounts hint */}
      <div className="bg-surface-50 rounded-2xl p-3 text-xs text-surface-500 space-y-1">
        <p className="font-semibold text-surface-700 mb-1.5">Cuentas de prueba:</p>
        <p>👤 Usuario: <span className="font-mono">juan@gmail.com</span> / <span className="font-mono">user123</span></p>
        <p>🎭 Organizador: <span className="font-mono">eventos@noche.bo</span> / <span className="font-mono">organizer123</span></p>
      </div>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"USER" | "ORGANIZER">("USER");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToastStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name || name.trim().length < 2) e.name = "Nombre demasiado corto";
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido";
    if (!password || password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await authService.register({ name, email, password, role });
      setAuth(user, token);
      success("¡Cuenta creada!", `Bienvenido a Kultour, ${user.name.split(" ")[0]} 🎉`);
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al crear la cuenta";
      toastError("Error al registrarse", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        icon={User} placeholder="Tu nombre completo"
        value={name} onChange={setName} error={errors.name}
      />
      <AuthInput
        icon={Mail} type="email" placeholder="tu@email.com"
        value={email} onChange={setEmail} error={errors.email}
      />
      <AuthInput
        icon={Lock} type={showPass ? "text" : "password"}
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password} onChange={setPassword} error={errors.password}
        rightElement={
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="text-surface-400 hover:text-surface-600 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Role selector */}
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-2">¿Cómo vas a usar Kultour?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "USER",      label: "Explorador",   emoji: "🧭", desc: "Descubro eventos" },
            { value: "ORGANIZER", label: "Organizador",  emoji: "🎭", desc: "Creo eventos" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value as any)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-sm transition-all duration-200",
                role === opt.value
                  ? "border-brand-blue-400 bg-brand-blue-50"
                  : "border-surface-200 hover:border-brand-blue-200"
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold text-surface-900">{opt.label}</span>
              <span className="text-xs text-surface-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3.5"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta…</>
        ) : (
          <>Crear cuenta gratis <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}

// ─── Main Modal ───────────────────────────────────────────
export default function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-[10%] sm:left-[35%] sm:-translate-x-1/2 sm:-translate-y-1/2 z-[71] w-auto sm:w-full sm:max-w-md"
          >
            <div className="bg-white rounded-t-4xl sm:rounded-3xl shadow-card-hover overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-surface-900">
                      {mode === "login" ? "Bienvenido" : "Únete a Kultour"}
                    </h2>
                    <p className="text-xs text-surface-500">
                      {mode === "login" ? "Ingresa a tu cuenta" : "Crea tu cuenta gratis"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="touch-target text-surface-400 hover:text-surface-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="px-6 mb-5">
                <div className="bg-surface-100 rounded-2xl p-1 flex">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        mode === m
                          ? "bg-white text-surface-900 shadow-soft"
                          : "text-surface-500 hover:text-surface-700"
                      )}
                    >
                      {m === "login" ? "Ingresar" : "Registrarse"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forms */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode === "login" ? (
                      <LoginForm onSuccess={close} />
                    ) : (
                      <RegisterForm onSuccess={close} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
