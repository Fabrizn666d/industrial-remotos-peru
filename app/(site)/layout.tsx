import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroLoader } from "@/components/IntroLoader";
import { ProjectProvider } from "@/components/ProjectContext";
import { ProjectExperience } from "@/components/ProjectExperience";
import { PrivacyRuntime } from "@/components/PrivacyRuntime";
import { FloatingActions } from "@/components/FloatingActions";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProjectProvider>
      <IntroLoader />
      <Header />
      {children}
      <Footer />
      <ProjectExperience />
      <FloatingActions />
      <PrivacyRuntime />
    </ProjectProvider>
  );
}
