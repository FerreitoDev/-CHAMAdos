import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://chamados:chamados@localhost:5432/chamados?schema=public',
});

const prisma = new PrismaClient({ adapter });

const initialCategories = [
  {
    name: 'Hardware',
    description:
      'Problemas com componentes físicos, computadores, monitores',
  },
  {
    name: 'Software',
    description: 'Instalação, falhas em programas e licenças',
  },
  {
    name: 'Rede e Conectividade',
    description: 'Problemas de internet, Wi-Fi, VPN',
  },
  {
    name: 'Controle de Acesso',
    description: 'Senhas, permissões e contas de usuários',
  },
  {
    name: 'E-mail e Comunicação',
    description:
      'Falhas no envio/recebimento de e-mails, Teams/Slack',
  },
  {
    name: 'Impressoras e Periféricos',
    description: 'Impressoras, scanners, mouses, teclados',
  },
  {
    name: 'Outros',
    description: 'Solicitações e dúvidas gerais',
  },
];

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // 1. Seed de Categorias
  for (const cat of initialCategories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
      },
      create: {
        name: cat.name,
        description: cat.description,
        active: true,
      },
    });
    console.log(`✅ Categoria: ${category.name}`);
  }

  // 2. Seed de Usuários Padrão para Testes
  const defaultPassword = 'AdminPassword123!';
  const hashedPassword = await argon2.hash(defaultPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chamados.local' },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
    create: {
      name: 'Administrador de Teste',
      email: 'admin@chamados.local',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  });
  console.log(`✅ Usuário ADMIN: ${adminUser.email}`);

  const techUser = await prisma.user.upsert({
    where: { email: 'tecnico@chamados.local' },
    update: {
      passwordHash: await argon2.hash('TecnicoPassword123!'),
      role: 'TECHNICIAN',
      active: true,
    },
    create: {
      name: 'Técnico de Teste',
      email: 'tecnico@chamados.local',
      passwordHash: await argon2.hash('TecnicoPassword123!'),
      role: 'TECHNICIAN',
      active: true,
    },
  });
  console.log(`✅ Usuário TECHNICIAN: ${techUser.email}`);

  const normalUser = await prisma.user.upsert({
    where: { email: 'usuario@chamados.local' },
    update: {
      passwordHash: await argon2.hash('UsuarioPassword123!'),
      role: 'USER',
      active: true,
    },
    create: {
      name: 'Usuário de Teste',
      email: 'usuario@chamados.local',
      passwordHash: await argon2.hash('UsuarioPassword123!'),
      role: 'USER',
      active: true,
    },
  });
  console.log(`✅ Usuário USER: ${normalUser.email}`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
