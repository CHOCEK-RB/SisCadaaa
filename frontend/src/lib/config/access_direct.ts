import { GraduationCap, Calendar,UserPen,Users, ListChecks, SquareArrowDown,type Icon as IconType } from "lucide-svelte";
export interface NavAccess{
  url: string;
  title: string;
  description: string;
  icon: typeof IconType;
}

export type UserRole =
  | "student"
  | "teacher"
  | "secretary"
  | "admin"
  | "unknown";

export const NavigationsAccess: Record<UserRole, NavAccess[]>={
    student:[
        {url: "/student/grades", title:"Mis Calificaciones", description:"Ver historial de notas.", icon: GraduationCap},
        {url: "/student/schedule", title:"Mi Horario",description:"Consulta tus clases.", icon: Calendar},
        {url: "/student/enrollment", title:"Afiliacion", description:"Matricúlate en cursos.",icon: ListChecks }
    ],
    teacher:[
        {url: "/teacher/courses", title:"Cursos", description:"Cursos disponibles.",icon:GraduationCap},
        {url: "/teacher/reservation", title:"Reservacion", description:"Reservar tus horas de clases",icon:SquareArrowDown},
        {url: "/teacher/schedule", title:"Horario", description:"Clases a dictar", icon:Calendar},

    ],secretary:[
        {url: "/secretary/search/student", title:"Estudiantes", description:"Gestionar estudiantes.",icon:Users},
        {url: "/secretary/search/teacher", title:"Docentes", description:"Gestionar docentes.",icon:Users},
        {url: "/secretary/courses", title:"Cursos", description:"Gestion de Cursos.",icon:GraduationCap},
    ],
    admin:[
        {url: "/admin/students", title:"Estudiantes", description:"Lista de alumnos",icon:UserPen},
        {url: "/admin/teachers", title:"Docentes", description:"Lista de docentes",icon:Users},
        {url: "/admin/reserve", title:"Reservas", description:"Reservar aula", icon:SquareArrowDown}
    ],
    unknown:[
        
    ],
}