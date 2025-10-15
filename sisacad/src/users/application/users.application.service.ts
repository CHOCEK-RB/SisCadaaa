import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../infrastructure/iuser.repository';
import { User } from '../aggregates/user.entity';
import { PreRegisterUserDto } from './pre-register-user.dto';

@Injectable()
export class UsersApplicationService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async preRegisterUser(dto: PreRegisterUserDto): Promise<User> {
    return this.userRepository.create(dto.email);
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.activate();
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
