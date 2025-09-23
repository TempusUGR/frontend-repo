export interface RegistrationStats {
  teacher: number;
  student: number;
}

export interface LoginsStats {
  teacher: { [day: string]: number };
  student: { [day: string]: number };
}

export interface IcsDownloadsStats {
  [day: string]: number;
}
