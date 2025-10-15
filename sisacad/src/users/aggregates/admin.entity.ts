import { Entity } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Admin extends User {}
