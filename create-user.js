const bcrypt = require("bcrypt");
const prisma = require("./src/prisma");

async function main() {
  const username = "Tadokiari";
  const password = "84527233";
  const role = "FUNDADOR";

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    console.log("❌ Usuário já existe!");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hash, role },
  });

  console.log("✅ Usuário criado com sucesso!");
  console.log(`👤 Username: ${username}`);
  console.log(`🔒 Senha: ${password}`);
  console.log(`🔑 Cargo: ${role}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
