import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { AcademicGroup } from './academic_group.entity';
import { Teacher } from 'src/users/domain/aggregates/teacher.entity';

export enum GradeAttachmentType {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
}

@Entity()
export class GradeAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: GradeAttachmentType })
  type: GradeAttachmentType;

  @Column('varchar', { length: 500 })
  url: string;

  @Column('timestamptz')
  uploadedAt: Date;

  @ManyToOne(() => Teacher, { nullable: true, onDelete: 'SET NULL' })
  uploadedBy: Teacher | null;

  @ManyToOne(() => AcademicGroup, (group) => group.gradeAttachments, {
    onDelete: 'CASCADE',
  })
  group: AcademicGroup;
}