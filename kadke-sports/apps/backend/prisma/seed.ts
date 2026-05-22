/**
 * Kadke Sports — Seed Script
 * Realistic catalog: Cricket, Football, Jerseys, Shoes, Tracksuits, Fitness, Accessories, Custom
 */
import { PrismaClient, Role, CouponType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categories = [
  { name: 'Cricket', slug: 'cricket', imageUrl: '/categories/cricket.jpg' },
  { name: 'Football', slug: 'football', imageUrl: '/categories/football.jpg' },
  { name: 'Jerseys', slug: 'jerseys', imageUrl: '/categories/jerseys.jpg' },
  { name: 'Sports Shoes', slug: 'sports-shoes', imageUrl: '/categories/shoes.jpg' },
  { name: 'Tracksuits', slug: 'tracksuits', imageUrl: '/categories/tracksuits.jpg' },
  { name: 'Fitness', slug: 'fitness', imageUrl: '/categories/fitness.jpg' },
  { name: 'Accessories', slug: 'accessories', imageUrl: '/categories/accessories.jpg' },
  { name: 'Custom Jerseys', slug: 'custom-jerseys', imageUrl: '/categories/custom.jpg' },
];

const products = [
  // Cricket
  { cat: 'cricket', name: 'Kadke Pro English Willow Bat', brand: 'Kadke', price: 8499, discount: 15, sizes: ['SH', 'H'], colors: ['Natural'], featured: true, desc: 'Grade 1 English willow, hand-knocked, tournament ready. Sweet spot tuned for power hitters.' },
  { cat: 'cricket', name: 'Kadke Kashmir Willow Bat', brand: 'Kadke', price: 2999, discount: 10, sizes: ['SH'], colors: ['Natural'], desc: 'Premium Kashmir willow for club cricket. Balanced pickup.' },
  { cat: 'cricket', name: 'SG Test Match Cricket Ball', brand: 'SG', price: 899, discount: 0, sizes: ['Standard'], colors: ['Red'], desc: 'Hand-stitched 4-piece leather ball. Test-match quality seam.' },
  { cat: 'cricket', name: 'Kadke Wicket Keeping Gloves Pro', brand: 'Kadke', price: 3499, discount: 12, sizes: ['M', 'L'], colors: ['White/Blue'], desc: 'Inner-tackified palm, contoured wrist strap.' },
  { cat: 'cricket', name: 'Kadke Batting Pads Elite', brand: 'Kadke', price: 4299, discount: 20, sizes: ['Mens', 'Boys'], colors: ['White'], featured: true, desc: 'Triple bolster, HDF knee roll, traditional cane construction.' },

  // Football
  { cat: 'football', name: 'Kadke Strike Football Size 5', brand: 'Kadke', price: 1299, discount: 0, sizes: ['5'], colors: ['White/Black'], featured: true, desc: 'FIFA quality, 32-panel hand-stitched.' },
  { cat: 'football', name: 'Nivia Storm Football', brand: 'Nivia', price: 899, discount: 5, sizes: ['4', '5'], colors: ['Yellow'], desc: 'Match-grade rubber bladder for true bounce.' },
  { cat: 'football', name: 'Kadke Shinguards Carbon', brand: 'Kadke', price: 999, discount: 10, sizes: ['S', 'M', 'L'], colors: ['Black'], desc: 'Lightweight carbon shell, ankle protection.' },
  { cat: 'football', name: 'Kadke Goalkeeper Gloves', brand: 'Kadke', price: 1799, discount: 15, sizes: ['8', '9', '10'], colors: ['Neon Green'], desc: '4mm German latex palm, finger-save spines.' },

  // Jerseys
  { cat: 'jerseys', name: 'India Cricket Replica Jersey 2025', brand: 'Kadke', price: 1999, discount: 25, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Blue'], featured: true, desc: 'Sublimated print, moisture-wicking poly-mesh. Official replica fit.' },
  { cat: 'jerseys', name: 'Argentina Football Home Jersey', brand: 'Kadke', price: 2299, discount: 20, sizes: ['S', 'M', 'L', 'XL'], colors: ['Sky Blue/White'], featured: true, desc: 'Champions-edition replica with embroidered crest.' },
  { cat: 'jerseys', name: 'Manchester United Replica', brand: 'Kadke', price: 2199, discount: 15, sizes: ['S', 'M', 'L'], colors: ['Red'], desc: 'Premium polyester, breathable mesh side panels.' },
  { cat: 'jerseys', name: 'Mumbai Indians IPL Jersey', brand: 'Kadke', price: 1799, discount: 30, sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue/Gold'], desc: 'Lightweight, quick-dry. Player-edition fit.' },

  // Shoes
  { cat: 'sports-shoes', name: 'Kadke Sprint Pro Running Shoes', brand: 'Kadke', price: 3499, discount: 25, sizes: ['7', '8', '9', '10', '11'], colors: ['Black', 'White'], featured: true, desc: 'EVA midsole, knit upper, herringbone outsole.' },
  { cat: 'sports-shoes', name: 'Kadke Court Smash Tennis Shoes', brand: 'Kadke', price: 2999, discount: 15, sizes: ['7', '8', '9', '10'], colors: ['White/Red'], desc: 'Non-marking sole, reinforced toe-cap.' },
  { cat: 'sports-shoes', name: 'Asics Cricket Spike Shoes', brand: 'Asics', price: 5999, discount: 10, sizes: ['8', '9', '10', '11'], colors: ['White/Blue'], desc: 'Metal-spike outsole for grip on turf.' },
  { cat: 'sports-shoes', name: 'Kadke Trail Trek Hiking Shoes', brand: 'Kadke', price: 3299, discount: 18, sizes: ['7', '8', '9', '10', '11'], colors: ['Brown'], desc: 'Waterproof membrane, lugged outsole.' },

  // Tracksuits
  { cat: 'tracksuits', name: 'Kadke Performance Tracksuit', brand: 'Kadke', price: 2499, discount: 20, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black/Yellow', 'Navy'], featured: true, desc: 'Slim-fit, 4-way stretch polyester, zip pockets.' },
  { cat: 'tracksuits', name: 'Kadke Winter Training Suit', brand: 'Kadke', price: 3299, discount: 15, sizes: ['M', 'L', 'XL'], colors: ['Grey'], desc: 'Fleece-lined, water-resistant outer.' },
  { cat: 'tracksuits', name: 'Adidas Originals Tracksuit', brand: 'Adidas', price: 4499, discount: 10, sizes: ['S', 'M', 'L'], colors: ['Black'], desc: '3-stripes classic. Tapered fit.' },

  // Fitness
  { cat: 'fitness', name: 'Kadke Yoga Mat 8mm', brand: 'Kadke', price: 1199, discount: 25, sizes: ['Standard'], colors: ['Purple', 'Black', 'Blue'], featured: true, desc: 'TPE eco-mat, anti-slip, with carry strap.' },
  { cat: 'fitness', name: 'Adjustable Dumbbells 20kg Set', brand: 'Kadke', price: 5999, discount: 15, sizes: ['Standard'], colors: ['Black'], desc: 'Cast iron, screw collar, vinyl-coated.' },
  { cat: 'fitness', name: 'Resistance Bands Pro Set', brand: 'Kadke', price: 999, discount: 30, sizes: ['Set of 5'], colors: ['Mixed'], desc: '5 levels, with door anchor and handles.' },
  { cat: 'fitness', name: 'Skipping Rope Speed Pro', brand: 'Kadke', price: 499, discount: 0, sizes: ['Adjustable'], colors: ['Black'], desc: 'Steel cable, ball-bearing handles.' },
  { cat: 'fitness', name: 'Foam Roller High-Density', brand: 'Kadke', price: 799, discount: 20, sizes: ['45cm'], colors: ['Blue'], desc: 'EVA foam, deep-tissue massage.' },

  // Accessories
  { cat: 'accessories', name: 'Kadke Gym Bag 40L', brand: 'Kadke', price: 1499, discount: 25, sizes: ['40L'], colors: ['Black', 'Grey'], desc: 'Water-resistant 600D polyester, shoe compartment.' },
  { cat: 'accessories', name: 'Sports Water Bottle 750ml', brand: 'Kadke', price: 399, discount: 10, sizes: ['750ml'], colors: ['Black', 'Blue'], desc: 'BPA-free, leak-proof, easy-grip.' },
  { cat: 'accessories', name: 'Sweat Wrist Bands Pair', brand: 'Kadke', price: 199, discount: 0, sizes: ['Standard'], colors: ['White', 'Black'], desc: 'Cotton-terry, embroidered logo.' },
  { cat: 'accessories', name: 'Kadke Sports Cap Pro', brand: 'Kadke', price: 599, discount: 20, sizes: ['Free'], colors: ['Navy', 'Black', 'White'], desc: 'Adjustable strap, moisture-wicking sweatband.' },
  { cat: 'accessories', name: 'Compression Sleeves Pair', brand: 'Kadke', price: 699, discount: 15, sizes: ['M', 'L'], colors: ['Black', 'White'], desc: 'Graduated compression, breathable nylon.' },

  // Custom Jerseys
  { cat: 'custom-jerseys', name: 'Custom Cricket Team Jersey', brand: 'Kadke', price: 1499, discount: 10, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Custom'], featured: true, desc: 'Add your name, number, logo and team colors. Min order 11.' },
  { cat: 'custom-jerseys', name: 'Custom Football Team Kit', brand: 'Kadke', price: 1799, discount: 10, sizes: ['S', 'M', 'L', 'XL'], colors: ['Custom'], desc: 'Jersey + shorts + socks. Full kit customization.' },
];

const sportsImages: Record<string, string[]> = {
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
  ],
  football: [
    'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800',
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800',
  ],
  jerseys: [
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],
  'sports-shoes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  ],
  tracksuits: [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  ],
  'custom-jerseys': [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],
};

async function main() {
  console.log('🌱 Seeding Kadke Sports database...');

  // Categories
  console.log('📁 Creating categories...');
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap.set(c.slug, cat.id);
  }

  // Products
  console.log('📦 Creating products...');
  let i = 0;
  for (const p of products) {
    i++;
    const productSlug = slug(p.name) + '-' + i;
    await prisma.product.upsert({
      where: { slug: productSlug },
      update: {},
      create: {
        name: p.name,
        slug: productSlug,
        description: p.desc,
        shortDesc: p.desc.slice(0, 120),
        brand: p.brand,
        sku: `KS-${String(i).padStart(5, '0')}`,
        categoryId: catMap.get(p.cat)!,
        price: p.price,
        discount: p.discount,
        images: sportsImages[p.cat] || [],
        sizes: p.sizes,
        colors: p.colors,
        tags: [p.cat, p.brand.toLowerCase()],
        featured: p.featured ?? false,
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 200),
        inventory: { create: { stock: 50 + Math.floor(Math.random() * 200) } },
      },
    });
  }

  // Users
  console.log('👥 Creating users...');
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const userPass = await bcrypt.hash('User@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@kadkesports.com' },
    update: {},
    create: {
      email: 'admin@kadkesports.com',
      name: 'Admin Kadke',
      password: adminPass,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@kadkesports.com' },
    update: {},
    create: {
      email: 'user@kadkesports.com',
      name: 'Demo User',
      password: userPass,
      role: Role.USER,
      emailVerified: true,
    },
  });

  // Coupons
  console.log('🎟  Creating coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', type: CouponType.PERCENT, value: 10, minOrder: 999, maxDiscount: 500 },
  });
  await prisma.coupon.upsert({
    where: { code: 'KADKE500' },
    update: {},
    create: { code: 'KADKE500', type: CouponType.FLAT, value: 500, minOrder: 2999 },
  });

  console.log('✅ Seed complete!');
  console.log('   Admin → admin@kadkesports.com / Admin@123');
  console.log('   User  → user@kadkesports.com  / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
