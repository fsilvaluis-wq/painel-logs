const path = require("path");
const envPath = path.resolve(process.cwd(), ".env");
require("dotenv").config({ path: envPath });

console.log("CWD:", process.cwd());
console.log("ENV PATH:", envPath);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

console.log("JWT_SECRET:", process.env.JWT_SECRET);
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../web/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../web/dist/index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API online" });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Middleware: validar token
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Sem token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Middleware: só admin
function adminOnly(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
}

// Middleware: admin, programador ou fundador
function superAdminOnly(req, res, next) {
  const roles = ["ADMIN", "PROGRAMADOR", "FUNDADOR"];
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Acesso negado - apenas Super Admins" });
  }
  next();
}

// Middleware: só fundador ou programador
function megaAdminOnly(req, res, next) {
  const roles = ["PROGRAMADOR", "FUNDADOR"];
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Acesso negado - apenas Fundador e Programador" });
  }
  next();
}

// Criar punição (ADMIN)
app.post("/punishments", auth, adminOnly, async (req, res) => {
  try {
    const { type, nickname, reason, duration, evidence } = req.body;

    const allowedTypes = ["PRISAO", "WARN", "MUTE", "BAN", "BAN_IP"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }
    if (!nickname || !reason) {
      return res.status(400).json({ error: "Nickname e motivo são obrigatórios" });
    }

    const punishment = await prisma.punishment.create({
      data: {
        type,
        nickname,
        reason,
        duration: duration ? Number(duration) : null,
        evidence: evidence || null,
        adminId: req.user.id,
      },
    });

    res.json(punishment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Listar punições (ADMIN e SUPPORT pode ver)
app.get("/punishments", auth, async (req, res) => {
  try {
    const items = await prisma.punishment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { admin: { select: { username: true } } },
    });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Criar solicitação (SUPPORT)
app.post("/requests", auth, async (req, res) => {
  try {
    if (req.user.role !== "SUPPORT") {
      return res.status(403).json({ error: "Apenas support pode criar solicitações" });
    }

    const { type, nickname, reason, duration, evidence } = req.body;

    if (!type || !nickname || !reason) {
      return res.status(400).json({ error: "Tipo, nickname e motivo são obrigatórios" });
    }

    const request = await prisma.request.create({
      data: {
        type,
        nickname,
        reason,
        duration: duration ? Number(duration) : null,
        evidence: evidence || null,
        status: "PENDENTE",
        supportId: req.user.id,
      },
    });

    res.json(request);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Listar solicitações
app.get("/requests", auth, async (req, res) => {
  try {
    const items = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        support: { select: { username: true } },
        admin: { select: { username: true } },
      },
    });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Revisar solicitação (ADMIN)
app.patch("/requests/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewReason } = req.body;

    if (!["APROVADO", "REJEITADO"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const request = await prisma.request.update({
      where: { id: Number(id) },
      data: {
        status,
        reviewReason: reviewReason || null,
        reviewedAt: new Date(),
        adminId: req.user.id,
      },
    });

    res.json(request);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Deletar solicitação (PROGRAMADOR e FUNDADOR)
app.delete("/requests/:id", auth, megaAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.request.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Solicitação deletada com sucesso" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao deletar solicitação" });
  }
});

// Deletar punição (PROGRAMADOR e FUNDADOR)
app.delete("/punishments/:id", auth, megaAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.punishment.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Punição deletada com sucesso" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao deletar punição" });
  }
});

// Listar usuários (superAdmin: ADMIN, PROGRAMADOR, FUNDADOR)
app.get("/users", auth, async (req, res) => {
  try {
    const superAdminRoles = ["ADMIN", "PROGRAMADOR", "FUNDADOR"];
    if (!superAdminRoles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// Criar usuário (apenas PROGRAMADOR e FUNDADOR)
app.post("/users", auth, megaAdminOnly, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: "Username, senha e cargo são obrigatórios" });
    }

    const allowedRoles = ["SUPPORT", "ADMIN", "PROGRAMADOR", "FUNDADOR"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Cargo inválido" });
    }

    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        role,
      },
    });

    res.json({ id: user.id, username: user.username, role: user.role, createdAt: user.createdAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Atualizar cargo do usuário (apenas PROGRAMADOR e FUNDADOR)
app.patch("/users/:id", auth, megaAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Cargo é obrigatório" });
    }

    const allowedRoles = ["SUPPORT", "ADMIN", "PROGRAMADOR", "FUNDADOR"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Cargo inválido" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao atualizar cargo" });
  }
});

// Deletar usuário (apenas PROGRAMADOR e FUNDADOR)
app.delete("/users/:id", auth, megaAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Impedir que um usuário delete a si mesmo
    if (req.user.id === Number(id)) {
      return res.status(400).json({ error: "Você não pode deletar sua própria conta" });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});