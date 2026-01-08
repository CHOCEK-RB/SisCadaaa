import {
  House,
  BookOpen,
  Users,
  Settings,
  LogOut,
  type Icon as IconType,
  SquareCheck,
  Calendar,
  CalendarDays,
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
    { url: "/secretary", title: "Inicio", icon: House },
    { url: "/secretary/search", title: "Gestionar Usuarios", icon: Users },
    { url: "/secretary/courses", title: "Gestionar Cursos", icon: BookOpen },
    {
      url: "/secretary/events",
      title: "Gestionar Eventos",
      icon: CalendarDays,
    },
  ],
  admin: [
    { url: "/admin", title: "Inicio", icon: House },
    { url: "/admin/search", title: "Gestionar Usuarios", icon: Users },
    { url: "/admin/courses", title: "Gestionar Cursos", icon: BookOpen },
    {
      url: "/admin/events",
      title: "Gestionar Eventos",
      icon: CalendarDays,
    },
  ],
};

export const logoutLink: NavLink = {
  url: "/logout",
  title: "Cerrar Sesión",
  icon: LogOut,
};
