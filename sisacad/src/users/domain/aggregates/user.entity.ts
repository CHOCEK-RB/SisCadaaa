import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Secretary } from './secretary.entity';
import { Admin } from './admin.entity';
import { Role } from './role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role: Role;

  pictureURL?: string;

  @Column({ default: false })
  isActive: boolean;

  @OneToOne(() => Student, (student) => student.user)
  studentProfile: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacherProfile: Teacher;

  @OneToOne(() => Secretary, (secretary) => secretary.user)
  secretaryProfile: Secretary;

  @OneToOne(() => Admin, (admin) => admin.user)
  adminProfile: Admin;

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  linkGoogleProvider(googleId: string): void {
    if (!this.googleId) {
      this.googleId = googleId;
    }
  }
}
