import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";

export const metadata: Metadata = {
  title: "Maison Lumière — Luxury Perfumery",
  description:
    "Rare, handcrafted fragrances for those who seek the extraordinary. Discover the Maison Lumière collection.",
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <BrandStory />
    </main>
  );
}
