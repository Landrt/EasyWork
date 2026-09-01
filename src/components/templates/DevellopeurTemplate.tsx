import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
  data: CVData;
}

export const DevellopeurTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full bg-white text-black font-sans flex h-full min-h-[1123px]">
      
      {/* Left Column - Black Background */}
      <div className="w-[35%] bg-black text-white flex flex-col">
        {/* Profile Picture */}
        <div className="w-full aspect-[3/4] bg-neutral-800 relative">
          {data.header.photoUrl ? (
            <img src={data.header.photoUrl} alt="Photo de profil" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-500 flex-col">
              <span className="material-symbols-outlined text-4xl mb-2">account_circle</span>
              <span className="text-xs uppercase tracking-widest">Photo</span>
            </div>
          )}
        </div>

        <div className="p-8 space-y-10 flex-1">
          {/* Contact Info */}
          <div className="space-y-2 text-sm leading-relaxed text-gray-300">
            {data.header.location && <div>{data.header.location}</div>}
            {data.header.email && <div>{data.header.email}</div>}
            {data.header.phone && <div>{data.header.phone}</div>}
          </div>

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Langues</h3>
              <div className="text-sm space-y-1 text-gray-300">
                {data.languages.map((lang, idx) => (
                  <div key={idx}>{lang}</div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Compétences</h3>
              <div className="text-sm space-y-2 text-gray-300">
                {data.skills.map((skill, idx) => (
                  <div key={idx}>{skill}</div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Centres d'intérêts</h3>
              <div className="text-sm space-y-2 text-gray-300">
                {data.interests.map((interest, idx) => (
                  <div key={idx}>{interest}</div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections (Left Column) */}
          {data.customSections?.filter(c => c.column === 'left').map((cSec) => (
            <div key={cSec.id}>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">{cSec.title}</h3>
              <div className="text-sm space-y-2 text-gray-300">
                {cSec.items.map((item, idx) => (
                  <div key={idx}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - White Background */}
      <div className="w-[65%] bg-white p-10 flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-black uppercase leading-[1.1] tracking-tight">{data.header.name || 'Nom Prénom'}</h1>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-500 mb-4">{data.header.title}</h2>
            {data.header.summary && (
              <p className="text-sm text-gray-800 leading-relaxed text-justify">
                {data.header.summary}
              </p>
            )}
          </div>
        </div>

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Expériences Professionnelles</h3>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <h4 className="text-lg font-black uppercase">{exp.title}</h4>
                  <div className="text-sm text-slate-500 font-medium mb-3">
                    {exp.company}{exp.location ? `, ${exp.location}` : ''} | {exp.dates}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx} className="pl-1">{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Formations</h3>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="text-lg font-black uppercase">{edu.degree}</h4>
                  <div className="text-sm text-slate-500 font-medium mt-1">
                    {edu.school}{edu.dates ? ` | ${edu.dates}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Projets</h3>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-2">
              {data.projects.map((project, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">{project}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Custom Sections (Main Column) */}
        {data.customSections?.filter(c => c.column === 'main' || !c.column).map((cSec) => (
          <div key={cSec.id}>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6">{cSec.title}</h3>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-2">
              {cSec.items.map((item, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    </div>
  );
};
