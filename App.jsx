import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao logar");
        return;
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
    } catch (err) {
      setError("Erro ao conectar com servidor");
    }
  };

  if (user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Aternus MaxCity RP - Painel Administrativo</h1>
        <p>Logado como: <strong>{user.username}</strong> ({user.role})</p>

        <hr />

        {user.role === "ADMIN" && (
          <>
            <button onClick={() => setTab("punishments")}>
              Punições
            </button>
            <button onClick={() => setTab("requests")}>
              Solicitações
            </button>
          </>
        )}

        {user.role === "SUPPORT" && (
          <>
            <button onClick={() => setTab("new-request")}>
              Nova Solicitação
            </button>
          </>
        )}

        <hr />

        {tab === "punishments" && (
          <div>
            <h2>Aplicar Punição</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.target;
                const type = form.type.value;
                const nickname = form.nickname.value;
                const reason = form.reason.value;
                const duration = form.duration.value;

                try {
                  const response = await fetch("http://127.0.0.1:3001/punishments", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                      type,
                      nickname,
                      reason,
                      duration,
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.error || "Erro ao aplicar punição");
                    return;
                  }

                  alert("Punição aplicada com sucesso!");
                  form.reset();
                } catch {
                  alert("Erro ao conectar com servidor");
                }
              }}
            >
              <div>
                <select name="type" required>
                  <option value="">Selecione o tipo</option>
                  <option value="PRISAO">Prisão</option>
                  <option value="WARN">Warn</option>
                  <option value="BAN">Ban</option>
                  <option value="BAN_IP">Ban IP</option>
                </select>
              </div>
              <br />

              <div>
                <input name="nickname" placeholder="Nickname do jogador" required />
              </div>
              <br />

              <div>
                <input name="reason" placeholder="Motivo" required />
              </div>
              <br />

              <div>
                <input name="duration" placeholder="Duração (opcional)" />
              </div>
              <br />

              <button type="submit">Aplicar</button>
            </form>
          </div>
        )}

        {tab === "requests" && (
          <div>
            <h2>Solicitações</h2>
            <p>Aqui o admin verá solicitações pendentes.</p>
          </div>
        )}

        {tab === "new-request" && (
          <div>
            <h2>Nova Solicitação</h2>
            <p>Support poderá criar solicitação aqui.</p>
          </div>
        )}

        <br /><br />
        <button onClick={() => {
          localStorage.removeItem("token");
          setUser(null);
        }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login - Painel Administrativo</h1>
      <form onSubmit={handleLogin}>
        <div>
          <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <br />
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;