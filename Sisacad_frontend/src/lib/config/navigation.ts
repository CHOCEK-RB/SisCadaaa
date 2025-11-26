import {
  House,
  BookOpen,
  Users,
  Settings,
  LogOut,
  type Icon as IconType,
  SquareCheck,
  Calendar,
} from "lucide-svelte";

export interface NavLink {
  url: string;
  title: string;
  icon: typeof IconType;
}

export type UserRole =
  | "student"
  | "teacher"
  | "secretary"
  | "admin"
  | "unknown";

export const navigationLinks: Record<UserRole, NavLink[]> = {
  student: [
    { url: "/student", title: "Inicio", icon: House },
    { url: "/student/courses", title: "Mis Cursos", icon: BookOpen },
    { url: "/student/grades", title: "Mis Notas", icon: SquareCheck },
    { url: "/student/schedule", title: "Horario", icon: Calendar },
    { url: "/student/enrollment", title: "Matricularse", icon: Users },
  ],
  teacher: [
    { url: "/teacher", title: "Inicio", icon: House },
    { url: "/teacher/courses", title: "Mis Cursos", icon: BookOpen },
    { url: "/teacher/schedule", title: "Horario", icon: Calendar },
    { url: "/teacher/reservation", title: "Reservaciones", icon: Calendar },
  ],
  secretary: [
    { url: "/home", title: "Inicio", icon: House },
    { url: "/manage-enrollments", title: "Gestionar Matrículas", icon: Users },
    { url: "/manage-courses", title: "Gestionar Cursos", icon: BookOpen },
    { url: "/settings", title: "Configuración", icon: Settings },
  ],
  admin: [
    { url: "/home", title: "Inicio", icon: House },
    { url: "/manage-users", title: "Gestionar Usuarios", icon: Users },
    { url: "/system-settings", title: "Ajustes Sistema", icon: Settings },
  ],
  unknown: [
    { url: "/home", title: "Inicio", icon: House },
    { url: "/settings", title: "Configuración", icon: Settings },
  ],
};

export const logoutLink: NavLink = {
  url: "/logout",
  title: "Cerrar Sesión",
  icon: LogOut,
};
