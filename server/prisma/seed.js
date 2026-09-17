const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// ============================================================
// Seed data for NABIL HMZ E-COMMERCE
// A general store: phone accessories, baby products, gifts,
// kids' toys, perfumes, school supplies, women's accessories,
// makeup, and electronics.
// ============================================================

const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
}

// The 58 wilayas of Algeria with sample delivery pricing (home-delivery, DA).
// Prices are illustrative — the admin can edit them from /admin/wilayas.
const WILAYAS = [
  ['01', 'Adrar', 900, 5], ['02', 'Chlef', 500, 3], ['03', 'Laghouat', 800, 4],
  ['04', 'Oum El Bouaghi', 550, 3], ['05', 'Batna', 550, 3], ['06', 'Béjaïa', 450, 2],
  ['07', 'Biskra', 650, 3], ['08', 'Béchar', 950, 5], ['09', 'Blida', 350, 2],
  ['10', 'Bouira', 400, 2], ['11', 'Tamanrasset', 1200, 7], ['12', 'Tébessa', 650, 3],
  ['13', 'Tlemcen', 600, 3], ['14', 'Tiaret', 550, 3], ['15', 'Tizi Ouzou', 400, 2],
  ['16', 'Alger', 300, 1], ['17', 'Djelfa', 650, 3], ['18', 'Jijel', 500, 3],
  ['19', 'Sétif', 500, 3], ['20', 'Saïda', 650, 3], ['21', 'Skikda', 500, 3],
  ['22', 'Sidi Bel Abbès', 600, 3], ['23', 'Annaba', 550, 3], ['24', 'Guelma', 550, 3],
  ['25', 'Constantine', 500, 3], ['26', 'Médéa', 400, 2], ['27', 'Mostaganem', 550, 3],
  ['28', "M'Sila", 600, 3], ['29', 'Mascara', 600, 3], ['30', 'Ouargla', 850, 4],
  ['31', 'Oran', 550, 3], ['32', 'El Bayadh', 800, 4], ['33', 'Illizi', 1300, 8],
  ['34', 'Bordj Bou Arréridj', 500, 3], ['35', 'Boumerdès', 350, 2], ['36', 'El Tarf', 600, 3],
  ['37', 'Tindouf', 1300, 8], ['38', 'Tissemsilt', 600, 3], ['39', 'El Oued', 800, 4],
  ['40', 'Khenchela', 650, 3], ['41', 'Souk Ahras', 600, 3], ['42', 'Tipaza', 350, 2],
  ['43', 'Mila', 550, 3], ['44', 'Aïn Defla', 450, 2], ['45', 'Naâma', 850, 4],
  ['46', 'Aïn Témouchent', 600, 3], ['47', 'Ghardaïa', 750, 4], ['48', 'Relizane', 550, 3],
  ['49', 'Timimoun', 1000, 6], ['50', 'Bordj Badji Mokhtar', 1300, 8], ['51', 'Ouled Djellal', 700, 4],
  ['52', "Béni Abbès", 1000, 6], ['53', 'In Salah', 1200, 7], ['54', 'In Guezzam', 1400, 9],
  ['55', 'Touggourt', 800, 4], ['56', 'Djanet', 1300, 8], ['57', "El M'Ghair", 800, 4],
  ['58', 'El Meniaa', 900, 5],
];

const CATEGORIES = [
  { name: 'Phone Accessories', description: 'Cases, chargers, cables, power banks and more for your smartphone.' },
  { name: 'Baby Products', description: 'مستلزمات الأطفال — feeding, care and comfort essentials for babies.' },
  { name: 'Gifts', description: 'Cadeaux — thoughtful gift ideas for every occasion.' },
  { name: "Kids' Toys", description: 'Jeux des enfants — toys and games for all ages.' },
  { name: 'Perfumes', description: 'Parfums — fragrances for men and women.' },
  { name: 'School Supplies', description: 'Les affaires scolaires — bags, stationery and school essentials.' },
  { name: "Women's Accessories", description: 'Jewelry, bags, scarves and everyday accessories.' },
  { name: 'Makeup', description: 'Maquillage — cosmetics and beauty products.' },
  { name: 'Electronics', description: 'الكترونيات — gadgets and electronic devices for home and everyday use.' },
];

const COLORS = [
  ['Black', '#000000'], ['White', '#FFFFFF'], ['Red', '#DC2626'],
  ['Blue', '#2563EB'], ['Green', '#16A34A'], ['Pink', '#EC4899'],
  ['Gold', '#D4AF37'], ['Silver', '#C0C0C0'], ['Purple', '#9333EA'],
  ['Transparent', '#E5E7EB'],
];

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Admin user ----
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nabilhmz.dz' },
    update: {},
    create: {
      name: 'Store Admin',
      email: 'admin@nabilhmz.dz',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created (admin@nabilhmz.dz / Admin@12345)');

  // A demo seller account so the "Staff & Activity" admin feature has
  // something to show right after seeding.
  const sellerPasswordHash = await bcrypt.hash('Seller@12345', 10);
  await prisma.user.upsert({
    where: { email: 'seller@nabilhmz.dz' },
    update: {},
    create: {
      name: 'Demo Seller',
      email: 'seller@nabilhmz.dz',
      passwordHash: sellerPasswordHash,
      role: 'SELLER',
    },
  });
  console.log('✅ Demo seller account created (seller@nabilhmz.dz / Seller@12345)');

  // ---- Colors ----
  const colorRecords = [];
  for (const [name, hexCode] of COLORS) {
    let color = await prisma.color.findFirst({ where: { name } });
    if (!color) {
      color = await prisma.color.create({ data: { name, hexCode } });
    }
    colorRecords.push(color);
  }
  console.log(`✅ ${colorRecords.length} colors created`);

  // ---- Categories ----
  const categoryRecords = [];
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat.name, slug, description: cat.description },
    });
    categoryRecords.push(category);
  }
  console.log(`✅ ${categoryRecords.length} categories created`);

  // ---- Wilayas ----
  for (const [code, name, deliveryPrice, estimatedDays] of WILAYAS) {
    await prisma.wilaya.upsert({
      where: { code },
      update: {},
      create: { code, name, deliveryPrice, estimatedDays },
    });
  }
  console.log(`✅ ${WILAYAS.length} wilayas created`);

  // ---- Delivery offices (one main office per major wilaya, for demo purposes) ----
  const majorWilayas = ['16', '31', '25', '09', '19', '06'];
  for (const code of majorWilayas) {
    const wilaya = await prisma.wilaya.findUnique({ where: { code } });
    const existingOffice = await prisma.deliveryOffice.findFirst({ where: { wilayaId: wilaya.id } });
    if (!existingOffice) {
      await prisma.deliveryOffice.create({
        data: {
          name: `${wilaya.name} Central Office`,
          address: `Main Street, ${wilaya.name}`,
          phone: '0555 00 00 00',
          wilayaId: wilaya.id,
        },
      });
      await prisma.deliveryOffice.create({
        data: {
          name: `${wilaya.name} West Office`,
          address: `West District, ${wilaya.name}`,
          phone: '0555 00 00 01',
          wilayaId: wilaya.id,
        },
      });
    }
  }
  console.log('✅ Delivery offices created for major wilayas');

  // ---- Sample products ----
  const byName = (n) => categoryRecords.find((c) => c.name === n);
  const products = [
    // ---- Phone Accessories ----
    {
      name: 'Silicone Shockproof Case - iPhone 15', category: byName('Phone Accessories'), price: 1800, promotionPrice: 1400,
      description: 'Slim-fit shockproof silicone case with raised edges to protect the camera and screen.',
      stock: 45, featured: true, colors: ['Black', 'Blue', 'Red', 'Transparent'],
    },
    {
      name: '20W USB-C Fast Wall Charger', category: byName('Phone Accessories'), price: 2200, promotionPrice: 1790,
      description: 'Compact 20W PD fast charger, compatible with iPhone and Android USB-C devices.',
      stock: 60, featured: true, colors: ['White', 'Black'],
    },
    {
      name: '10000mAh Slim Power Bank', category: byName('Phone Accessories'), price: 3800, promotionPrice: 2990,
      description: 'Pocket-sized 10000mAh battery pack with dual USB output and USB-C input.',
      stock: 25, featured: true, colors: ['Black', 'White'],
    },
    {
      name: 'Wireless Bluetooth Earbuds', category: byName('Phone Accessories'), price: 4200, promotionPrice: 3300,
      description: 'True wireless earbuds with charging case, touch controls, and up to 24h battery life.',
      stock: 40, featured: true, colors: ['Black', 'White'],
    },
    {
      name: 'Tempered Glass Screen Protector (2-Pack)', category: byName('Phone Accessories'), price: 600, promotionPrice: 450,
      description: '9H hardness tempered glass with anti-fingerprint coating, easy bubble-free install.',
      stock: 120, featured: false, colors: ['Transparent'],
    },
    {
      name: 'Magnetic Car Phone Holder', category: byName('Phone Accessories'), price: 1500, promotionPrice: 1190,
      description: 'Strong magnetic mount for air vents, holds any phone securely while driving.',
      stock: 50, featured: false, colors: ['Black'],
    },

    // ---- Baby Products ----
    {
      name: 'Baby Feeding Bottle Set (3-Pack)', category: byName('Baby Products'), price: 2400, promotionPrice: 1990,
      description: 'BPA-free anti-colic feeding bottles in three sizes, ideal for newborns and infants.',
      stock: 30, featured: true, colors: [],
    },
    {
      name: 'Soft Baby Swaddle Blanket', category: byName('Baby Products'), price: 1600, promotionPrice: null,
      description: 'Breathable cotton swaddle blanket to keep your baby warm and secure.',
      stock: 22, featured: false, colors: ['White', 'Pink', 'Blue'],
    },
    {
      name: 'Portable Baby Diaper Bag', category: byName('Baby Products'), price: 3200, promotionPrice: 2690,
      description: 'Spacious, easy-to-clean diaper bag with insulated bottle pockets and stroller straps.',
      stock: 15, featured: true, colors: ['Black', 'Grey'],
    },
    {
      name: 'Baby Bath Care Kit', category: byName('Baby Products'), price: 2000, promotionPrice: null,
      description: 'Gentle bath essentials set: shampoo, lotion, soft brush and towel.',
      stock: 0, featured: false, colors: [],
    },

    // ---- Gifts ----
    {
      name: 'Luxury Gift Box Set', category: byName('Gifts'), price: 3500, promotionPrice: 2890,
      description: 'Elegant gift box with candles, a mug and a small keepsake — ready to give.',
      stock: 18, featured: true, colors: [],
    },
    {
      name: 'Personalized Photo Frame', category: byName('Gifts'), price: 1400, promotionPrice: null,
      description: 'Wooden photo frame that can be engraved with a name or short message.',
      stock: 26, featured: false, colors: ['Black', 'Gold'],
    },
    {
      name: 'Scented Candle Gift Set (3-Pack)', category: byName('Gifts'), price: 2200, promotionPrice: 1790,
      description: 'Long-lasting scented candles in a reusable gift tin, perfect for any occasion.',
      stock: 32, featured: false, colors: [],
    },

    // ---- Kids' Toys ----
    {
      name: 'Building Blocks Set (200 Pieces)', category: byName("Kids' Toys"), price: 2800, promotionPrice: 2290,
      description: 'Colorful, safe building blocks that boost creativity and fine motor skills.',
      stock: 40, featured: true, colors: [],
    },
    {
      name: 'Remote Control Car', category: byName("Kids' Toys"), price: 3600, promotionPrice: null,
      description: 'Fast, durable RC car with rechargeable battery, great for indoor and outdoor play.',
      stock: 20, featured: true, colors: ['Red', 'Blue'],
    },
    {
      name: 'Plush Teddy Bear (40cm)', category: byName("Kids' Toys"), price: 1800, promotionPrice: 1450,
      description: 'Soft, huggable teddy bear made from child-safe materials.',
      stock: 35, featured: false, colors: ['Black', 'White', 'Pink'],
    },
    {
      name: 'Educational Puzzle Set', category: byName("Kids' Toys"), price: 1200, promotionPrice: null,
      description: 'Wooden puzzle set that helps develop problem-solving skills for young children.',
      stock: 5, featured: false, colors: [],
    },

    // ---- Perfumes ----
    {
      name: "Men's Eau de Parfum 100ml", category: byName('Perfumes'), price: 5200, promotionPrice: 4300,
      description: 'Long-lasting woody-spicy fragrance, elegantly bottled.',
      stock: 24, featured: true, colors: [],
    },
    {
      name: "Women's Eau de Parfum 100ml", category: byName('Perfumes'), price: 5400, promotionPrice: 4500,
      description: 'Floral-oriental fragrance with notes of jasmine and vanilla.',
      stock: 24, featured: true, colors: [],
    },
    {
      name: 'Travel Perfume Set (4 x 15ml)', category: byName('Perfumes'), price: 3200, promotionPrice: null,
      description: 'Compact travel-size fragrance set, perfect for on-the-go touch-ups.',
      stock: 18, featured: false, colors: [],
    },

    // ---- School Supplies ----
    {
      name: 'Kids School Backpack', category: byName('School Supplies'), price: 3200, promotionPrice: 2590,
      description: 'Ergonomic, water-resistant backpack with multiple compartments.',
      stock: 28, featured: true, colors: ['Black', 'Blue', 'Pink'],
    },
    {
      name: 'Stationery Set (Pens, Pencils & Notebook)', category: byName('School Supplies'), price: 900, promotionPrice: 690,
      description: 'Complete stationery bundle to start the school year right.',
      stock: 80, featured: false, colors: [],
    },
    {
      name: 'Geometry & Math Kit', category: byName('School Supplies'), price: 700, promotionPrice: null,
      description: 'Compass, ruler, protractor and set square in a durable case.',
      stock: 45, featured: false, colors: [],
    },

    // ---- Women's Accessories ----
    {
      name: 'Leather Handbag', category: byName("Women's Accessories"), price: 4800, promotionPrice: 3990,
      description: 'Genuine leather handbag with adjustable strap and secure zip closure.',
      stock: 14, featured: true, colors: ['Black', 'Red', 'Gold'],
    },
    {
      name: 'Elegant Silk Scarf', category: byName("Women's Accessories"), price: 1600, promotionPrice: null,
      description: 'Soft printed silk scarf, a versatile addition to any outfit.',
      stock: 20, featured: false, colors: ['Pink', 'Purple'],
    },
    {
      name: 'Fashion Jewelry Set', category: byName("Women's Accessories"), price: 2100, promotionPrice: 1690,
      description: 'Necklace and earring set with a modern, elegant finish.',
      stock: 0, featured: false, colors: ['Gold', 'Silver'],
    },

    // ---- Makeup ----
    {
      name: 'Matte Lipstick Set (3 Shades)', category: byName('Makeup'), price: 1800, promotionPrice: 1450,
      description: 'Long-wearing matte lipsticks in three everyday shades.',
      stock: 36, featured: true, colors: ['Red', 'Pink'],
    },
    {
      name: 'Foundation & Concealer Duo', category: byName('Makeup'), price: 2600, promotionPrice: null,
      description: 'Lightweight, buildable coverage foundation with a matching concealer.',
      stock: 22, featured: false, colors: [],
    },
    {
      name: 'Eyeshadow Palette (12 Colors)', category: byName('Makeup'), price: 2900, promotionPrice: 2390,
      description: 'Highly pigmented matte and shimmer shades for everyday and evening looks.',
      stock: 19, featured: true, colors: [],
    },

    // ---- Electronics ----
    {
      name: 'Smart Fitness Watch', category: byName('Electronics'), price: 8500, promotionPrice: 6990,
      description: 'Tracks heart rate, sleep, steps and workouts, with call and message notifications.',
      stock: 20, featured: true, colors: ['Black', 'Silver', 'Gold'],
    },
    {
      name: 'Bluetooth Speaker (Portable)', category: byName('Electronics'), price: 3900, promotionPrice: 3200,
      description: 'Compact waterproof speaker with rich bass and 12-hour battery life.',
      stock: 26, featured: true, colors: ['Black', 'Blue'],
    },
    {
      name: 'Digital Kitchen Scale', category: byName('Electronics'), price: 1900, promotionPrice: null,
      description: 'Precise digital scale for cooking and baking, up to 5kg capacity.',
      stock: 30, featured: false, colors: [],
    },
    {
      name: 'LED Desk Lamp with USB Charging', category: byName('Electronics'), price: 2400, promotionPrice: 1990,
      description: 'Adjustable brightness LED lamp with a built-in USB charging port.',
      stock: 8, featured: false, colors: ['Black', 'White'],
    },
  ];

  for (const p of products) {
    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const colorIds = colorRecords.filter((c) => p.colors.includes(c.name)).map((c) => ({ colorId: c.id }));

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        promotionPrice: p.promotionPrice,
        stock: p.stock,
        featured: p.featured,
        categoryId: p.category.id,
        colors: { create: colorIds },
        images: {
          create: [
            { imageUrl: '/uploads/products/placeholder.jpg', isMain: true },
          ],
        },
      },
    });
  }
  console.log(`✅ ${products.length} sample products created`);

  // ---- Store settings ----
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'NABIL HMZ E-COMMERCE',
      phone: '0555 12 34 56',
      email: 'contact@nabilhmz.dz',
      address: 'Algiers, Algeria',
      whatsapp: '0555 12 34 56',
      description: 'Phones, kids, gifts, perfumes, school, beauty and electronics — all in one store.',
    },
  });

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
