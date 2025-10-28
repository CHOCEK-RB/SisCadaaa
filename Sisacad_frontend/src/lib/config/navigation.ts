import {
  House,
  BookOpen,
  Users,
  Settings,
  LogOut,
  type Icon as IconType,
} from 'lucide-svelte';

export interface NavLink {
  href: string;
  label: string;
  icon: typeof IconType;
}

export type UserRole =
  | 'student'
  | 'teacher'
  | 'secretary'
  | 'admin'
  | 'unknown';

export const navigationLinks: Record<UserRole, NavLink[]> = {
  student: [
    { href: '/home', label: 'Inicio', icon: House },
    { href: '/courses', label: 'Mis Cursos', icon: BookOpen },
    { href: '/grades', label: 'Mis Notas', icon: BookOpen },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ],
  teacher: [
    { href: '/home', label: 'Inicio', icon: House },
    { href: '/assigned-courses', label: 'Cursos Asignados', icon: BookOpen },
    { href: '/students', label: 'Estudiantes', icon: Users },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ],
  secretary: [
    { href: '/home', label: 'Inicio', icon: House },
    { href: '/manage-enrollments', label: 'Gestionar Matrículas', icon: Users },
    { href: '/manage-courses', label: 'Gestionar Cursos', icon: BookOpen },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ],
  admin: [
    { href: '/home', label: 'Inicio', icon: House },
    { href: '/manage-users', label: 'Gestionar Usuarios', icon: Users },
    { href: '/system-settings', label: 'Ajustes Sistema', icon: Settings },
  ],
  unknown: [
    { href: '/home', label: 'Inicio', icon: House },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ],
};

export const logoutLink: NavLink = {
  href: '/logout',
  label: 'Cerrar Sesión',
  icon: LogOut,
};
