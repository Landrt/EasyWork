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
    photoUrl?: string;
  };
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  languages?: string[];
  interests?: string[];
  projects?: string[];
  customSections?: CustomSection[];
}

export interface CustomSection {
  id: string;
  title: string;
  column?: 'left' | 'main';
  items: string[];
}
