import { DEGREE_OPTIONS, GENDER_SELECT } from "@/utils/constants.js";

export type Gender = (typeof GENDER_SELECT)[keyof typeof GENDER_SELECT];

export type Degree = (typeof DEGREE_OPTIONS)[keyof typeof DEGREE_OPTIONS];

export interface LecturerFile {
  publicId: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
}

export interface RegisterLecturer {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  lecturerFile: LecturerFile;
  phoneNumber: string;
  gender: Gender;
  nationality: string;
  professionalTitle: string;
  beginStudies: Date;
  highestDegree: Degree;
  bio: string;
}
