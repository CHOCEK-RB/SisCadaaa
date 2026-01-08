import { error } from '@sveltejs/kit';
import { api } from '$lib/services/api.service';
import { userService } from '$lib/services/user.service';

export const load = async ({ params, fetch }) => {
    const { teacherId } = params;
    try {
        const [teacherProfile, groups, reserves] = await Promise.all([
            userService.getTeacherById(teacherId, { fetch }),
            api.get<any[]>(`/groups/teacher/${teacherId}/schedule-view`, { fetch }),
            api.get<any[]>(`/reservations/teacher/${teacherId}/schedule-view`, { fetch })
        ]);

        return {
            teacherProfile,
            groups: groups ?? [],
            reserves: (reserves ?? []).filter(r => r.status === 'active')
        };
    } catch (e) {
        throw error(500, 'Error al cargar el horario');
    }
};