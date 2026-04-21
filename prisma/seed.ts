import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const products = [
  {
    name: "Noir Absolu",
    slug: "noir-absolu",
    description:
      "A hypnotic journey into darkness. Noir Absolu opens with a burst of black pepper and smoked leather before revealing a profound heart of dark woods and midnight iris. The base lingers endlessly—dense vetiver, incense smoke, and a whisper of black musk that clings to skin like a secret.",
    price: 19500,
    scentNotes: {
      top: ["Black Pepper", "Bergamot", "Smoked Leather"],
      heart: ["Dark Woods", "Midnight Iris", "Cardamom"],
      base: ["Vetiver", "Incense", "Black Musk", "Ambergris"],
    },
    sizes: [
      { ml: 30, price: 13500 },
      { ml: 50, price: 19500 },
      { ml: 100, price: 32000 },
    ],
    stock: 47,
    imageUrl:
      "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80",
    imageAlt: "Noir Absolu — dark glass bottle on black marble",
    category: "woody",
    featured: true,
  },
  {
    name: "Velvet Oud",
    slug: "velvet-oud",
    description:
      "Steeped in the ancient traditions of the Arab world, Velvet Oud captures the rawest, most intoxicating facets of agarwood. Saffron and rose absolute intertwine with a massive oud heart that is both medicinal and beautiful. Sandalwood and vanilla smooth the edges into something timelessly luxurious.",
    price: 24500,
    scentNotes: {
      top: ["Saffron", "Elemi", "Pink Pepper"],
      heart: ["Oud Wood", "Rose Absolute", "Patchouli"],
      base: ["Sandalwood", "Vanilla Absolute", "Labdanum", "Musk"],
    },
    sizes: [
      { ml: 30, price: 17000 },
      { ml: 50, price: 24500 },
      { ml: 100, price: 40000 },
    ],
    stock: 31,
    imageUrl:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    imageAlt: "Velvet Oud — ornate gold-capped bottle",
    category: "oriental",
    featured: true,
  },
  {
    name: "Soleil de Rose",
    slug: "soleil-de-rose",
    description:
      "Dawn breaking over a field of Grasse roses, dew still clinging to petals. Soleil de Rose is a masterclass in floral composition—lychee and mandarin lift the opening with luminous sweetness before surrendering to the most opulent Bulgarian rose heart. White musks and cedarwood anchor the ethereal drydown.",
    price: 17500,
    scentNotes: {
      top: ["Lychee", "Mandarin", "Green Leaves"],
      heart: ["Bulgarian Rose", "Peony", "Jasmine Sambac"],
      base: ["White Musk", "Cedarwood", "Ambrette"],
    },
    sizes: [
      { ml: 30, price: 12000 },
      { ml: 50, price: 17500 },
      { ml: 100, price: 29000 },
    ],
    stock: 62,
    imageUrl:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
    imageAlt: "Soleil de Rose — rose-tinted glass bottle with gold cap",
    category: "floral",
    featured: true,
  },
  {
    name: "Ambre Nocturne",
    slug: "ambre-nocturne",
    description:
      "A nocturnal amber unlike any other. Where lesser fragrances settle for sweetness, Ambre Nocturne cultivates complexity—raw benzoin and cistus collide with smoldering resins before a bed of tonka bean and aged cognac draws you into its amber embrace. Deeply sensual, unapologetically bold.",
    price: 22000,
    scentNotes: {
      top: ["Cognac", "Plum", "Clove Bud"],
      heart: ["Labdanum", "Cistus", "Benzoin Resin"],
      base: ["Tonka Bean", "Amber", "Oud", "Vanilla"],
    },
    sizes: [
      { ml: 30, price: 15500 },
      { ml: 50, price: 22000 },
      { ml: 100, price: 36000 },
    ],
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
    imageAlt: "Ambre Nocturne — amber-colored bottle on dark surface",
    category: "oriental",
    featured: false,
  },
  {
    name: "Forêt Verte",
    slug: "foret-verte",
    description:
      "Step into an ancient forest at first light. Forêt Verte translates the sublime experience of old-growth woods into wearable form—crushed pine needles, wet earth, and cold birch bark open with arresting freshness. A mossy vetiver heart evolves into a clean, lingering cedar and musk signature.",
    price: 15500,
    scentNotes: {
      top: ["Pine Needle", "Wet Earth", "Birch Bark"],
      heart: ["Oakmoss", "Vetiver", "Violet Leaf"],
      base: ["Atlas Cedar", "Iso E Super", "Clean Musk"],
    },
    sizes: [
      { ml: 30, price: 10500 },
      { ml: 50, price: 15500 },
      { ml: 100, price: 25500 },
    ],
    stock: 55,
    imageUrl:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
    imageAlt: "Forêt Verte — green-tinted bottle with matte finish",
    category: "fresh",
    featured: false,
  },
  {
    name: "Musc Sacré",
    slug: "musc-sacre",
    description:
      "Sacred musk elevated to a devotional experience. The opening is deceptively simple—warm skin, a breath of aldehydes—before a revelatory heart of orris butter and heliotrope unfolds. The base is the revelation: a layered musk accord of staggering depth, powdery yet carnal, refined yet addictive.",
    price: 18500,
    scentNotes: {
      top: ["Aldehydes", "Bergamot", "Warm Skin"],
      heart: ["Orris Butter", "Heliotrope", "Rose Wood"],
      base: ["White Musk", "Civet Accord", "Sandalwood", "Powder"],
    },
    sizes: [
      { ml: 30, price: 12500 },
      { ml: 50, price: 18500 },
      { ml: 100, price: 30500 },
    ],
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
    imageAlt: "Musc Sacré — cream and gold minimal bottle",
    category: "gourmand",
    featured: false,
  },
  {
    name: "Cendre d'Or",
    slug: "cendre-dor",
    description:
      "Golden embers fading into the night. Cendre d'Or is the most contemplative fragrance in the collection—smoky and precious, built around an extraordinary guaiac wood and frankincense heart. Gold-dusted iris and immortelle lend an almost metallic, honey-like warmth that glows from the skin for hours.",
    price: 26500,
    scentNotes: {
      top: ["Frankincense", "Smoked Birch", "Saffron"],
      heart: ["Guaiac Wood", "Iris Absolute", "Immortelle"],
      base: ["Agarwood", "Honey Accord", "Golden Amber", "Musk"],
    },
    sizes: [
      { ml: 30, price: 18500 },
      { ml: 50, price: 26500 },
      { ml: 100, price: 44000 },
    ],
    stock: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
    imageAlt: "Cendre d'Or — smoked gold bottle with textured surface",
    category: "woody",
    featured: true,
  },
  {
    name: "Eau de Minuit",
    slug: "eau-de-minuit",
    description:
      "Midnight rendered as fragrance. Eau de Minuit opens with the electric clarity of yuzu and cold sea spray before a surprising heart of black tea absolute and rain-soaked violet adds intrigue. The base is clean but haunting—driftwood, grey musk, and the faintest breath of smoked mineral.",
    price: 16500,
    scentNotes: {
      top: ["Yuzu", "Sea Spray", "Aldehydes"],
      heart: ["Black Tea", "Rain Violet", "Aquatic Accord"],
      base: ["Driftwood", "Grey Musk", "Smoked Mineral", "Ambergris"],
    },
    sizes: [
      { ml: 30, price: 11500 },
      { ml: 50, price: 16500 },
      { ml: 100, price: 27000 },
    ],
    stock: 73,
    imageUrl:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
    imageAlt: "Eau de Minuit — dark blue midnight bottle",
    category: "fresh",
    featured: false,
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
