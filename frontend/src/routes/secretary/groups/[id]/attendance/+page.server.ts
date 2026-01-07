import type { PageServerLoad } from './$types';
import { attendanceService } from '$lib/services/attendance.service';
import { groupsService } from '$lib/services/groups.service'; // Import groupsService
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const { id } = params; // This is the groupId
	try {
		const [attendanceHistory, enrolledStudents] = await Promise.all([
			attendanceService.getAllAttendanceForGroup(id, { fetch }), // Fetch history
			groupsService.getStudentsInGroup(id, { fetch }) // Fetch enrolled students
		]);

		return {
			attendanceHistory,
			enrolledStudents
		};
	} catch (e: any) {
		console.error('Error loading group attendance data:', e);
		throw error(e.status || 500, e.body?.message || 'Could not load group attendance data');
	}
};
