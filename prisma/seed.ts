import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Sahar Al Bahr",
    inspiration: "Dawn over the ocean",
    slug: "sahar-al-bahr",
    description:
      "A breath of coastline at first light — where the sea meets silence. Sahar Al Bahr opens with a burst of cool bergamot and sea salt before drifting into the warmth of driftwood and white musk. A perfume for those who find peace at the water's edge.",
    price: 19500,
    scentNotes: {
      top: ["Sea Salt", "Bergamot", "Aquatic Ozonic"],
      heart: ["Driftwood", "White Florals", "Coconut Husk"],
      base: ["White Musk", "Sandalwood", "Ambergris"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 38,
    imageUrl: "sahar-al-bahr.png",
    imageAlt: "Sahar Al Bahr — frosted glass bottle on wet coastal stone",
    category: "aquatic",
    featured: true,
  },
  {
    name: "Dukhan Al Arz",
    inspiration: "Cedar forest smoke",
    slug: "dukhan-al-arz",
    description:
      "Deep within ancient cedar groves, smoke rises through pine-needled air. Dukhan Al Arz captures that primal, earthy stillness — a resinous oud heart wrapped in smouldering cedarwood and cool vetiver. Bold, grounding, and unmistakably wild.",
    price: 19500,
    scentNotes: {
      top: ["Smoky Birch", "Black Pepper", "Pine Resin"],
      heart: ["Cedarwood", "Smoky Oud", "Labdanum"],
      base: ["Vetiver", "Dark Musk", "Castoreum"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 22,
    imageUrl: "dukhan-al-arz.png",
    imageAlt: "Dukhan Al Arz — dark amber bottle beside cedar bark and ash",
    category: "woody",
    featured: false,
  },
  {
    name: "Zahr Al Lemon",
    inspiration: "Wild citrus groves",
    slug: "zahr-al-lemon",
    description:
      "Sunlight breaking through a canopy of lemon trees in full bloom. Zahr Al Lemon is a radiant, uplifting scent that balances the sharp brightness of citrus blossom with the soft warmth of neroli and a grounding base of light oud and sandalwood. Mediterranean soul, Arab heart.",
    price: 19500,
    scentNotes: {
      top: ["Lemon Blossom", "Sicilian Bergamot", "Green Leaves"],
      heart: ["Neroli", "Orange Blossom", "Jasmine"],
      base: ["Light Oud", "Sandalwood", "Soft Musk"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 55,
    imageUrl: "zahr-al-lemon.png",
    imageAlt: "Zahr Al Lemon — pale gold bottle surrounded by lemon blossoms",
    category: "citrus",
    featured: true,
  },
  {
    name: "Ghamam",
    inspiration: "Storm clouds",
    slug: "ghamam",
    description:
      "The sky before a desert storm — electric, heavy, and alive. Ghamam opens with petrichor and sharp cardamom before settling into a brooding core of grey musk and oud. A scent that carries the tension and relief of rain on dry earth.",
    price: 19500,
    scentNotes: {
      top: ["Petrichor", "Cardamom", "Black Pepper"],
      heart: ["Grey Musk", "Oud", "Wet Stone"],
      base: ["Patchouli", "Vetiver", "Ambergris"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 47,
    imageUrl: "ghamam.png",
    imageAlt: "Ghamam — slate grey bottle against a stormy desert sky",
    category: "woody",
    featured: true,
  },
  {
    name: "Wardat Al Jabal",
    inspiration: "Mountain wildflowers",
    slug: "wardat-al-jabal",
    description:
      "High-altitude meadows where lavender and wild iris sway in cool mountain air. Wardat Al Jabal is a serene, aromatic floral rooted in vetiver and soft oud — delicate on the surface, quietly powerful beneath. A scent that breathes like open sky.",
    price: 19500,
    scentNotes: {
      top: ["Lavender", "Bergamot", "Green Herbs"],
      heart: ["Wild Iris", "Violet Leaf", "Rose Absolute"],
      base: ["Vetiver", "Cool Musk", "Light Oud"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 31,
    imageUrl: "wardat-al-jabal.png",
    imageAlt: "Wardat Al Jabal — lilac tinted bottle on a mossy mountain rock",
    category: "floral",
    featured: false,
  },
  {
    name: "Anbar Al Nil",
    inspiration: "Amber reeds by the Nile",
    slug: "anbar-al-nil",
    description:
      "Where ancient waters meet golden reeds at dusk. Anbar Al Nil evokes the timeless calm of the Nile — ambergris and water lily on the surface, with a deep, resonant core of oud and soft patchouli beneath. Rich in history, effortless in wear.",
    price: 19500,
    scentNotes: {
      top: ["Water Lily", "Fresh Reeds", "Light Citrus"],
      heart: ["Ambergris", "Oud", "Jasmine Sambac"],
      base: ["Soft Patchouli", "Sandalwood", "Warm Musk"],
    },
    sizes: [
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 19,
    imageUrl: "anbar-al-nil.png",
    imageAlt: "Anbar Al Nil — gold-toned bottle beside water reeds at sunset",
    category: "oriental",
    featured: true,
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing products
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
