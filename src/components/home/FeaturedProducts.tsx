import { prisma } from "@/lib/prisma";
import FeaturedShowcase from "./FeaturedShowcase";
import type { Product } from "@/types/product";

const SCENE_SLUGS = new Set(["dukhan-al-arz", "wardat-al-jabal", "zahr-al-lemon"]);

export default async function FeaturedProducts() {
  const raw = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "asc" },
  });

  const products = raw as unknown as Product[];
  const showcaseProducts = products.filter((p) => SCENE_SLUGS.has(p.slug));

  if (showcaseProducts.length === 0) return null;

  return <FeaturedShowcase products={showcaseProducts} />;
}
