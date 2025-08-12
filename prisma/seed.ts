import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const username = 'erkan.olus';
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Eğer kullanıcı zaten varsa tekrar ekleme
  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Kullanıcı oluşturuldu:', username);
  } else {
    console.log('Kullanıcı zaten var:', username);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 