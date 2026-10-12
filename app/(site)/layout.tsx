import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectProvider } from "@/components/ProjectContext";
import { ProjectExperience } from "@/components/ProjectExperience";
import { PrivacyRuntime } from "@/components/PrivacyRuntime";
import { FloatingActions } from "@/components/FloatingActions";
import { HomeIntroProvider } from "@/components/HomeIntroController";
import { IntroLoader } from "@/components/IntroLoader";
import { PageTransition } from "@/components/PageTransition";
import { NavigationTransitionConfigBridge } from "@/components/NavigationTransitionConfigBridge";
import { PublicMotionRuntime } from "@/components/PublicMotionRuntime";
import { PremiumScrollIndicator } from "@/components/PremiumScrollIndicator";
import { ContactDialogProvider } from "@/components/ContactDialog";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";
import { getCmsDocument } from "@/lib/cms/content-repository";

export const dynamic = "force-dynamic";

// Runs before the home markup is painted so a returning visitor never sees
// a partial poster/video before the session skip is hydrated.
const allowSessionSkip = process.env.NEXT_PUBLIC_FORCE_HOME_INTRO !== "true";
const introPreflight = `try{if(location.pathname==="/"&&new URLSearchParams(location.search).get("intro")!=="1"&&${JSON.stringify(allowSessionSkip)}&&sessionStorage.getItem(${JSON.stringify(HOME_INTRO_SESSION_KEY)})==="seen"){document.documentElement.classList.add(${JSON.stringify(HOME_INTRO_SEEN_CLASS)})}}catch{}`;

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ content: company }, { content: footer }, { content: contact }, { content: services }] = await Promise.all([getCmsDocument("company"), getCmsDocument("footer"), getCmsDocument("contact"), getCmsDocument("services")]);
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introPreflight }} />
      <ProjectProvider>
        <ContactDialogProvider content={contact} company={company} services={services.items.map((service) => ({ value: service.slug, label: service.title }))}>
          <HomeIntroProvider>
            <NavigationTransitionConfigBridge config={company.routeTransition} />
            <PublicMotionRuntime />
            <IntroLoader />
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
