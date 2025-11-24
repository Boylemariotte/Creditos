const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('User Links:');
    users.forEach(u => {
        console.log(`- User: ${u.username} (${u.id}) -> Partner: ${u.partnerId}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
