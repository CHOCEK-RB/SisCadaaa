import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export abstract class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 50 })
  lastName: string;

  @Column('varchar', { length: 150 })
  email: string;
}
