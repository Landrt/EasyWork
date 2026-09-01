export * from './ModernTemplate';
export * from './ExecutiveTemplate';

import { ModernTemplate } from './ModernTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

export const TEMPLATES = [
  {
    id: 'modern',
    name: 'Moderne (ATS Optimisé)',
    component: ModernTemplate,
    previewUrl: '/templates/modern-preview.png', // We'll just map this to a generic or existing preview for now
  },
  {
    id: 'executive',
    name: 'Executive (Senior)',
    component: ExecutiveTemplate,
    previewUrl: '/templates/executive-preview.png',
  }
];

export const getTemplateComponent = (id: string | null) => {
  const template = TEMPLATES.find(t => t.id === id);
  return template ? template.component : ModernTemplate; // Default to modern
};
