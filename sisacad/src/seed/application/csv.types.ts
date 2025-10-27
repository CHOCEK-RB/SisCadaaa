import { type } from 'os';

export type Student = {
  cui: string;
  email: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  semester: string;
};

export type Teacher = {
  email: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
};

export type Secretary = {
  email: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
};

export type Admin = {
  email: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
};

export type Course = {
  code: string;
  name: string;
  credits: string;
  prrq_1: string;
  prrq_2: string;
  semester: string;
};

export type Classroom = {
  name: string;
  location: string;
  type: string;
};
