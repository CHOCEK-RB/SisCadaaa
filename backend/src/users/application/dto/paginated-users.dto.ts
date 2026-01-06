import { AnyProfileDTO } from "../mappers/user.mapper";

export class PaginatedUsersDto {
  data: AnyProfileDTO[];
  total: number;
}
