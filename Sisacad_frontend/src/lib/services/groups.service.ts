import { api } from "./api.service";
import type { AcademicGroupDTO } from "$lib/types/group.types";

export interface GroupsForPeriods {
  [period: string]: AcademicGroupDTO[];
}

export const groupsService = {
  async getGroups(token: string): Promise<GroupsForPeriods> {
    const response = await api.get<GroupsForPeriods>("/groups/teacher", {
      token: token,
    });

    if (!response) {
      throw new Error("No se recibieron datos del servidor, grupos");
    }

    return response;
  },
};
