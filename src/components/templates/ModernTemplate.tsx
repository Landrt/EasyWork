import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
  data: CVData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full bg-white text-gray-800 font-sans leading-relaxed">
      {/* Header */}
      <div className="bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{data.header.name}</h1>
        <h2 className="text-xl text-gray-300 font-light tracking-widest uppercase">{data.header.title}</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-gray-400">
          {data.header.location && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {data.header.location}
            </div>
          )}
          {data.header.email && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              {data.header.email}
            </div>
          )}
          {data.header.phone && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">call</span>
              {data.header.phone}
            </div>
          )}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Summary */}
          {data.header.summary && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">Profil</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{data.header.summary}</p>
            </section>
          )}

          {/* Experience */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">Expérience Professionnelle</h3>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-md font-bold text-gray-900">{exp.title}</h4>
                    <span className="text-xs text-gray-500 font-medium">{exp.dates}</span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium mb-2">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">Projets</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {data.projects.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Custom Sections */}
          {data.customSections?.map((cSec) => (
            <section key={cSec.id}>
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">{cSec.title}</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {cSec.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Education */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">Formation</h3>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="text-sm font-bold text-gray-900">{edu.degree}</h4>
                  <div className="text-xs text-gray-600 my-1">{edu.school}</div>
                  <div className="text-xs text-gray-500">{edu.dates}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
