import { prisma } from "@/lib/prisma";
import FeaturedShowcase from "./FeaturedShowcase";
import type { Product } from "@/types/product";

const SCENE_SLUGS = [
  "anbar-al-nil",
  "dukhan-al-arz",
  "ghamam",
  "sahar-al-bahr",
  "wardat-al-jabal",
  "zahr-al-lemon",
];

export default async function FeaturedProducts() {
  const raw = await prisma.product.findMany({
    where: { slug: { in: SCENE_SLUGS } },
  });

  if (!raw.length) return null;

  const products = raw as unknown as Product[];
  return <FeaturedShowcase products={products} />;
}
