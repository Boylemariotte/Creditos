const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('All Users:');
    users.forEach(u => {
        console.log(`- Name: ${u.name}, Email: ${u.email}, Username: ${u.username}, ID: ${u.id}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
