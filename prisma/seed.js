const {
  PrismaClient,
  ROLE,
  GENDER,
} = require("../app/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const connectionString = `${process.env.DATABASE_URL}`;
if (!connectionString)
  throw new Error("DATABASE_URL environment variable is not set.");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const USER_COUNT = 5;
const ADMIN_COUNT = 2;
const CATEGORY_COUNT = 5;
const PRODUCT_COUNT = 20;
const DEFAULT_PASSWORD = "11111111";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createRandomPrice() {
  return faker.commerce.price({ min: 10, max: 200, precision: 0.01 });
}

// --- Data Definitions ---

const SIZES_DATA = [
  { name: "Extra Small", code: "XS", description: "Fits petite frames." },
  { name: "Small", code: "S", description: "Standard small fit." },
  { name: "Medium", code: "M", description: "Standard medium fit." },
  { name: "Large", code: "L", description: "Standard large fit." },
  { name: "Extra Large", code: "XL", description: "For larger frames." },
];

const COLOURS_DATA = [
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Green", code: "#008000" },
];

async function main() {
  console.log("✨ Start seeding...");

  await prisma.$transaction([
    prisma.productInCart.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.media.deleteMany(),
    prisma.colour.deleteMany(),
    prisma.size.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log("🧹 Cleaned up existing data.");

  const usersToCreate = [];
  for (let i = 0; i < ADMIN_COUNT; i++) {
    usersToCreate.push({
      email: `admin${i + 1}@example.com`,
      role: ROLE.ADMIN,
      isBasicUser: false,
    });
  }
  const basicUserCount = USER_COUNT - ADMIN_COUNT;
  for (let i = 0; i < basicUserCount; i++) {
    usersToCreate.push({
      email: `user${i + 1}@example.com`,
      role: ROLE.USER,
      isBasicUser: true,
    });
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const createdUsers = [];

  for (const userData of usersToCreate) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        role: userData.role,
        password: hashedPassword,
      },
    });
    createdUsers.push(user);
    if (userData.isBasicUser) {
      await prisma.cart.create({ data: { userId: user.id } });
    }
  }
  console.log(
    `👤 Created ${createdUsers.length} users (and ${basicUserCount} carts).`
  );

  const categoryNames = [
    "Shirts",
    "Pants",
    "Shoes",
    "Accessories",
    "Outerwear",
  ];
  const categories = [];

  for (const [index, name] of categoryNames
    .slice(0, CATEGORY_COUNT)
    .entries()) {
    const category = await prisma.category.create({
      data: { name: name, slug: slugify(name), published: index !== 4 },
    });
    categories.push(category);
  }
  console.log(`🏷️ Created ${categories.length} categories.`);

  // 4. Create independent Sizes and Colours (Look-up tables)
  await prisma.size.createMany({ data: SIZES_DATA });
  const createdSizes = await prisma.size.findMany();
  console.log(`📏 Created ${createdSizes.length} sizes.`);

  await prisma.colour.createMany({ data: COLOURS_DATA });
  const createdColours = await prisma.colour.findMany();
  console.log(`🌈 Created ${createdColours.length} colours.`);

  // 5. Create Products
  const genders = [GENDER.MALE, GENDER.FEMALE, GENDER.UNISEX];
  const createdProducts = [];

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const productName = faker.commerce.productName();
    const randomCategory = faker.helpers.arrayElement(categories);
    const randomGender = faker.helpers.arrayElement(genders);

    const product = await prisma.product.create({
      data: {
        name: productName,
        slug:
          slugify(productName) +
          "-" +
          faker.string.hexadecimal({ length: 4, prefix: "" }),
        description: faker.commerce.productDescription(),
        gender: randomGender,
        price: createRandomPrice(),
        categoryId: randomCategory.id,
        published: i % 10 !== 0,
      },
    });
    createdProducts.push(product);
  }
  console.log(`🛍️ Created ${createdProducts.length} base products.`);

  // 6. Create Variants for ALL Products (This is where inventory is generated)
  const createdVariants = [];
  const baseStock = 50;

  for (const product of createdProducts) {
    // Randomly select 2-3 colors and 3-4 sizes for this specific product
    const applicableColours = faker.helpers.arrayElements(createdColours, {
      min: 2,
      max: 3,
    });
    const applicableSizes = faker.helpers.arrayElements(createdSizes, {
      min: 3,
      max: 4,
    });

    for (const colour of applicableColours) {
      for (const size of applicableSizes) {
        // Create a unique Variant for every combination
        const variant = await prisma.variant.create({
          data: {
            productId: product.id,
            colourId: colour.id,
            sizeId: size.id,
            stock: faker.number.int({ min: 10, max: baseStock }), // Random stock
            priceModifier: faker.number.int({ min: -5, max: 10 }), // Random price modifier
          },
        });
        createdVariants.push(variant);
      }
    }
  }
  console.log(
    `📦 Created ${createdVariants.length} product variants (inventory items).`
  );

  // 7. Add Products (Variants) to Carts
  const basicUsers = createdUsers.filter((u) => u.role === ROLE.USER);
  const userCarts = await prisma.cart.findMany({
    where: { userId: { in: basicUsers.map((u) => u.id) } },
  });

  for (const cart of userCarts) {
    // Select 2-3 random variants from the total pool to add to the cart
    const variantsToAdd = faker.helpers.arrayElements(createdVariants, {
      min: 2,
      max: 3,
    });

    for (const variant of variantsToAdd) {
      await prisma.productInCart.create({
        data: {
          cartId: cart.id,
          variantId: variant.id, // <-- NEW: Linking to Variant ID
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      });
    }
  }
  console.log("🛒 Added variants to user carts.");
  console.log("✅ Seeding finished successfully!");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
