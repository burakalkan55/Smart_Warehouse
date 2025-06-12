import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const floors = [
    { prefix: 'A', floor: 0 },
    { prefix: 'B', floor: -7 },
    { prefix: 'C', floor: -14 },
  ]

  for (const { prefix, floor } of floors) {
    for (let i = 1; i <= 10; i++) {
      const name = `${prefix}${i}`
      await prisma.warehouse.upsert({
        where: { name },
        update: {},
        create: {
          name,
          floor,
          capacity: 100, // default kapasite
        },
      })
    }
  }

  console.log('🚀 Depolar başarıyla eklendi.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
