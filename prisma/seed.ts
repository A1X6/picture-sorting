import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  {
    id: "arabic-proverbs",
    name: "Arabic Proverbs",
    color: "#10b981", // Emerald-500
  },
  {
    id: "artworks-done-especially-for-my-kids",
    name: "Artworks Done Especially For My Kids",
    color: "#ef4444", // Red-500
  },
  {
    id: "combination-design-and-colour",
    name: "Combination Design and Colour",
    color: "#8b5cf6", // Violet-500
  },
  {
    id: "english-proverbs",
    name: "English Proverbs",
    color: "#3b82f6", // Blue-500
  },
  {
    id: "khaldoon-unique-freehand-writing",
    name: "Khaldoon Unique Freehand Writing",
    color: "#f97316", // Orange-500
  },
  {
    id: "modern-painting",
    name: "Modern Painting",
    color: "#06b6d4", // Cyan-500
  },
  {
    id: "personal-names",
    name: "Personal Names",
    color: "#ec4899", // Pink-500
  },
  {
    id: "sign-label",
    name: "Sign Label",
    color: "#eab308", // Yellow-500
  },
  {
    id: "still-life",
    name: "Still Life",
    color: "#84cc16", // Lime-500
  },
  {
    id: "t-shirt",
    name: "T Shirt",
    color: "#a855f7", // Purple-500
  },
  {
    id: "ultra-modern-aya",
    name: "Ultra Modern Aya",
    color: "#6366f1", // Indigo-500
  },
  {
    id: "ultra-modern-duaa",
    name: "Ultra Modern Duaa",
    color: "#14b8a6", // Teal-500
  },
  {
    id: "ultra-modern-hadith",
    name: "Ultra Modern Hadith",
    color: "#22c55e", // Green-500
  },
  {
    id: "ultra-modern-style",
    name: "Ultra Modern Style",
    color: "#f59e0b", // Amber-500
  },
  {
    id: "with-oriental-taste",
    name: "With Oriental Taste",
    color: "#f43f5e", // Rose-500
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.picture.deleteMany();
  await prisma.category.deleteMany();

  console.log('🧹 Cleared existing data');

  // Seed categories
  await prisma.category.createMany({
    data: defaultCategories,
  });

  console.log(`✅ Created ${defaultCategories.length} categories`);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 