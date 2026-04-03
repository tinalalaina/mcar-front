import { ReactNode } from "react";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/HeroCarousel";
import SearchBar from "@/components/SearchBar";

import {
  PopularVehicles,
  FavoriteVehicles,
  MostBookedVehicles,
  NewVehicles,
  WhyGasyCarSection,
  BecomeHostCTA,
  SideContent,
} from "@/components/home";
import CategorySelectModal from "@/components/CategorySelectModal";
import { Button } from "@/components/ui/button";

/** Wrapper */
const ContentWrapper = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
    {children}
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-slate-50/40 to-muted/20">
      <CategorySelectModal />

      <section className="relative flex flex-col">
        <HeroCarousel />

        <div className="relative w-full bg-[linear-gradient(135deg,rgba(10,25,41,0.98),rgba(15,23,42,0.94))] shadow-inner">
          <div
            className="
              relative z-30
              -mt-10 mb-4
              flex w-full justify-center
              px-4 sm:-mt-12 sm:mb-5 sm:px-6
              md:px-10
              lg:-mt-14
            "
          >
            <div className="w-full max-w-5xl">
              <SearchBar />
            </div>
          </div>

          <ContentWrapper>
            <div className="flex flex-col items-center justify-between gap-4 px-2 pb-6 text-center md:flex-row md:px-4 md:pb-8 md:text-left">
              <div className="flex max-w-2xl flex-col gap-1.5">
                <h2 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
                  Faites rouler votre économie.
                </h2>
                <p className="text-[13px] font-light leading-relaxed text-slate-300 sm:text-sm lg:text-[15px]">
                  Rejoignez la communauté{" "}
                  <span className="font-semibold text-primary italic">
                    MadaGasyCar
                  </span>
                  . Transformez votre véhicule en source de revenus stable dès
                  aujourd&apos;hui.
                </p>
              </div>

              <Button
                asChild
                className="shrink-0 rounded-xl bg-primary px-8 py-6 text-sm font-bold text-primary-foreground shadow-xl transition-all duration-300 hover:scale-[1.03] hover:bg-primary/90 sm:text-[15px]"
              >
                <Link to="/devenir-hote">Inscrire ma voiture</Link>
              </Button>
            </div>
          </ContentWrapper>
        </div>
      </section>

      <ContentWrapper>
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex flex-col gap-6 lg:flex-row xl:gap-8">
            <div className="min-w-0 w-full lg:w-[79%] xl:w-[80%]">
              <section className="mb-10 overflow-hidden">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-[12px] font-bold uppercase tracking-widest text-primary">
                      Exploration & Liberté
                    </span>

                    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl xl:text-[2.6rem] xl:leading-[1.1]">
                      Parcourez Madagascar <br />
                      <span className="text-primary">
                        avec le véhicule idéal.
                      </span>
                    </h1>

                    <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-500 sm:text-[16px]">
                      De la ville aux pistes côtières, trouvez la voiture
                      parfaite parmi nos meilleures offres locales. Fiabilité,
                      sécurité et confort réunis sur une seule plateforme.
                    </p>
                  </div>
                </div>
              </section>

              <div className="space-y-12">
                <PopularVehicles />
                <NewVehicles />
                <FavoriteVehicles />
                <MostBookedVehicles />
              </div>

              <div className="mt-16">
                <WhyGasyCarSection />
              </div>

              <div className="mt-12">
                <BecomeHostCTA />
              </div>
            </div>

            <SideContent />
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default Index;