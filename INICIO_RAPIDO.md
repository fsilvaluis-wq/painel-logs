# 🚀 GUIA RÁPIDO - ATLAS ROLEPLAY PAINEL ADMINISTRATIVO

## ⚡ Iniciar Rápido

### 1️⃣ **PRIMEIRA VEZ - Preparar o ambiente**

```powershell
# Abra PowerShell como Administrador e execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Instale Node.js se não tiver: https://nodejs.org/
```

### 2️⃣ **Iniciar os servidores**

Abra **2 PowerShells diferentes** na pasta do projeto:

```powershell
# PRIMEIRO PowerShell - Backend
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
cd "c:\Users\Luis Silva\Desktop\Administração\AternusMaxCity\Painel Administrativo\painel-logs"
npm run dev
# Você verá: "Servidor rodando na porta 3001"
```

```powershell
# SEGUNDO PowerShell - Frontend
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
cd "c:\Users\Luis Silva\Desktop\Administração\AternusMaxCity\Painel Administrativo\painel-logs\web"
npm run dev
# Você verá: "➜ Local: http://localhost:5173/"
```

### 3️⃣ **Acessar o Painel**

Abra seu navegador e vá para:
```
http://localhost:5173
```

### 4️⃣ **Login com credenciais padrão**

```
👤 Admin
Usuário: admin
Senha: admin123

🟡 Support
Usuário: support
Senha: support123
```

---

## 📊 O que você pode fazer

### Logo do Painel
**Você pode adicionar uma logo no campo indicado em `web/src/App.jsx`**

Procure por: `<h1 style={styles.loginTitle}>⚔️ ATERNUS</h1>`

Substitua o emoji ⚔️ ou adicione uma tag `<img>` para sua logo.

### Para Admins
- ✅ Aplicar punições (Prisão, Warn, Ban, Ban IP)
- ✅ Ver histórico de punições
- ✅ Revisar e aprovar/rejeitar solicitações
- ✅ Gerenciar solicitações do suporte

### Para Suporte
- ✅ Criar solicitações (Deban, Redução de Pena, Apelação)
- ✅ Acompanhar status das solicitações
- ✅ Ver resposta dos admins

---

## 🐛 Problemas Comuns

### ❌ "npm : O arquivo ... não pode ser carregado"
**Solução:** Execute no PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
```

### ❌ "Erro ao conectar com servidor"
**Solução:** Verifique se ambos os PowerShells estão rodando:
1. Backend deve estar em: `http://127.0.0.1:3001`
2. Frontend em: `http://localhost:5173`

### ❌ "LOGIN NÃO FUNCIONA"
**Solução:** Execute o seed do banco:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
cd "c:\Users\Luis Silva\Desktop\Administração\AternusMaxCity\Painel Administrativo\painel-logs"
node src/seed.js
```

---

## 📦 Build para Produção

Quando quiser criar a versão final otimizada:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
cd "c:\Users\Luis Silva\Desktop\Administração\AternusMaxCity\Painel Administrativo\painel-logs\web"
npm run build
```

Os arquivos prontos estarão em: `web/dist/`

---

## ✅ Status do Projeto

- ✅ API backend completa
- ✅ Autenticação com JWT
- ✅ Banco de dados SQLite
- ✅ Frontend React com UI moderna
- ✅ Sistema de punições
- ✅ Sistema de solicitações
- ✅ Verificação de permissões (Admin/Support)
- ✅ Responsividade
- ✅ Temas e estilos profissionais
- ⏳ **Faltando apenas sua LOGO!**

---

## 🎨 Adicionar Sua Logo

### Opção 1: Usar Emoji (Rápido)
Abra `web/src/App.jsx` e procure por:
```jsx
<h1 style={styles.loginTitle}>⚔️ ATERNUS</h1>
```

Mude o emoji para o que quiser.

### Opção 2: Usar Arquivo de Imagem
1. Coloque sua logo em `web/public/logo.png`
2. Abra `web/src/App.jsx`
3. Procure por `loginLogo` e adicione:
```jsx
<img src="/logo.png" alt="Logo" style={{height: "60px", marginBottom: "10px"}} />
```

---

## 📝 Criar Novo Admin/Support

No arquivo `src/seed.js`, adicione:

```javascript
const newAdmin = await prisma.user.create({
  data: {
    username: "novo_admin",
    password: await bcrypt.hash("senha123", 10),
    role: "ADMIN"
  }
});
```

Depois execute:
```powershell
node src/seed.js
```

---

## 🎯 Próximos Passos

1. ✅ Adicione sua LOGO
2. ⏰ Teste todas as funcionalidades
3. 📤 Envie-me a logo para finalizar

---

**Painel 100% Funcional! 🚀**

Qualquer dúvida, me chama! 💬
