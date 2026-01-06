import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import {
  FindAllUsersOptions,
  IUserRepository,
} from "../../domain/repositories/iuser.repository";
import { User } from "../../domain/aggregates/user.entity";
import { PreRegisterUserDto } from "../dto/pre-register-user.dto";
import { UserMapper, AnyProfileDTO } from "../mappers/user.mapper";
import { PaginatedUsersDto } from "../dto/paginated-users.dto";

/**
 * @class UserService
 * @description
 * Service responsible for managing user-related operations, including profile retrieval,
 * pre-registration, activation, and finding users by email.
 */
@Injectable()
export class UserService {
  /**
   * @constructor
   * @param {IUserRepository} userRepository - Repository for user data operations.
   * @param {UserMapper} userMapper - Mapper for converting user entities to DTOs.
   */
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * @method findAll
   * @description
   * Retrieves a paginated list of users based on the provided options.
   * @param {FindAllUsersOptions} options - Options for filtering, sorting, and pagination.
   * @returns {Promise<PaginatedUsersDto>} A promise that resolves to a paginated list of user DTOs.
   */
  async findAll(options: FindAllUsersOptions): Promise<PaginatedUsersDto> {
    const paginatedResult = await this.userRepository.findAll(options);
    const dtos = paginatedResult.data.map((user) =>
      this.userMapper.toDto(user),
    );
    return {
      data: dtos,
      total: paginatedResult.total,
    };
  }

  /**
   * @method getUserProfile
   * @description
   * Retrieves the profile of a user by their ID.
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<AnyProfileDTO>} A promise that resolves to a DTO representing the user's profile.
   * @throws {NotFoundException} If the user with the given ID is not found.
   */
  async getUserProfile(userId: string): Promise<AnyProfileDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.userMapper.toDto(user);
  }

  /**
   * @method preRegisterUser
   * @description
   * Pre-registers a new user with an email. This creates a new user entity without full activation.
   * @param {PreRegisterUserDto} dto - DTO containing the email for pre-registration.
   * @returns {Promise<User>} A promise that resolves to the newly created user entity.
   */
  async preRegisterUser(dto: PreRegisterUserDto): Promise<User> {
    const newUser = new User();
    newUser.email = dto.email;
    return this.userRepository.add(newUser);
  }

  /**
   * @method activateUser
   * @description
   * Activates an existing user by their ID.
   * @param {string} userId - The UUID of the user to activate.
   * @returns {Promise<User>} A promise that resolves to the activated user entity.
   * @throws {NotFoundException} If the user with the given ID is not found.
   */
  async activateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.activate();
    return this.userRepository.save(user);
  }

  /**
   * @method findByEmail
   * @description
   * Finds a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<User | null>} A promise that resolves to the user entity if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
