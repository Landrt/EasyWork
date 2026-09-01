import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
  data: CVData;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full bg-white text-slate-800 font-serif leading-relaxed">
      {/* Header */}
      <div className="text-center py-10 px-8 border-b-4 border-slate-800">
        <h1 className="text-5xl font-bold uppercase tracking-widest text-slate-900 mb-3">{data.header.name}</h1>
        <h2 className="text-2xl text-slate-600 italic font-medium">{data.header.title}</h2>
        
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-6 text-sm text-slate-500 font-sans uppercase tracking-wider">
          {data.header.location && <span>{data.header.location}</span>}
          {(data.header.location && (data.header.email || data.header.phone)) && <span>|</span>}
          {data.header.email && <span>{data.header.email}</span>}
          {(data.header.email && data.header.phone) && <span>|</span>}
          {data.header.phone && <span>{data.header.phone}</span>}
        </div>
      </div>

      <div className="p-10 max-w-4xl mx-auto space-y-10">
        {/* Summary */}
        {data.header.summary && (
          <section>
            <p className="text-base text-slate-700 leading-relaxed text-justify first-letter:text-3xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-1 first-letter:float-left">
              {data.header.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Expérience</h3>
            <div className="h-px bg-slate-300 w-full"></div>
          </div>
          
          <div className="space-y-8">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-end mb-1">
                  <h4 className="text-lg font-bold text-slate-900">{exp.title}</h4>
                  <span className="text-sm text-slate-500 italic font-sans">{exp.dates}</span>
                </div>
                <div className="text-md text-slate-700 font-bold mb-3 uppercase tracking-wide text-sm">
                  {exp.company} {exp.location && <span className="text-slate-400 font-normal">, {exp.location}</span>}
                </div>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 font-sans">
                  {exp.highlights.map((highlight, idx) => (
                    <li key={idx} className="pl-1">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Education */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Formation</h3>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="space-y-5">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="text-md font-bold text-slate-900">{edu.degree}</h4>
                  <div className="text-sm text-slate-700 mt-1">{edu.school}</div>
                  <div className="text-sm text-slate-500 italic font-sans">{edu.dates}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Compétences</h3>
                <div className="h-px bg-slate-300 w-full"></div>
              </div>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2 font-sans">
                {data.skills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
