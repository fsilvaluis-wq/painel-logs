const bcrypt = require("bcrypt");
const prisma = require("./prisma");

async function main() {
  console.log("🔒 Banco de dados inicializado.");
  console.log("");
  console.log("⚠️ ATENÇÃO: Nenhum usuário de teste foi criado!");
  console.log("📝 Crie usuários através do painel através do cargo FUNDADOR ou PROGRAMADOR.");
  console.log("");
  console.log("💡 Para inicializar com um primeiro usuário FUNDADOR, descomente a seção abaixo:");
  console.log("");
  console.log("/*");
  console.log("  const fundadorExists = await prisma.user.findUnique({ where: { username: 'fundador' } });");
  console.log("  if (!fundadorExists) {");
  console.log("    const hash = await bcrypt.hash('fundador123', 10);");
  console.log("    await prisma.user.create({");
  console.log("      data: { username: 'fundador', password: hash, role: 'FUNDADOR' },");
  console.log("    });");
  console.log("    console.log('✅ Fundador criado: fundador / fundador123');");
  console.log("  }");
  console.log("*/");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });