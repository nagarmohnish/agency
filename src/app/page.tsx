import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import Services from "@/components/Services";
import Calculator from "@/components/Calculator";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="section-gradient-divider" />
      <BrandMarquee />
      <div className="section-gradient-divider" />
      <Services />
      <div className="section-gradient-divider" />
      <Calculator />
      <div className="section-gradient-divider" />
      <Contact />
    </>
  );
}
