// import 'dotenv/config';
// import { PrismaClient } from '@prisma/client';
// import { hash } from 'bcryptjs';
// import { Pool } from 'pg';
// // import { PrismaPg } from '@prisma/adapter-pg';

// const connectionString = process.env.DATABASE_URL;
// const pool = new Pool({ connectionString });
// // const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// async function main() {
//     console.log('Start seeding ...');

//     // 1. Create Users
//     const password = await hash('123456', 10);

//     const admin = await prisma.user.upsert({
//         where: { username: 'admin' },
//         update: {},
//         create: {
//             username: 'admin',
//             password,
//             role: 'ADMIN',
//         },
//     });

//     const sales1 = await prisma.user.upsert({
//         where: { username: 'rahul_sales' },
//         update: {},
//         create: {
//             username: 'rahul_sales',
//             password,
//             role: 'SALESMAN',
//         },
//     });

//     const sales2 = await prisma.user.upsert({
//         where: { username: 'vikram_sales' },
//         update: {},
//         create: {
//             username: 'vikram_sales',
//             password,
//             role: 'SALESMAN',
//         },
//     });

//     console.log('Created Users:', { admin, sales1, sales2 });

//     // 2. Create Products
//     const productsData = [
//         {
//             name: 'Royal Oak Luxury Sofa',
//             sku: 'SF-ROYAL-001',
//             basePrice: 45000,
//             imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
//         },
//         {
//             name: 'Teak Wood King Bed',
//             sku: 'BD-TEAK-002',
//             basePrice: 38500,
//             imageUrl: 'https://images.unsplash.com/photo-1505693416388-b0346efee53e?auto=format&fit=crop&w=800&q=80',
//         },
//         {
//             name: 'Marble Top Dining Table',
//             sku: 'DT-MARBLE-003',
//             basePrice: 62000,
//             imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
//         },
//         {
//             name: 'Ergonomic Office Chair',
//             sku: 'CH-ERGO-004',
//             basePrice: 12500,
//             imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e276?auto=format&fit=crop&w=800&q=80',
//         },
//         {
//             name: 'Modern Bedside Lamp',
//             sku: 'LA-MOD-005',
//             basePrice: 3500,
//             imageUrl: 'https://images.unsplash.com/photo-1507473888900-52e1adad54cd?auto=format&fit=crop&w=800&q=80',
//         },
//     ];

//     const products = [];
//     for (const p of productsData) {
//         const product = await prisma.product.upsert({
//             where: { sku: p.sku },
//             update: {},
//             create: p,
//         });
//         products.push(product);
//     }
//     console.log(`Created ${products.length} Products`);

//     // 3. Create Exhibitions
//     const expoMumbai = await prisma.exhibition.create({
//         data: {
//             name: 'Mumbai Interiorkraft 2026',
//             city: 'Mumbai',
//             startDate: new Date('2026-01-15'),
//             endDate: new Date('2026-01-20'),
//             status: 'LIVE',
//             description: 'The biggest furniture expo in Mumbai featuring luxury collections.',
//             imageUrl: 'https://images.unsplash.com/photo-1531973576160-7125cdcd63e7?auto=format&fit=crop&w=800&q=80',
//         },
//     });

//     const expoDelhi = await prisma.exhibition.create({
//         data: {
//             name: 'Delhi Home Decor Fair',
//             city: 'New Delhi',
//             startDate: new Date('2026-02-10'),
//             endDate: new Date('2026-02-15'),
//             status: 'PLANNING',
//             description: 'Upcoming exhibition for home decor enthusiasts.',
//             imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
//         },
//     });

//     const expoPune = await prisma.exhibition.create({
//         data: {
//             name: 'Pune Design Week',
//             city: 'Pune',
//             startDate: new Date('2025-12-01'),
//             endDate: new Date('2025-12-05'),
//             status: 'CLOSED',
//             description: 'Past event showing design trends.',
//             imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
//         },
//     });

//     console.log('Created Exhibitions:', [expoMumbai.name, expoDelhi.name, expoPune.name]);

//     // 4. Create Dummy Orders
//     await prisma.order.create({
//         data: {
//             exhibitionId: expoMumbai.id,
//             salesmanId: sales1.id,
//             customerName: 'Amit Sharma',
//             customerPhone: '9876543210',
//             customerAddress: 'Bandra West, Mumbai',
//             productSnapshotId: products[0].id,
//             productName: products[0].name,
//             productSku: products[0].sku,
//             productPrice: products[0].basePrice,
//             quantity: 1,
//             totalAmount: products[0].basePrice,
//             paymentRef: 'UPI-Transaction-001',
//         },
//     });

//     await prisma.order.create({
//         data: {
//             exhibitionId: expoMumbai.id,
//             salesmanId: sales1.id,
//             customerName: 'Kunal Singh',
//             customerPhone: '9988776655',
//             customerAddress: 'Andheri East, Mumbai',
//             productSnapshotId: products[3].id,
//             productName: products[3].name,
//             productSku: products[3].sku,
//             productPrice: products[3].basePrice,
//             quantity: 2,
//             totalAmount: products[3].basePrice * 2,
//             paymentRef: 'CASH',
//         },
//     });

//     await prisma.order.create({
//         data: {
//             exhibitionId: expoMumbai.id,
//             salesmanId: sales2.id,
//             customerName: 'Priya Desai',
//             customerPhone: '9123456789',
//             customerAddress: 'Juhu, Mumbai',
//             productSnapshotId: products[2].id,
//             productName: products[2].name,
//             productSku: products[2].sku,
//             productPrice: products[2].basePrice,
//             quantity: 1,
//             totalAmount: products[2].basePrice,
//             paymentRef: 'CARD-1234',
//         },
//     });

//     console.log('Seeding finished.');
// }

// main()
//     .then(async () => {
//         await prisma.$disconnect();
//     })
//     .catch(async (e) => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });
