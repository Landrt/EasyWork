export * from './ModernTemplate';
export * from './ExecutiveTemplate';
export * from './DevellopeurTemplate';

import { ModernTemplate } from './ModernTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { DevellopeurTemplate } from './DevellopeurTemplate';

export const TEMPLATES = [
  {
    id: 'modern',
    name: 'Moderne (ATS Optimisé)',
    component: ModernTemplate,
    previewUrl: '/templates/modern-preview.png',
    supportsPhoto: false,
    supportedSections: ['experience', 'education', 'skills', 'projects'],
    hasSidebar: false,
  },
  {
    id: 'executive',
    name: 'Executive (Senior)',
    component: ExecutiveTemplate,
    previewUrl: '/templates/executive-preview.png',
    supportsPhoto: false,
    supportedSections: ['experience', 'education', 'skills', 'projects', 'languages'],
    hasSidebar: false,
  },
  {
    id: 'devellopeur',
    name: 'Développeur (2 Colonnes)',
    component: DevellopeurTemplate,
    previewUrl: '/templates/Devellopeur.png',
    supportsPhoto: true,
    supportedSections: ['experience', 'education', 'skills', 'languages', 'interests', 'projects'],
    hasSidebar: true,
  }
];

export const getTemplateComponent = (id: string | null) => {
  const template = TEMPLATES.find(t => t.id === id);
  return template ? template.component : ModernTemplate; // Default to modern
};
