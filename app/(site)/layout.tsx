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
import { ContactDialogProvider } from "@/components/ContactDialog";
import { getCmsDocument } from "@/lib/cms/content-repository";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ content: company }, { content: footer }, { content: contact }, { content: services }] = await Promise.all([getCmsDocument("company"), getCmsDocument("footer"), getCmsDocument("contact"), getCmsDocument("services")]);
  const introPreflight = `try{const h=document.documentElement,k="${HOME_INTRO_SESSION_KEY}",c="${HOME_INTRO_SEEN_CLASS}";if(location.pathname!=="/"){sessionStorage.setItem(k,"seen");h.classList.add(c)}else if(new URLSearchParams(location.search).get("intro")==="1"){h.dataset.irpIntroCurrent="play"}else if(sessionStorage.getItem(k)==="seen"){h.classList.add(c)}else{sessionStorage.setItem(k,"seen");h.dataset.irpIntroCurrent="play"}}catch{}`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introPreflight }} />
      <ProjectProvider>
        <ContactDialogProvider content={contact} company={company} services={services.items.map((service) => ({ value: service.slug, label: service.title }))}>
          <HomeIntroProvider>
            <NavigationTransitionConfigBridge config={company.routeTransition} />
            <PublicMotionRuntime />
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
