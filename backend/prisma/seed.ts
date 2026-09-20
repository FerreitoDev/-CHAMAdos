import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/chamados?schema=public',
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
  console.log('🌱 Iniciando o seed de categorias padrão...');

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
