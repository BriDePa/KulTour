import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import type { LoginForm, RegisterForm } from "@/types";

export function useLogin() {
  const { setAuth }  = useAuthStore();
  const { success, error: toastError } = useToastStore();
  const navigate     = useNavigate();

  return useMutation({
    mutationFn: (data: LoginForm) => authService.login(data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      success("¡Bienvenido!", `Hola de nuevo, ${user.name.split(" ")[0]} 👋`);
      if (user.role === "ORGANIZER" || user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/explore");
      }
    },
    onError: (err: any) => {
      toastError(
        "Error al ingresar",
        err?.response?.data?.message || "Email o contraseña incorrectos"
      );
    },
  });
}

export function useRegister() {
  const { setAuth }  = useAuthStore();
  const { success, error: toastError } = useToastStore();
  const navigate     = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      success("¡Cuenta creada!", `Bienvenido a Kultour, ${user.name.split(" ")[0]} 🎉`);
      navigate("/explore");
    },
    onError: (err: any) => {
      toastError(
        "Error al registrarse",
        err?.response?.data?.message || "No se pudo crear la cuenta"
      );
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const { info }      = useToastStore();
  const navigate      = useNavigate();

  return () => {
    clearAuth();
    info("Sesión cerrada", "Hasta pronto 👋");
    navigate("/");
  };
}
