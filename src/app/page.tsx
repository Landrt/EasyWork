/**
 * Home Page Component
 * 
 * This is the main dashboard page of the Resume AI application. It displays:
 * - User profile information
 * - Quick stats (profile score, resume counts, job postings)
 * - Base resume management
 * - Tailored resume management
 * 
 * The page implements a soft gradient minimalism design with floating orbs
 * and mesh overlay for visual interest.
 */

import { redirect } from "next/navigation";
import { countResumes } from "../utils/actions/resumes/actions";
import {User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileRow } from "@/components/dashboard/profile-row";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { getGreeting } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import { type SortOption, type SortDirection } from "@/components/resume/management/resume-sort-controls";
import type { Resume } from "@/lib/types";
import { ResumesSection } from "@/components/dashboard/resumes-section";
import { createClient } from "@/utils/supabase/server";
import { getDashboardData } from "@/utils/actions";
import { checkSubscriptionPlan } from "@/utils/actions/paddle/actions";





// import ResumeRow from "@/components/dashboard/resume-row";




export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {

  const supabase = await createClient();
  

  const {
    data: { user },
  } = await supabase.auth.getUser()



  const userId = user?.id;
  void userId;
  
  
  // Check if user is coming from confirmation
  const params = await searchParams;
  const isNewSignup = params?.type === 'signup' && params?.token_hash;

  // Tracking clic partenaire ?ref=CODE
  if (params?.ref) {
    try {
      const { createServiceClient } = await import('@/utils/supabase/server');
      const serviceClient = await createServiceClient();
      const { data: partner } = await serviceClient
        .from('affiliates')
        .select('id, total_clicks, is_active')
        .ilike('code', params.ref.trim())
        .maybeSingle();

      if (partner && partner.is_active !== false) {
        await serviceClient.from('affiliate_clicks').insert({
          affiliate_id: partner.id,
          source: 'direct_ref_url',
        });
        await serviceClient.from('affiliates').update({
          total_clicks: (partner.total_clicks || 0) + 1,
        }).eq('id', partner.id);
      }
    } catch {
      // Ignorer pour ne pas impacter le chargement
    }
  }

  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
    if (!data.profile) {
      redirect("/auth/login");
    }
  } catch {
    // Redirect to login if error occurs
    redirect("/auth/login");
  }

  const { profile, baseResumes: unsortedBaseResumes, tailoredResumes: unsortedTailoredResumes } = data;

  // Get sort parameters for both sections
  const baseSort = (params.baseSort as SortOption) || 'createdAt';
  const baseDirection = (params.baseDirection as SortDirection) || 'asc';
  const tailoredSort = (params.tailoredSort as SortOption) || 'createdAt';
  const tailoredDirection = (params.tailoredDirection as SortDirection) || 'asc';

  // Sort function
  function sortResumes(resumes: Resume[], sort: SortOption, direction: SortDirection) {
    return [...resumes].sort((a, b) => {
      const modifier = direction === 'asc' ? 1 : -1;
      switch (sort) {
        case 'name':
          return modifier * a.name.localeCompare(b.name);
        case 'jobTitle':
          return modifier * ((a.target_role || '').localeCompare(b.target_role || '') || 0);
        case 'createdAt':
        default:
          return modifier * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
    }
    });
  }


  // Sort both resume lists
  const baseResumes = sortResumes(unsortedBaseResumes, baseSort, baseDirection);
  const tailoredResumes = sortResumes(unsortedTailoredResumes, tailoredSort, tailoredDirection);
  
  // Check if user has active paid access (sprint, monthly, lifetime)
  const subscription = await checkSubscriptionPlan();
  const isProPlan = subscription.isActive && subscription.plan !== 'free';

  // console.log(subscription);
  
  // Count resumes for base and tailored sections
  const baseResumesCount = await countResumes('base');
  const tailoredResumesCount = await countResumes('tailored');
  // console.log(baseResumesCount, tailoredResumesCount);
  // console.log(isProPlan);
  

  // Free plan limits
  const canCreateBase = isProPlan || baseResumesCount < 2;
  const canCreateTailored = isProPlan || tailoredResumesCount < 4;


  // Display a friendly message if no profile exists
  if (!profile) {
    return (
      <main className="min-h-screen p-6 md:p-8 lg:p-10 relative flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800">Profile Not Found</h2>
            <p className="text-muted-foreground">
              We couldn&apos;t find your profile information. Please contact support for assistance.
            </p>
            <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              Contact Support
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative sm:pb-12 pb-40 bg-[#fbf9f5]">
      {/* Welcome Dialog for New Signups */}
      <WelcomeDialog isOpen={!!isNewSignup} />
      
      {/* Editorial Parchment Subtle Background Structure */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#fbf9f5]">
        <div className="absolute inset-0 bg-[radial-gradient(#E5E1D8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Profile Row Component */}
        <ProfileRow profile={profile} />
        
        <div className="pl-2 sm:pl-0 sm:container sm:max-none max-w-7xl mx-auto lg:px-8 md:px-8 sm:px-6 pt-4">  
          {/* Profile Overview */}
          <div className="mb-6 space-y-4">
            {/* API Key Alert */}
            {!isProPlan && <ApiKeyAlert />}
            
            {/* Greeting */}
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C1B18]">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-[#494740] mt-1 font-sans">
                  Bienvenue sur votre tableau de bord <span className="font-semibold text-[#1C1B18]">EasyWork</span>
                </p>
              </div>
            </div>

            {/* Resume Bookshelf */}
            <div className="space-y-6 pt-2">
              {/* Base Resumes Section */}
              <ResumesSection
                type="base"
                resumes={baseResumes}
                profile={profile}
                sortParam="baseSort"
                directionParam="baseDirection"
                currentSort={baseSort}
                currentDirection={baseDirection}
                canCreateMore={canCreateBase}
              />

              {/* Editorial Divider */}
              <div className="relative py-2">
                <div className="h-px bg-[#E5E1D8]" />
              </div>

              {/* Tailored Resumes Section */}
              <ResumesSection
                type="tailored"
                resumes={tailoredResumes}
                profile={profile}
                sortParam="tailoredSort"
                directionParam="tailoredDirection"
                currentSort={tailoredSort}
                currentDirection={tailoredDirection}
                baseResumes={baseResumes}
                canCreateMore={canCreateTailored}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
