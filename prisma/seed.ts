import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed Categories
  const categoryStructural = await prisma.category.upsert({
    where: { name: 'Struktural' },
    update: {},
    create: {
      name: 'Struktural',
      description: 'Komponen struktur bangunan',
      displayOrder: 1,
    },
  });

  const categoryArchitectural = await prisma.category.upsert({
    where: { name: 'Arsitektural' },
    update: {},
    create: {
      name: 'Arsitektural',
      description: 'Komponen arsitektur bangunan',
      displayOrder: 2,
    },
  });

  const categoryUtility = await prisma.category.upsert({
    where: { name: 'Utilitas' },
    update: {},
    create: {
      name: 'Utilitas',
      description: 'Komponen utilitas bangunan',
      displayOrder: 3,
    },
  });

  console.log('Categories created:', {
    structural: categoryStructural.id,
    architectural: categoryArchitectural.id,
    utility: categoryUtility.id,
  });

  // 2. Seed Subcategories for Struktural
  const subcatKolom = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryStructural.id,
        name: 'Kolom'
      }
    },
    update: {},
    create: {
      name: 'Kolom',
      description: 'Kolom struktur',
      categoryId: categoryStructural.id,
      displayOrder: 1,
    },
  });

  const subcatBalok = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryStructural.id,
        name: 'Balok'
      }
    },
    update: {},
    create: {
      name: 'Balok',
      description: 'Balok struktur',
      categoryId: categoryStructural.id,
      displayOrder: 2,
    },
  });

  const subcatPelat = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryStructural.id,
        name: 'Pelat'
      }
    },
    update: {},
    create: {
      name: 'Pelat',
      description: 'Pelat lantai',
      categoryId: categoryStructural.id,
      displayOrder: 3,
    },
  });

  const subcatFundasi = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryStructural.id,
        name: 'Fundasi'
      }
    },
    update: {},
    create: {
      name: 'Fundasi',
      description: 'Fundasi bangunan',
      categoryId: categoryStructural.id,
      displayOrder: 4,
    },
  });

  // 3. Seed Subcategories for Arsitektural
  const subcatDinding = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryArchitectural.id,
        name: 'Dinding'
      }
    },
    update: {},
    create: {
      name: 'Dinding',
      description: 'Dinding bangunan',
      categoryId: categoryArchitectural.id,
      displayOrder: 1,
    },
  });

  const subcatPintuJendela = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryArchitectural.id,
        name: 'Pintu & Jendela'
      }
    },
    update: {},
    create: {
      name: 'Pintu & Jendela',
      description: 'Pintu dan jendela',
      categoryId: categoryArchitectural.id,
      displayOrder: 2,
    },
  });

  const subcatAtap = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryArchitectural.id,
        name: 'Atap'
      }
    },
    update: {},
    create: {
      name: 'Atap',
      description: 'Atap dan rangka atap',
      categoryId: categoryArchitectural.id,
      displayOrder: 3,
    },
  });

  const subcatLangit = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryArchitectural.id,
        name: 'Langit-langit'
      }
    },
    update: {},
    create: {
      name: 'Langit-langit',
      description: 'Plafon dan langit-langit',
      categoryId: categoryArchitectural.id,
      displayOrder: 4,
    },
  });

  const subcatLantai = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryArchitectural.id,
        name: 'Lantai'
      }
    },
    update: {},
    create: {
      name: 'Lantai',
      description: 'Penutup lantai',
      categoryId: categoryArchitectural.id,
      displayOrder: 5,
    },
  });

  // 4. Seed Subcategories for Utilitas
  const subcatSanitasi = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryUtility.id,
        name: 'Sanitasi'
      }
    },
    update: {},
    create: {
      name: 'Sanitasi',
      description: 'Sistem sanitasi',
      categoryId: categoryUtility.id,
      displayOrder: 1,
    },
  });

  const subcatListrik = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryUtility.id,
        name: 'Listrik'
      }
    },
    update: {},
    create: {
      name: 'Listrik',
      description: 'Instalasi listrik',
      categoryId: categoryUtility.id,
      displayOrder: 2,
    },
  });

  const subcatAirBersih = await prisma.subcategory.upsert({
    where: {
      categoryId_name: {
        categoryId: categoryUtility.id,
        name: 'Air Bersih'
      }
    },
    update: {},
    create: {
      name: 'Air Bersih',
      description: 'Sistem air bersih',
      categoryId: categoryUtility.id,
      displayOrder: 3,
    },
  });

  console.log('Subcategories created successfully!');
  console.log('Struktural:', {
    kolom: subcatKolom.id,
    balok: subcatBalok.id,
    pelat: subcatPelat.id,
    fundasi: subcatFundasi.id,
  });
  console.log('Arsitektural:', {
    dinding: subcatDinding.id,
    pintuJendela: subcatPintuJendela.id,
    atap: subcatAtap.id,
    langit: subcatLangit.id,
    lantai: subcatLantai.id,
  });
  console.log('Utilitas:', {
    sanitasi: subcatSanitasi.id,
    listrik: subcatListrik.id,
    airBersih: subcatAirBersih.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
