import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectProvider } from "@/components/ProjectContext";
import { ProjectExperience } from "@/components/ProjectExperience";
import { PrivacyRuntime } from "@/components/PrivacyRuntime";
import { FloatingActions } from "@/components/FloatingActions";
import { HomeIntroProvider } from "@/components/HomeIntroController";
import { IntroLoader } from "@/components/IntroLoader";
import { PageTransition } from "@/components/PageTransition";
import { PremiumScrollIndicator } from "@/components/PremiumScrollIndicator";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProjectProvider>
      <HomeIntroProvider>
        <IntroLoader />
        <PremiumScrollIndicator />
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <ProjectExperience />
        <FloatingActions />
        <PrivacyRuntime />
      </HomeIntroProvider>
    </ProjectProvider>
  );
}
