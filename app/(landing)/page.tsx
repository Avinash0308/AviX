import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingContent } from "@/components/landing-content";

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Aurora Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] aurora-glow-1 pointer-events-none blur-3xl opacity-60 -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] aurora-glow-2 pointer-events-none blur-3xl opacity-40 -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] aurora-glow-1 pointer-events-none blur-3xl opacity-30 -z-10" />

      {/* Main Sections */}
      <LandingNavbar />
      <LandingHero />
      <LandingContent />
    </div>
  );
};

export default LandingPage;
