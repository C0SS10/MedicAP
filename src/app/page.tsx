import { BackgroundBlobs } from "@/components/layout/BackgroundBlobs";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <BackgroundBlobs />
      <Header />
      <Hero />
      <FeaturedProducts />
      <HowItWorks />
    </div>
  );
}