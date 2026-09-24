import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroLoader } from "@/components/IntroLoader";
import { ProjectProvider } from "@/components/ProjectContext";
import { ProjectExperience } from "@/components/ProjectExperience";
import { PrivacyRuntime } from "@/components/PrivacyRuntime";
import { FloatingActions } from "@/components/FloatingActions";
import { HomeIntroProvider } from "@/components/HomeIntroController";
import { PageTransition } from "@/components/PageTransition";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProjectProvider>
      <HomeIntroProvider>
        <IntroLoader />
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
