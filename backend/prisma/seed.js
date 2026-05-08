/**
 * MerchFlow AI — Database Seed Script
 * 
 * Creates the initial ADMIN user and sample data for first-run setup.
 * Run with: npm run db:seed
 * 
 * On production: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars
 * before running, then delete or disable this script.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin User'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@merchflow.ai'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'
const BRAND_NAME = process.env.SEED_BRAND_NAME || 'MerchFlow Brand'

async function main() {
  console.log('🌱 Seeding database...\n')

  // ── Seller Account ──────────────────────────────────────────────────────────
  const sellerEmail = 'snehalrathod15234@gmail.com'
  const sellerPass = '12345678'
  const existingSeller = await prisma.user.findUnique({ where: { email: sellerEmail } })
  
  if (!existingSeller) {
    const hashedSeller = await bcrypt.hash(sellerPass, 12)
    await prisma.user.create({
      data: {
        name: 'Snehal Rathod',
        email: sellerEmail,
        password: hashedSeller,
        role: 'ADMIN',
        brandName: 'MerchFlow Seller',
        brandColor: '#C47B2B',
        brandEmail: sellerEmail,
      }
    })
    console.log(`✅ Seller created: ${sellerEmail}`)
  } else {
    console.log(`ℹ️  Seller already exists: ${sellerEmail}`)
  }

  // ── Buyer Account ───────────────────────────────────────────────────────────
  const buyerEmail = 'admin@merchflow.com'
  const buyerPass = 'Admin@123'
  const existingBuyer = await prisma.user.findUnique({ where: { email: buyerEmail } })
  
  if (!existingBuyer) {
    const hashedBuyer = await bcrypt.hash(buyerPass, 12)
    await prisma.user.create({
      data: {
        name: 'Buyer Admin',
        email: buyerEmail,
        password: hashedBuyer,
        role: 'VIEWER',
      }
    })
    console.log(`✅ Buyer created: ${buyerEmail}`)
  } else {
    console.log(`ℹ️  Buyer already exists: ${buyerEmail}`)
  }

  // ── Sample Category ────────────────────────────────────────────────────────
  const catCount = await prisma.category.count()
  if (catCount === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Tops', slug: 'tops' },
        { name: 'Bottoms', slug: 'bottoms' },
        { name: 'Outerwear', slug: 'outerwear' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Footwear', slug: 'footwear' },
      ]
    })
    console.log('✅ Default categories created')
  }

  console.log('\n🎉 Seed complete!')
  console.log(`\n📌 Seller Login:`)
  console.log(`   Email:    ${sellerEmail}`)
  console.log(`   Password: ${sellerPass}`)
  console.log(`\n📌 Buyer Login:`)
  console.log(`   Email:    ${buyerEmail}`)
  console.log(`   Password: ${buyerPass}\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
