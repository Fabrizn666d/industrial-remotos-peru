import {draftMode} from "next/headers";
import {PreviewBanner} from "@/components/admin/PreviewBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectProvider } from "@/components/ProjectContext";
import { ProjectExperience } from "@/components/ProjectExperience";
import { PrivacyRuntime } from "@/components/PrivacyRuntime";
import { FloatingActions } from "@/components/FloatingActions";
import { HomeIntroProvider } from "@/components/HomeIntroController";
import { PageTransition } from "@/components/PageTransition";
import { NavigationTransitionConfigBridge } from "@/components/NavigationTransitionConfigBridge";
import { PublicMotionRuntime } from "@/components/PublicMotionRuntime";
import { PremiumScrollIndicator } from "@/components/PremiumScrollIndicator";
import { MagneticButtonsRuntime } from "@/components/motion/MagneticButtonsRuntime";
import { ContactDialogProvider } from "@/components/ContactDialog";
import { getCmsDocument } from "@/lib/cms/content-repository";
import "@/app/public-premium.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ content: company }, { content: footer }, { content: contact }, { content: services }] = await Promise.all([getCmsDocument("company"), getCmsDocument("footer"), getCmsDocument("contact"), getCmsDocument("services")]);
  return (
    <>
      {(await draftMode()).isEnabled && <PreviewBanner/>}
      <ProjectProvider>
        <ContactDialogProvider content={contact} company={company} services={services.items.map((service) => ({ value: service.slug, label: service.title }))}>
          <HomeIntroProvider>
            <NavigationTransitionConfigBridge config={company.routeTransition} />
            <PublicMotionRuntime />
            <MagneticButtonsRuntime />
            <PremiumScrollIndicator />
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer company={company} content={footer} />
            <ProjectExperience />
            <FloatingActions />
            <PrivacyRuntime />
          </HomeIntroProvider>
        </ContactDialogProvider>
      </ProjectProvider>
    </>
  );
}
