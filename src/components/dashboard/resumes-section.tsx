'use client';

import { Trash2, Copy, FileText, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MiniResumePreview } from '@/components/resume/shared/mini-resume-preview';
import { CreateResumeDialog } from '@/components/resume/management/dialogs/create-resume-dialog';
import { ResumeSortControls, type SortOption, type SortDirection } from '@/components/resume/management/resume-sort-controls';
import type { Profile, Resume } from '@/lib/types';
import { deleteResume, copyResume } from '@/utils/actions/resumes/actions';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ApplicationStatusBadge } from '@/components/resume/management/application-status-badge';

interface ResumesSectionProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  profile: Profile;
  sortParam: string;
  directionParam: string;
  currentSort: SortOption;
  currentDirection: SortDirection;
  baseResumes?: Resume[]; // Only needed for tailored type
  canCreateMore?: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export function ResumesSection({ 
  type,
  resumes,
  profile,
  sortParam,
  directionParam,
  currentSort,
  currentDirection,
  baseResumes = [],
  canCreateMore
}: ResumesSectionProps) {
  const config = {
    base: {
      border: 'border-[#E5E1D8]',
      bg: 'bg-white',
      text: 'text-[#1C1B18]',
      icon: FileText,
      accent: {
        bg: 'bg-[#efeeea]',
        hover: 'hover:bg-[#eae8e4]'
      }
    },
    tailored: {
      border: 'border-[#E5E1D8]',
      bg: 'bg-white',
      text: 'text-[#1C1B18]',
      icon: Sparkles,
      accent: {
        bg: 'bg-[#efeeea]',
        hover: 'hover:bg-[#eae8e4]'
      }
    }
  }[type];

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 7
  });

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedResumes = resumes.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }

  // Create Resume Card Component
  const CreateResumeCard = () => (
    <CreateResumeDialog 
      type={type} 
      profile={profile}
      {...(type === 'tailored' && { baseResumes })}
    >
      <button className={cn(
        "aspect-[8.5/11] rounded",
        "relative overflow-hidden",
        "border border-dashed border-[#E5E1D8] transition-all duration-300",
        "group/new-resume flex flex-col items-center justify-center gap-4",
        "bg-[#f5f3ef]/60 hover:bg-[#efeeea] hover:border-[#B8B1A5]",
        "w-full sm:w-auto mr-8 sm:mr-0"
      )}>
        <div className={cn(
          "relative z-10 flex flex-col items-center",
          "transform transition-all duration-300",
          "group-hover/new-resume:scale-105"
        )}>
          <div className={cn(
            "h-12 w-12 rounded border border-[#E5E1D8] bg-white",
            "flex items-center justify-center",
            "transform transition-all duration-300",
            "shadow-sm group-hover/new-resume:border-[#B8B1A5]"
          )}>
            <config.icon className="h-5 w-5 text-[#1C1B18]" />
          </div>
          
          <span className="mt-3 text-sm font-semibold font-serif text-[#1C1B18]">
            {type === 'base' ? 'Créer un CV Base' : 'Créer une Candidature'}
          </span>
          
          <span className="text-xs text-[#494740] opacity-80 group-hover/new-resume:opacity-100">
            {type === 'base' ? 'Profil général & compétences' : 'Adapté à une offre ciblée'}
          </span>
        </div>
      </button>
    </CreateResumeDialog>
  );

  // Limit Reached Card Component
  const LimitReachedCard = () => (
    <Link 
      href="/subscription"
      className="group/limit block cursor-pointer transition-all duration-300"
    >
      <div className={cn(
        "aspect-[8.5/11] rounded border border-dashed border-[#B8B1A5]",
        "relative overflow-hidden bg-[#efeeea]/70",
        "flex flex-col items-center justify-center gap-3 p-4 text-center",
        "hover:bg-[#eae8e4] transition-all duration-300"
      )}>
        <div className="h-12 w-12 rounded border border-[#B8B1A5] bg-white flex items-center justify-center">
          <config.icon className="h-5 w-5 text-[#1C1B18]" />
        </div>
        <span className="text-sm font-semibold font-serif text-[#1C1B18]">
          Limite du plan gratuit atteinte
        </span>
        <span className="text-xs text-[#127749] font-medium underline underline-offset-4">
          Passer à EasyWork Pro
        </span>
      </div>
    </Link>
  );

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1B18]">
              {type === 'base' ? 'CVs Généraux (Base)' : 'Candidatures & CVs Ciblés'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded border border-[#E5E1D8] bg-[#f5f3ef] text-[#494740]">
              {resumes.length}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <ResumeSortControls 
              sortParam={sortParam}
              directionParam={directionParam}
              currentSort={currentSort}
              currentDirection={currentDirection}
            />
          </div>
        </div>

        {/* Desktop Pagination (hidden on mobile) */}
        {resumes.length > pagination.itemsPerPage && (
          <div className="hidden md:flex w-full items-start justify-start -mt-4">
            <Pagination className="flex justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: Math.ceil(resumes.length / pagination.itemsPerPage) }).map((_, index) => {
                  const pageNumber = index + 1;
                  const totalPages = Math.ceil(resumes.length / pagination.itemsPerPage);
                  
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={cn(
                            "h-8 w-8 p-0",
                            "text-muted-foreground hover:text-foreground",
                            pagination.currentPage === pageNumber && "font-medium text-foreground"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      </PaginationItem>
                    );
                  }

                  if (
                    pageNumber === 2 && pagination.currentPage > 3 ||
                    pageNumber === totalPages - 1 && pagination.currentPage < totalPages - 2
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <span className="text-muted-foreground px-2">...</span>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === Math.ceil(resumes.length / pagination.itemsPerPage)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="relative pb-6">
        {/* Mobile View */}
        <div className="md:hidden w-full space-y-6">
          {/* Mobile Create Resume Button Row */}
          {canCreateMore ? (
            <div className="px-2 w-full  flex">
              <CreateResumeCard />
            </div>
          ) : (
            <div className="px-4 w-full">
              <LimitReachedCard />
            </div>
          )}

          {/* Mobile Resumes Carousel */}
          {paginatedResumes.length > 0 && (
            <div className="w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {paginatedResumes.map((resume) => (
                    <CarouselItem key={resume.id} className="basis-[85%] pl-4">
                      <div className="group relative">
                        <AlertDialog>
                          <div className="relative">
                            <Link href={`/resumes/${resume.id}`}>
                              <MiniResumePreview
                                name={resume.name}
                                type={type}
                                target_role={resume.target_role}
                                createdAt={resume.created_at}
                                className="hover:-translate-y-1 transition-transform duration-300"
                              />
                            </Link>
                            {type === 'tailored' && (
                              <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                                <ApplicationStatusBadge
                                  resumeId={resume.id}
                                  currentStatus={resume.application_status || 'preparing'}
                                />
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 flex gap-2">
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={cn(
                                    "h-8 w-8 rounded-lg",
                                    "bg-rose-50/80 hover:bg-rose-100/80",
                                    "text-rose-600 hover:text-rose-700",
                                    "border border-rose-200/60",
                                    "shadow-sm",
                                    "transition-all duration-300",
                                    "hover:scale-105 hover:shadow-md",
                                    "hover:-translate-y-0.5"
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <form action={async () => {
                                await copyResume(resume.id);
                              }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  type="submit"
                                  className={cn(
                                    "h-8 w-8 rounded-lg",
                                    "bg-teal-50/80 hover:bg-teal-100/80",
                                    "text-teal-600 hover:text-teal-700",
                                    "border border-teal-200/60",
                                    "shadow-sm",
                                    "transition-all duration-300",
                                    "hover:scale-105 hover:shadow-md",
                                    "hover:-translate-y-0.5"
                                  )}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </form>
                            </div>
                          </div>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form action={async () => {
                                await deleteResume(resume.id);
                              }}>
                                <AlertDialogAction
                                  type="submit"
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="absolute -left-12 top-1/2" />
                  <CarouselNext className="absolute -right-12 top-1/2" />
                </div>
              </Carousel>
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {canCreateMore ? (
            <CreateResumeCard />
          ) : (
            <LimitReachedCard />
          )}

          {paginatedResumes.map((resume) => (
            <div key={resume.id} className="group relative">
              <AlertDialog>
                <div className="relative">
                  <Link href={`/resumes/${resume.id}`}>
                    <MiniResumePreview
                      name={resume.name}
                      type={type}
                      target_role={resume.target_role}
                      createdAt={resume.created_at}
                      className="hover:-translate-y-1 transition-transform duration-300"
                    />
                  </Link>
                  {type === 'tailored' && (
                    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                      <ApplicationStatusBadge
                        resumeId={resume.id}
                        currentStatus={resume.application_status || 'preparing'}
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          "bg-rose-50/80 hover:bg-rose-100/80",
                          "text-rose-600 hover:text-rose-700",
                          "border border-rose-200/60",
                          "shadow-sm",
                          "transition-all duration-300",
                          "hover:scale-105 hover:shadow-md",
                          "hover:-translate-y-0.5"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <form action={async () => {
                      await copyResume(resume.id);
                    }}>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="submit"
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          "bg-teal-50/80 hover:bg-teal-100/80",
                          "text-teal-600 hover:text-teal-700",
                          "border border-teal-200/60",
                          "shadow-sm",
                          "transition-all duration-300",
                          "hover:scale-105 hover:shadow-md",
                          "hover:-translate-y-0.5"
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={async () => {
                      await deleteResume(resume.id);
                    }}>
                      <AlertDialogAction
                        type="submit"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          {resumes.length === 0 && resumes.length + 1 < 4 && (
            <div className="col-span-2 md:col-span-1" />
          )}
        </div>
      </div>
    </div>
  );
} 