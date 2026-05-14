import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Compass, ArrowRight, Sparkles } from "lucide-react";
import { create } from "zustand";
import { authService } from "@/services/api.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

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
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "input-base pl-10 pr-10",
            error && "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-400 focus:ring-red-400/10 dark:focus:ring-red-500/20"
          )}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 pl-1">{error}</p>}
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToastStore();

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
    setErrors({});
    
    try {
      const { user, token } = await authService.login({ email, password });
      setAuth(user, token);
      success("Bienvenido", `Hola de nuevo, ${user.name.split(" ")[0]}`);
      onSuccess();
    } catch (err: any) {
      console.error("[Login Error]", err);
      
      // Manejar diferentes tipos de errores
      if (err.isNetworkError) {
        toastError("Sin conexión", "No se pudo conectar con el servidor. Verifica que el backend esté activo.");
        setErrors({ general: "Servidor no disponible" });
      } else {
        const status = err.response?.status;
        const message = err.response?.data?.message || "Error al iniciar sesión";
        
        if (status === 401) {
          setErrors({ general: "Email o contraseña incorrectos" });
          toastError("Credenciales incorrectas", message);
        } else if (status === 404) {
          setErrors({ general: "Usuario no encontrado" });
        } else {
          setErrors({ general: message });
          toastError("Error", message);
        }
      }
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
            className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      {errors.general && (
        <p className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-xl">
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


    </form>
  );
}

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
      success("¡Cuenta creada!", `Bienvenido a Kultour, ${user.name.split(" ")[0]}`);
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
            className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <div>
        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">¿Cómo vas a usar Kultour?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "USER",      label: "Explorador",   icon: Compass, desc: "Descubro eventos" },
            { value: "ORGANIZER", label: "Organizador",  icon: Sparkles, desc: "Creo eventos" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value as any)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm transition-all duration-200",
                role === opt.value
                  ? "border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/30"
                  : "border-surface-200 dark:border-surface-700 hover:border-brand-blue-200 dark:hover:border-brand-blue-700"
              )}
            >
              <opt.icon className={cn("w-6 h-6", role === opt.value ? "text-brand-blue-500" : "text-surface-500 dark:text-surface-400")} />
              <span className="font-semibold text-surface-900 dark:text-surface-100">{opt.label}</span>
              <span className="text-xs text-surface-500 dark:text-surface-400">{opt.desc}</span>
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

export default function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-[10%] sm:left-[35%] sm:-translate-x-1/2 sm:-translate-y-1/2 z-[71] w-auto sm:w-full sm:max-w-md"
          >
            <div className="bg-white dark:bg-surface-800 rounded-t-4xl sm:rounded-3xl shadow-card-hover dark:shadow-card-hover-dark overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50">
                      {mode === "login" ? "Bienvenido" : "Únete a Kultour"}
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {mode === "login" ? "Ingresa a tu cuenta" : "Crea tu cuenta gratis"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="touch-target text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 mb-5">
                <div className="bg-surface-100 dark:bg-surface-700 rounded-2xl p-1 flex">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        mode === m
                          ? "bg-white dark:bg-surface-600 text-surface-900 dark:text-surface-50 shadow-soft"
                          : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                      )}
                    >
                      {m === "login" ? "Ingresar" : "Registrarse"}
                    </button>
                  ))}
                </div>
              </div>

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