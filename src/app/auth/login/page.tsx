import { Metadata } from "next";
import { MockResume } from "@/components/landing/mock-resume";
import { MockResumeMobile } from "@/components/landing/mock-resume-mobile";
import { BenefitsList } from "@/components/landing/benefits-list";
import { ActionButtons } from "@/components/landing/action-buttons";
import { Logo } from "@/components/ui/logo";
import { PricingSection } from "@/components/landing/pricing-section";
import { ErrorDialog } from "@/components/auth/error-dialog";
import { CreatorStory } from "@/components/landing/creator-story";
import { HowItWorks } from "@/components/landing/how-it-works";
import { HeroVideoSection } from "@/components/landing/hero-video-section";
import { Footer } from "@/components/layout/footer";
import { SplitContent } from "@/components/ui/split-content";
import { NavLinks } from "@/components/layout/nav-links";
import { ModelShowcase } from "@/components/landing/model-showcase";

// import { WaitlistSection } from "@/components/waitlist/waitlist-section";

export const metadata: Metadata = {
  title: "Connexion | EasyWork - CVs ATS & Candidatures Ciblées",
  description: "Créez des CVs sur-mesure optimisés pour les ATS et pilotez vos candidatures grâce à l'IA avec EasyWork.",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application", "EasyWork"],
  authors: [{ name: "EasyWork" }],
  openGraph: {
    title: "EasyWork - Tailored ATS Resumes & AI Job Applications",
    description: "Créez des CVs sur-mesure optimisés pour les ATS et pilotez vos candidatures avec EasyWork.",
    url: "https://easywork.com/auth/login",
    siteName: "EasyWork",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "EasyWork - AI Resume Builder",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyWork - Tailored ATS Resumes & AI Job Applications",
    description: "Créez des CVs sur-mesure optimisés pour les ATS et pilotez vos candidatures avec EasyWork.",
    images: ["/og.webp"],
    creator: "@easywork",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // verification: {
  //   google: "google-site-verification-code", // Replace with actual verification code
  // },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const showErrorDialog = params?.error === 'email_confirmation';

  return (
    <>
      <main className="relative overflow-x-hidden selection:bg-violet-200/50 -my-14 mb-6">
        {/* Error Dialog */}
        <ErrorDialog isOpen={!!showErrorDialog} />

        {/* Enhanced Gradient Background Elements */}
        <div className="fixed inset-0 z-0">
          {/* Primary gradient mesh with improved colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60 animate-gradient-slow" />
          
          {/* Enhanced animated gradient orbs with better positioning and animations - mobile optimized */}
          <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-violet-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
          <div className="absolute bottom-1/3 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
          <div className="absolute top-1/2 right-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-gradient-to-r from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />
          
          {/* Enhanced mesh grid overlay with subtle animation */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
        </div>

        {/* Enhanced Navigation with backdrop blur and border */}
        <nav className="border-b border-white/40 backdrop-blur-xl shadow-md fixed top-0 w-full bg-white/15 z-[1000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Logo />
              <NavLinks />
            </div>
          </div>
        </nav>

        {/* Enhanced Content with better spacing and animations */}
        <div className="relative z-10">
          {/* Hero Section with Split Layout */}
          <div className="mb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-8 lg:py-16 max-h-[80vh]">
              {/* Left Column - Content */}
              <div className="flex flex-col gap-6 lg:gap-10 lg:pr-12">
                <div className="space-y-6 lg:space-y-8">
                  {/* EasyWork Trust Badge */}
                  <div
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full 
                      bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-violet-500/10
                      border border-violet-200/40 backdrop-blur-xl shadow-lg shadow-violet-500/10
                      max-w-fit"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                      Optimisé ATS & IA Avancée
                    </span>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                      <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                        EasyWork
                      </span>
                      <br />
                      <span className="inline-block bg-gradient-to-r from-violet-500/90 via-blue-500/90 to-violet-500/90 bg-clip-text text-transparent animate-gradient-x relative">
                        Créez le CV qui décroche vos entretiens
                        <div className="absolute -bottom-2 left-0 w-16 sm:w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                      </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed max-w-2xl font-medium">
                      Générez des CVs percutants et des lettres sur-mesure optimisés pour passer tous les filtres ATS.
                    </p>
                  </div>

                  <BenefitsList />
                </div>
                
                <ActionButtons />
              </div>

              {/* Right Column - Floating Resume Preview */}
              <div className="relative mt-8 lg:mt-0">
                {/* Mobile-only single resume view */}
                <div className="block lg:hidden">
                  <div className="relative w-full max-w-[min(85vw,_6in)] mx-auto">
                    {/* Decorative Elements - Subtle gradients for mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 to-blue-500/3 rounded-sm transform rotate-2 scale-[1.02]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 to-blue-500/3 rounded-sm transform -rotate-2 scale-[1.02]" />
                    
                    {/* Stacked Resume Previews - Mobile Optimized */}
                    <div className="relative">
                      {/* Background Resume - Third Layer */}
                      <div className="absolute -right-4 top-2 opacity-80  scale-[0.99] rotate-[-6deg] ">
                        <MockResumeMobile />
                      </div>
                      
                      {/* Middle Resume - Second Layer */}
                      <div className="absolute -right-2 top-1 opacity-100 scale-[0.995] rotate-[-3deg] origin-center">
                        <MockResumeMobile />
                      </div>

                      {/* Front Resume - Main Layer */}
                      <div className="relative">
                        <MockResumeMobile />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop stacked resume view */}
                <div className="relative hidden lg:block">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-3xl transform rotate-3 scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-3xl transform -rotate-3 scale-105" />
                  
                  {/* Stacked Resume Previews */}
                  <div className="relative">
                    {/* Background Resume - Third Layer */}
                    <div className="absolute -right-12 top-4 opacity-60 blur-[1px] scale-[0.97] rotate-[-8deg] origin-bottom-right">
                      <MockResume />
                    </div>
                    
                    {/* Middle Resume - Second Layer */}
                    <div className="absolute -right-6 top-2 opacity-80 blur-[0.5px] scale-[0.985] rotate-[-4deg] origin-bottom-right">
                      <MockResume />
                    </div>

                    {/* Front Resume - Main Layer */}
                    <div className="relative">
                      <MockResume />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <HeroVideoSection />
          
          <ModelShowcase />

          <div className="flex flex-col gap-20 py-16" id="features">
            <SplitContent
              imageSrc="/SS Chat.png"
              heading="AI-Powered Resume Assistant"
              description="Get real-time feedback and suggestions from our advanced AI assistant. Optimize your resume content, improve your bullet points, and ensure your skills stand out to recruiters and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/Dashboard Image.png"
              heading="Beautiful Resume Dashboard"
              description="Manage all your resumes in one place with our intuitive dashboard. Create base resumes, generate tailored versions for specific jobs, and track your application progress with ease."
              imageOnLeft={false}
            />

            <SplitContent
              imageSrc="/SS Score.png"
              heading="Resume Performance Scoring"
              description="Get detailed insights into your resume's effectiveness with our comprehensive scoring system. Track key metrics, identify areas for improvement, and optimize your resume to stand out to employers and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/SS Cover Letter.png"
              heading="AI Cover Letter Generator"
              description="Create compelling, personalized cover letters in minutes with our AI-powered generator. Tailor your message to specific job opportunities while maintaining a professional and engaging tone that captures attention."
              imageOnLeft={false}
            />
          </div>

          {/* How It Works Section */}
          <div id="how-it-works">
            <HowItWorks />
          </div>

          {/* Pricing Section */}
          <div id="pricing">
            <PricingSection />
          </div>

          {/* Creator Story */}
          <div id="about">
            <CreatorStory />
          </div>
        </div>
      </main>
      <Footer variant="static"/>
    </>
  );
}
  