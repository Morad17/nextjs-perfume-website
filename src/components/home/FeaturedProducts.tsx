import { prisma } from "@/lib/prisma";
import FeaturedShowcase from "./FeaturedShowcase";
import type { Product } from "@/types/product";

// Slug of the product to feature in the parallax showcase.
// Swap this out once multi-layer scenes are ready for other products.
const PARALLAX_SLUG = "wardat-al-jabal";

export default async function FeaturedProducts() {
  const raw = await prisma.product.findFirst({
    where: { slug: PARALLAX_SLUG },
  });

  if (!raw) return null;

  const product = raw as unknown as Product;
  return <FeaturedShowcase product={product} />;
}
