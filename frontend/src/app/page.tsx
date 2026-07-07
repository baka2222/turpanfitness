import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import Marquee from "@/components/sections/Marquee";
import AboutSection from "@/components/sections/AboutSection";
import StatsBar from "@/components/sections/StatsBar";
import AdvantagesSection from "@/components/sections/AdvantagesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TrainersPreview from "@/components/sections/TrainersPreview";
import ReviewsSection from "@/components/sections/ReviewsSection";
import NewsPreview from "@/components/sections/NewsPreview";
import CTASection from "@/components/sections/CTASection";
import { api } from "@/lib/api";
import { getLang } from "@/lib/getLang";
import { getTranslations } from "@/lib/translations";

export const dynamic = "force-dynamic";

async function getData(lang: string) {
  const [settings, trainers, reviews, newsData, advantages, zones] = await Promise.all([
    api.settings(lang),
    api.trainers(lang),
    api.reviews(lang),
    api.news(lang),
    api.advantages(lang),
    api.zones(lang),
  ]);

  return {
    settings,
    trainers,
    reviews,
    news: newsData.results,
    advantages,
    zones,
  };
}

export default async function HomePage() {
  const lang = await getLang();
  const t = getTranslations(lang);
  const data = await getData(lang);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection settings={data.settings} />
        <Marquee items={t.marquee} />
        <AboutSection settings={data.settings} />
        <StatsBar />
        <AdvantagesSection
          items={data.advantages}
          tag={t.advantages_section.tag}
          title={t.advantages_section.title}
        />
        <ServicesSection
          zones={data.zones}
          tag={t.services_section.tag}
          title={t.services_section.title}
          viewAll={t.services_section.view_all}
          detail={t.services_section.detail}
        />
        <TrainersPreview trainers={data.trainers} />
        <ReviewsSection reviews={data.reviews} />
        <NewsPreview
          news={data.news}
          tag={t.news.tag}
          title={t.news.title}
          viewAllShort={t.news.view_all_short}
          viewAll={t.news.view_all}
          lang={lang}
        />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
