import HeroSection from "@/components/homepage/hero-section";
import FeaturedTemplates from "@/components/homepage/featured-templates";
import CategoriesGrid from "@/components/homepage/categories-grid";
import TestimonialSection from "@/components/homepage/testimonial-section";
import CallToAction from "@/components/homepage/call-to-action";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>CodeCraft Market - A marketplace for developers</title>
        <meta name="description" content="A curated marketplace for hobbyist developers to buy and sell code templates and micro-apps." />
      </Helmet>
      <HeroSection />
      <FeaturedTemplates />
      <CategoriesGrid />
      <TestimonialSection />
      <CallToAction />
    </>
  );
}
