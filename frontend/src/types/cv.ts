export interface CVExperience {
  id: number | string;
  title: string;
  company: string;
  location: string;
  dates: string;
  highlights: string[];
}

export interface CVEducation {
  id: number | string;
  degree: string;
  school: string;
  dates: string;
}

export interface CVData {
  header: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    summary?: string;
  };
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
}
