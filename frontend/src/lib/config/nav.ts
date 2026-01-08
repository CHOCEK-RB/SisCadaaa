export type NavItem = {
  title: string;
  href: string;
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  disabled?: boolean;
};

import { Users, GraduationCap } from "lucide-svelte";

export const secretarySearchNavItems: NavItem[] = [
  {
    title: "Estudiantes",
    href: "/secretary/search/student",
    icon: GraduationCap,
  },
  {
    title: "Profesores",
    href: "/secretary/search/teacher",
    icon: Users,
  },
];

export const adminSearchNavItems: NavItem[] = [
  {
    title: "Estudiantes",
    href: "/admin/search/student",
    icon: GraduationCap,
  },
  {
    title: "Profesores",
    href: "/admin/search/teacher",
    icon: Users,
  },
];
