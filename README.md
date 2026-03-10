# 🛡️ ATLAS ROLEPLAY - Painel Administrativo

Painel administrativo completo para gerenciamento do servidor de Roleplay Atlas.

## 📋 Funcionalidades

### Para Administradores (ADMIN)
- 📊 **Dashboard** - Visão geral do painel
- ⚡ **Aplicar Punições** - Prisão, Warn, Ban, Ban IP
  - Registro completo de punições aplicadas
  - Histórico com informações do admin que aplicou
- 📋 **Revisar Solicitações** - Aprovar ou rejeitar solicitações do suporte
  - Status em tempo real (Pendente, Aprovado, Rejeitado)
  - Adicionar motivo de rejeição

### Para Suporte (SUPPORT)
- 📤 **Criar Solicitações** - Deban, Redução de Pena, Apelação
- 📜 **Acompanhar Solicitações** - Ver status e respostas
- 📊 **Dashboard** - Informações gerais

## 🛠️ Tecnologias

### Backend
- **Node.js** + Express.js
- **Prisma ORM** com SQLite
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **CORS** habilitado

### Frontend
- **React 19** + React-DOM
- **Vite** para build
- **CSS-in-JS** com estilos via objeto
- **Fetch API** para requisições

## 📦 Instalação e Uso

### 1. Instalar Dependências

```bash
# Backend
npm install

# Frontend
cd web
npm install
cd ..
```

### 2. Inicializar Banco de Dados

```bash
# Executar seed (criar usuários padrão)
node src/seed.js
```

**Credenciais padrão:**
- 👤 **Admin**: `admin` / `admin123`
- 🟡 **Support**: `support` / `support123`

### 3. Iniciar Servidores

**Em dois terminais diferentes:**

```bash
# Terminal 1 - Backend (porta 3001)
npm run dev

# Terminal 2 - Frontend (porta 5173)
cd web
npm run dev
```

### 4. Acessar o Painel

Abra seu navegador e acesse:
```
http://localhost:5173
```

## 📁 Estrutura de Pastas

```
painel-logs/
├── src/
│   ├── server.js       # API principal
│   ├── prisma.js       # Cliente Prisma
│   └── seed.js         # Dados iniciais
├── prisma/
│   ├── schema.prisma   # Modelo do banco
│   └── dev.db          # Banco SQLite
├── web/                # Aplicação React
│   ├── src/
│   │   ├── App.jsx     # Componente principal
│   │   ├── main.jsx
│   │   └── index.css
│   ├── dist/           # Build de produção
│   └── package.json
├── .env                # Variáveis de ambiente
└── package.json
```

## 🔐 Endpoints da API

### Autenticação
- `POST /login` - Login (username, password)

### Punições
- `POST /punishments` - Criar punição (ADMIN)
- `GET /punishments` - Listar punições

### Solicitações
- `POST /requests` - Criar solicitação (SUPPORT)
- `GET /requests` - Listar solicitações
- `PATCH /requests/:id` - Revisar solicitação (ADMIN)

### Saúde
- `GET /health` - Verificar servidor online

## 🎨 Interface

A interface foi totalmente redesenhada com:
- 🌙 **Tema Dark moderno** em cores cinza e vermelho (#ff6b6b)
- 📱 **Responsiva** e intuitiva
- ⚡ **Animações suaves** em botões e interações
- 🎯 **Navigation clara** com abas ativas destacadas
- 📊 **Cards e listas** bem organizados

## 🚀 Build para Produção

```bash
cd web
npm run build
```

Os arquivos otimizados estarão em `web/dist/`

## ✅ Checklist Final

- ✅ Autenticação com JWT
- ✅ Banco de dados SQLite com Prisma
- ✅ Sistema de punições completo
- ✅ Sistema de solicitações completo
- ✅ UI profissional e moderna
- ✅ Responsividade
- ✅ Tratamento de erros
- ✅ Seeds com dados iniciais
- ✅ Frontend build otimizado
- ✅ Backend com nodemon para dev

## 📝 Customizações

### Adicionar novo usuário ao banco

```bash
# No arquivo seed.js, adicione:
const newUser = await prisma.user.create({
  data: {
    username: "novo_usuario",
    password: await bcrypt.hash("senha123", 10),
    role: "ADMIN" // ou "SUPPORT"
  }
});
```

### Alterar porta do backend
Edite `.env`:
```
PORT=3001  # Mude para a porta desejada
```

## 🐛 Troubleshooting

**Erro: "Erro ao conectar com servidor"**
- Verifique se o backend está rodando em localhost:3001
- Verifique CORS no `src/server.js`

**Erro: "JWT_SECRET não definido"**
- Verifique se o arquivo `.env` existe e tem JWT_SECRET

**Banco de dados não criado**
- Execute: `node src/seed.js`

## 📞 Suporte

Para adicionar novas funcionalidades ou corrigir bugs, edite os arquivos e reinicie os servidores.

---

**Desenvolvido para Atlas Roleplay** | Última atualização: Março 2026
