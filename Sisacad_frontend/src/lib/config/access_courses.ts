import type { GroupedEnrollments } from "$lib/types/enrollment.types";
import type { AcademicGroupDTO } from "$lib/types/group.types";
type GroupsForPeriods = { [key: string]: AcademicGroupDTO[] };

export interface DashboardCourseDisplay {
  id: string;
  name: string;
  code: string;
  link: string;
}

const getMostRecentPeriodData = <T>(groupedData: Record<string, T[]>): T[] => {
  const periods = Object.keys(groupedData || {});
  if (periods.length === 0) return [];

  periods.sort((a, b) => {
    const [yearA, semesterA] = a.split("-");
    const [yearB, semesterB] = b.split("-");
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
    return semesterB.localeCompare(semesterA);
  });

  return groupedData[periods[0]] || [];
};

export const courseExtractors = {
  student: (pageData: any): DashboardCourseDisplay[] => {
    const rawData = pageData.courses as GroupedEnrollments;
    const currentItems = getMostRecentPeriodData(rawData);

    // Transformamos la data de Estudiante (EnrollmentDetailDTO) a formato común
    return currentItems.map((enrollment) => ({
      id: enrollment.academicCourse.id,
      name: enrollment.academicCourse.course.name,
      code: enrollment.academicCourse.course.code,
      link: `/student/courses/${enrollment.academicCourse.id}`
    }));
  },

  teacher: (pageData: any): DashboardCourseDisplay[] => {
    const rawData = pageData.groups as GroupsForPeriods; 
    const currentItems = getMostRecentPeriodData(rawData);

    return currentItems.map((group) => ({
      id: group.course.id,
      name: group.course.course.name,
      code: group.course.course.code,
      link: `/teacher/courses/${group.course.id}/groups/${group.id}`,
    }));
  },
  

  secretary: () => [],
  admin: () => [],
  unknown: () => []
};