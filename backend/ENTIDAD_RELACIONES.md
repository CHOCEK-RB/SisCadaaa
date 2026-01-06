# Relaciones entre Entidades del Sistema SisCadaaa

## Usuarios
- **User**: Entidad principal de usuario (relación 1:1 con perfiles específicos)
  - `studentProfile`: Relación con Student (OneToOne)
  - `teacherProfile`: Relación con Teacher (OneToOne)
  - `adminProfile`: Relación con Admin (OneToOne)
  - `secretaryProfile`: Relación con Secretary (OneToOne)

- **Student**: Entidad de estudiante
  - `user`: Relación con User (OneToOne)
  - `enrollments`: Relación con Enrollment (OneToMany)

- **Teacher**: Entidad de docente
  - `user`: Relación con User (OneToOne)
  - `groups`: Relación con AcademicGroup (OneToMany)
  - `attendances`: Relación con Attendance (OneToMany)

- **Admin**: Entidad de administrador
  - `user`: Relación con User (OneToOne)

- **Secretary**: Entidad de secretaria
  - `user`: Relación con User (OneToOne)

## Cursos y Contenido Académico
- **Course**: Entidad de curso base
  - `topics`: Relación con CourseTopic (OneToMany)

- **CourseTopic**: Entidad de tópicos de curso
  - `course`: Relación con Course (ManyToOne)

- **AcademicCourse**: Entidad de curso académico (instancia de un curso en un periodo)
  - `course`: Relación con Course (ManyToOne)
  - `topics`: Relación con CourseTopic (ManyToMany)
  - `groups`: Relación con AcademicGroup (OneToMany)
  - `enrollments`: Relación con Enrollment (OneToMany)

## Grupos Académicos
- **AcademicGroup**: Entidad de grupo académico
  - `academicCourse`: Relación con AcademicCourse (ManyToOne)
  - `teacher`: Relación con Teacher (ManyToOne)
  - `schedule`: Relación con ScheduleSlot (OneToMany)
  - `attendances`: Relación con Attendance (OneToMany)
  - `enrollments`: Relación con Enrollment (ManyToMany)

## Horarios
- **ScheduleSlot**: Entidad de horario de clase
  - `academicGroup`: Relación con AcademicGroup (ManyToOne)
  - `classroom`: Relación con Classroom (ManyToOne)

## Aulas
- **Classroom**: Entidad de aula
  - `schedules`: Relación con ScheduleSlot (OneToMany)

## Matrículas
- **Enrollment**: Entidad de matrícula
  - `student`: Relación con Student (ManyToOne)
  - `course`: Relación con AcademicCourse (ManyToOne)
  - `groups`: Relación con AcademicGroup (ManyToMany)

## Asistencias
- **Attendance**: Entidad de asistencia
  - `teacher`: Relación con Teacher (ManyToOne)
  - `academicGroup`: Relación con AcademicGroup (ManyToOne)
  - `studentStatuses`: Relación con estudiantes a través de un objeto (jsonb)

## Diagrama de Relaciones (conceptual)

```
[User] 1:1 [Student] 1:* [Enrollment]
  |             |                | *
  |             |                | * [AcademicGroup] 1:* [Attendance]
  |             |                | * [AcademicCourse] 1:* [AcademicGroup]
  |             |                |                | *
  |             |                |                | [Course] 1:* [CourseTopic]
  |             |                |                |
  |             |                |                | [AcademicCourse] *:* [AcademicGroup]
  |             |                |                             | *
  |             |                |                             | [Teacher] 1:* [AcademicGroup]
  |             |                |                             |                | *
  |             |                |                             |                | [Attendance]
  |             |                |                             |                |
  |             |                |                             |                | [ScheduleSlot] *:1 [Classroom]
  |             |                |                             |                | *
  |             |                |                             |                | [AcademicGroup]

[User] 1:1 [Teacher] 
[User] 1:1 [Admin]
[User] 1:1 [Secretary]
```

## Observaciones

1. El sistema sigue una arquitectura limpia con capas bien definidas (domain, application, infrastructure, presentation).
2. Las relaciones están bien definidas usando TypeORM.
3. Existen relaciones complejas como la de `studentStatuses` en Attendance que usa un objeto JSON para relacionar estudiantes con sus estados de asistencia.
4. El sistema implementa ya parte del patrón CQRS con servicios separados para consultas y comandos.