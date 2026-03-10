import { useState, useEffect } from "react";

const PUNISHMENT_TYPES = [
  { value: "PRISAO", label: "Prisão" },
  { value: "WARN", label: "Warn (Advertência)" },
  { value: "MUTE", label: "Mute (Silenciado)" },
  { value: "BAN", label: "Ban (Permanente)" },
  { value: "BAN_IP", label: "Ban IP" },
];

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [punishments, setPunishments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("SUPPORT");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    }
  }, []);

  useEffect(() => {
    if (user && tab === "punishments") {
      fetchPunishments();
    }
    if (user && tab === "requests") {
      fetchRequests();
    }
    if (user && tab === "users") {
      fetchUsers();
    }
  }, [tab, user]);

  const validateToken = async (token) => {
    try {
      const response = await fetch("http://127.0.0.1:3001/health");
      if (response.ok) {
        const decoded = parseJwt(token);
        if (decoded) {
          setUser(decoded);
        }
      }
    } catch (err) {
      console.error("Erro ao validar token");
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      setUsername("");
      setPassword("");
      setTab("dashboard");
    } catch (err) {
      setError("Erro ao conectar com servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchPunishments = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/punishments", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPunishments(data);
      }
    } catch (err) {
      console.error("Erro ao buscar punições");
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/requests", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Erro ao buscar solicitações");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/users", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erro ao buscar usuários");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTab("dashboard");
    setPunishments([]);
    setRequests([]);
    setUsers([]);
  };

  if (user) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoArea}>
            <img src="/logo.svg" alt="Atlas Logo" style={{width: "40px", height: "40px", marginRight: "10px"}} />
            <div>
              <h1 style={styles.title}>ATLAS ROLEPLAY</h1>
              <p style={styles.subtitle}>Painel Administrativo</p>
            </div>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.username}</span>
            <span style={styles.userRole}>{user.role === "ADMIN" ? "🔴 ADMIN" : "🟡 SUPPORT"}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </header>

        <nav style={styles.nav}>
          <button
            onClick={() => setTab("dashboard")}
            style={{...styles.navBtn, ...(tab === "dashboard" ? styles.navBtnActive : {})}}
          >
            📊 Dashboard
          </button>
          {user.role === "ADMIN" && (
            <>
              <button
                onClick={() => setTab("punishments")}
                style={{...styles.navBtn, ...(tab === "punishments" ? styles.navBtnActive : {})}}
              >
                ⚡ Punições
              </button>
              <button
                onClick={() => setTab("requests")}
                style={{...styles.navBtn, ...(tab === "requests" ? styles.navBtnActive : {})}}
              >
                📋 Solicitações
              </button>
            </>
          )}
          {user.role === "SUPPORT" && (
            <>
              <button
                onClick={() => setTab("my-requests")}
                style={{...styles.navBtn, ...(tab === "my-requests" ? styles.navBtnActive : {})}}
              >
                📋 Minhas Solicitações
              </button>
              <button
                onClick={() => setTab("new-request")}
                style={{...styles.navBtn, ...(tab === "new-request" ? styles.navBtnActive : {})}}
              >
                ➕ Nova Solicitação
              </button>
            </>
          )}
          {(user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
            <>
              <button
                onClick={() => setTab("punishments")}
                style={{...styles.navBtn, ...(tab === "punishments" ? styles.navBtnActive : {})}}
              >
                ⚡ Punições
              </button>
              <button
                onClick={() => setTab("requests")}
                style={{...styles.navBtn, ...(tab === "requests" ? styles.navBtnActive : {})}}
              >
                📋 Solicitações
              </button>
              <button
                onClick={() => setTab("users")}
                style={{...styles.navBtn, ...(tab === "users" ? styles.navBtnActive : {})}}
              >
                👥 Gerenciar Usuários
              </button>
            </>
          )}
        </nav>

        <main style={styles.main}>
          {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

          {tab === "dashboard" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📊 Dashboard</h2>
              <div style={styles.card}>
                <p>✅ Você está logado como <strong>{user.username}</strong></p>
                <p>🔐 Nível de Acesso: <strong>{user.role === "ADMIN" ? "Administrador" : "Suporte"}</strong></p>
                <p style={{marginTop: "20px", fontSize: "14px", color: "#888"}}>
                  Utilize o menu acima para acessar as funcionalidades disponíveis para sua conta.
                </p>
              </div>
            </div>
          )}

          {tab === "punishments" && (user.role === "ADMIN" || user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>⚡ Aplicar Punição</h2>

              <div style={styles.formContainer}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);

                    const form = e.target;
                    const type = form.type.value;
                    const nickname = form.nickname.value;
                    const reason = form.reason.value;
                    const duration = form.duration.value;
                    const evidenceFile = form.evidence.files[0];

                    let evidence = null;
                    if (evidenceFile) {
                      evidence = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(evidenceFile);
                      });
                    }

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
                          evidence,
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        setError(data.error || "Erro ao aplicar punição");
                        return;
                      }

                      setSuccessMsg("✅ Punição aplicada com sucesso!");
                      form.reset();
                      setTimeout(() => setSuccessMsg(""), 3000);
                      fetchPunishments();
                    } catch {
                      setError("Erro ao conectar com servidor");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Punição</label>
                    <select name="type" required style={styles.input}>
                      <option value="">Selecione o tipo</option>
                      {PUNISHMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nickname do Jogador</label>
                    <input name="nickname" placeholder="Ex: JoãoSilva" required style={styles.input} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Motivo da Punição</label>
                    <textarea
                      name="reason"
                      placeholder="Descreva o motivo"
                      required
                      style={{...styles.input, minHeight: "80px", resize: "vertical"}}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duração (em minutos) - Opcional</label>
                    <input
                      name="duration"
                      type="number"
                      placeholder="Ex: 60, 1440 (1 dia)"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>📎 Evidências (Imagem/Print) - Opcional</label>
                    <input
                      name="evidence"
                      type="file"
                      accept="image/*,.pdf"
                      style={styles.input}
                    />
                    <p style={{fontSize: "12px", color: "#888", margin: "5px 0 0 0"}}>Formatos: PNG, JPG, PDF</p>
                  </div>

                  <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? "Processando..." : "⚡ Aplicar Punição"}
                  </button>
                </form>
              </div>

              <h3 style={{...styles.sectionTitle, marginTop: "40px"}}>📝 Histórico de Punições</h3>
              <div style={styles.listContainer}>
                {punishments.length === 0 ? (
                  <p style={styles.emptyMsg}>Nenhuma punição registrada ainda.</p>
                ) : (
                  punishments.map((p) => (
                    <div key={p.id} style={styles.listItem}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
                        <div style={{flex: 1}}>
                          <p style={{margin: "0 0 5px 0", fontWeight: "bold"}}>
                            🎮 {p.nickname}
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                            Tipo: <span style={{color: "#fff"}}>{p.type}</span>
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                            Motivo: <span style={{color: "#fff"}}>{p.reason}</span>
                          </p>
                          {p.duration && (
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Duração: <span style={{color: "#fff"}}>{p.duration} minutos</span>
                            </p>
                          )}
                          <p style={{margin: "5px 0 0 0", color: "#666", fontSize: "12px"}}>
                            Aplicado por: {p.admin?.username} em {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {(user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Deletar esta punição?")) return;
                              setLoading(true);
                              try {
                                await fetch(`http://127.0.0.1:3001/punishments/${p.id}`, {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                  },
                                });
                                setSuccessMsg("✅ Punição deletada!");
                                fetchPunishments();
                                setTimeout(() => setSuccessMsg(""), 2000);
                              } catch {
                                setError("Erro ao deletar");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading}
                            style={{...styles.btn, backgroundColor: "#f44336", marginLeft: "20px", whiteSpace: "nowrap"}}
                          >
                            🗑️ Deletar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "punishments" && (user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>⚡ Punições</h2>

              <div style={styles.listContainer}>
                {punishments.length === 0 ? (
                  <p style={styles.emptyMsg}>Nenhuma punição registrada.</p>
                ) : (
                  punishments.map((p) => (
                    <div key={p.id} style={styles.listItem}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                        <div style={{flex: 1}}>
                          <p style={{margin: "0 0 5px 0", color: "#ffc107", fontWeight: "bold"}}>
                            ⚡ {PUNISHMENT_TYPES.find(t => t.value === p.type)?.label}
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                            Jogador: <span style={{color: "#fff"}}>{p.nickname}</span>
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                            Motivo: <span style={{color: "#fff"}}>{p.reason}</span>
                          </p>
                          {p.duration && (
                            <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                              Duração: <span style={{color: "#fff"}}>{p.duration} minutos</span>
                            </p>
                          )}
                          {p.evidence && (
                            <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                              📎 <a href={p.evidence} target="_blank" rel="noopener noreferrer" style={{color: "#2196F3"}}>Ver Evidência</a>
                            </p>
                          )}
                          <p style={{margin: "5px 0 0 0", color: "#666", fontSize: "12px"}}>
                            Aplicado por: {p.admin?.username} em {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Deletar esta punição?")) return;
                            setLoading(true);
                            try {
                              await fetch(`http://127.0.0.1:3001/punishments/${p.id}`, {
                                method: "DELETE",
                                headers: {
                                  Authorization: "Bearer " + localStorage.getItem("token"),
                                },
                              });
                              setSuccessMsg("✅ Punição deletada!");
                              fetchPunishments();
                              setTimeout(() => setSuccessMsg(""), 2000);
                            } catch {
                              setError("Erro ao deletar");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          style={{...styles.btn, backgroundColor: "#f44336", marginLeft: "20px", whiteSpace: "nowrap", flexShrink: 0}}
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "requests" && (user.role === "ADMIN" || user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📋 Solicitações Pendentes</h2>

              <div style={styles.listContainer}>
                {requests.filter(r => r.status === "PENDENTE").length === 0 ? (
                  <p style={styles.emptyMsg}>Nenhuma solicitação pendente.</p>
                ) : (
                  requests
                    .filter(r => r.status === "PENDENTE")
                    .map((req) => (
                      <div key={req.id} style={{...styles.listItem, borderLeft: "3px solid #ffa500"}}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
                          <div style={{flex: 1}}>
                            <p style={{margin: "0 0 5px 0", fontWeight: "bold"}}>
                              👤 {req.nickname}
                            </p>
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Tipo: <span style={{color: "#fff"}}>{req.type}</span>
                            </p>
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Motivo: <span style={{color: "#fff"}}>{req.reason}</span>
                            </p>
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Status: <span style={{color: "#ffa500"}}>⏳ {req.status}</span>
                            </p>
                          </div>
                          <div style={{display: "flex", gap: "10px", marginLeft: "20px", flexWrap: "wrap"}}>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              style={{...styles.btn, backgroundColor: "#2196F3"}}
                            >
                              🔍 Ver Detalhes
                            </button>
                            <button
                              onClick={async () => {
                                setLoading(true);
                                try {
                                  const response = await fetch(
                                    `http://127.0.0.1:3001/requests/${req.id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: "Bearer " + localStorage.getItem("token"),
                                      },
                                      body: JSON.stringify({
                                        status: "APROVADO",
                                      }),
                                    }
                                  );

                                  if (response.ok) {
                                    setSuccessMsg("✅ Solicitação aprovada!");
                                    fetchRequests();
                                    setTimeout(() => setSuccessMsg(""), 2000);
                                  }
                                } catch (e) {
                                  setError("Erro ao aprovar");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              style={{...styles.btn, backgroundColor: "#4CAF50"}}
                            >
                              ✅ Aprovar
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt("Motivo da rejeição:");
                                if (reason) {
                                  setLoading(true);
                                  try {
                                    const response = await fetch(
                                      `http://127.0.0.1:3001/requests/${req.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: "Bearer " + localStorage.getItem("token"),
                                        },
                                        body: JSON.stringify({
                                          status: "REJEITADO",
                                          reviewReason: reason,
                                        }),
                                      }
                                    );

                                    if (response.ok) {
                                      setSuccessMsg("❌ Solicitação rejeitada!");
                                      fetchRequests();
                                      setTimeout(() => setSuccessMsg(""), 2000);
                                    }
                                  } catch (e) {
                                    setError("Erro ao rejeitar");
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                              style={{...styles.btn, backgroundColor: "#f44336"}}
                            >
                              ❌ Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <h3 style={{...styles.sectionTitle, marginTop: "40px"}}>📅 Histórico</h3>
              <div style={styles.listContainer}>
                {requests.filter(r => r.status !== "PENDENTE").length === 0 ? (
                  <p style={styles.emptyMsg}>Nenhuma solicitação revisada.</p>
                ) : (
                  requests
                    .filter(r => r.status !== "PENDENTE")
                    .map((req) => (
                      <div
                        key={req.id}
                        style={{
                          ...styles.listItem,
                          borderLeft: `3px solid ${req.status === "APROVADO" ? "#4CAF50" : "#f44336"}`,
                          opacity: 0.8,
                        }}
                      >
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
                          <div style={{flex: 1}}>
                            <p style={{margin: "0 0 5px 0", fontWeight: "bold"}}>
                              👤 {req.nickname}
                            </p>
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Status: <span style={{color: req.status === "APROVADO" ? "#4CAF50" : "#f44336"}}>
                                {req.status === "APROVADO" ? "✅" : "❌"} {req.status}
                              </span>
                            </p>
                            {req.reviewReason && (
                              <p style={{margin: "5px 0 0 0", color: "#888", fontSize: "12px"}}>
                                Motivo: {req.reviewReason}
                              </p>
                            )}
                          </div>
                          {(user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
                            <button
                              onClick={async () => {
                                if (!window.confirm("Deletar esta solicitação?")) return;
                                setLoading(true);
                                try {
                                  await fetch(`http://127.0.0.1:3001/requests/${req.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: "Bearer " + localStorage.getItem("token"),
                                    },
                                  });
                                  setSuccessMsg("✅ Solicitação deletada!");
                                  fetchRequests();
                                  setTimeout(() => setSuccessMsg(""), 2000);
                                } catch {
                                  setError("Erro ao deletar");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              disabled={loading}
                              style={{...styles.btn, backgroundColor: "#f44336", marginLeft: "20px", whiteSpace: "nowrap"}}
                            >
                              🗑️ Deletar
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {tab === "requests" && (user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📋 Solicitações</h2>

              <div style={styles.listContainer}>
                {requests.length === 0 ? (
                  <p style={styles.emptyMsg}>Nenhuma solicitação registrada.</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} style={{...styles.listItem, borderLeft: `3px solid ${req.status === "PENDENTE" ? "#ffa500" : req.status === "APROVADO" ? "#4CAF50" : "#f44336"}`}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                        <div style={{flex: 1}}>
                          <p style={{margin: "0 0 5px 0", color: "#ffc107", fontWeight: "bold"}}>
                            👤 {req.nickname}
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                            Tipo: <span style={{color: "#fff"}}>{req.type}</span>
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                            Motivo: <span style={{color: "#fff"}}>{req.reason}</span>
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                            Status: <span style={{color: req.status === "PENDENTE" ? "#ffa500" : req.status === "APROVADO" ? "#4CAF50" : "#f44336"}}>
                              {req.status === "PENDENTE" ? "⏳" : req.status === "APROVADO" ? "✅" : "❌"} {req.status}
                            </span>
                          </p>
                          {req.evidence && (
                            <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "14px"}}>
                              📎 <a href={req.evidence} target="_blank" rel="noopener noreferrer" style={{color: "#2196F3"}}>Ver Evidência</a>
                            </p>
                          )}
                        </div>
                        <div style={{display: "flex", gap: "10px", marginLeft: "20px", flexShrink: 0}}>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            style={{...styles.btn, backgroundColor: "#2196F3", whiteSpace: "nowrap"}}
                          >
                            🔍 Ver Detalhes
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Deletar esta solicitação?")) return;
                              setLoading(true);
                              try {
                                await fetch(`http://127.0.0.1:3001/requests/${req.id}`, {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                  },
                                });
                                setSuccessMsg("✅ Solicitação deletada!");
                                fetchRequests();
                                setTimeout(() => setSuccessMsg(""), 2000);
                              } catch {
                                setError("Erro ao deletar");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading}
                            style={{...styles.btn, backgroundColor: "#f44336", whiteSpace: "nowrap"}}
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "my-requests" && user.role === "SUPPORT" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📋 Minhas Solicitações</h2>

              <div style={styles.listContainer}>
                {requests.length === 0 ? (
                  <p style={styles.emptyMsg}>Você não enviou solicitações ainda.</p>
                ) : (
                  requests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        ...styles.listItem,
                        borderLeft: `3px solid ${
                          req.status === "PENDENTE" ? "#ffa500" : req.status === "APROVADO" ? "#4CAF50" : "#f44336"
                        }`,
                      }}
                    >
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
                        <div style={{flex: 1}}>
                          <p style={{margin: "0 0 5px 0", fontWeight: "bold"}}>
                            👤 {req.nickname}
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                            Tipo: <span style={{color: "#fff"}}>{req.type}</span>
                          </p>
                          <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                            Descrição: <span style={{color: "#fff"}}>{req.reason}</span>
                          </p>
                          {req.duration && (
                            <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                              Duração: <span style={{color: "#fff"}}>{req.duration} minutos</span>
                            </p>
                          )}
                          <p style={{margin: "0 0 5px 0", color: "#888", fontSize: "14px"}}>
                            Status:{" "}
                            <span
                              style={{
                                color:
                                  req.status === "PENDENTE"
                                    ? "#ffa500"
                                    : req.status === "APROVADO"
                                      ? "#4CAF50"
                                      : "#f44336",
                                fontWeight: "bold",
                              }}
                            >
                              {req.status === "PENDENTE" ? "⏳ Pendente" : req.status === "APROVADO" ? "✅ Aprovado" : "❌ Rejeitado"}
                            </span>
                          </p>
                          {req.reviewReason && (
                            <p style={{margin: "5px 0 0 0", color: "#f44336", fontSize: "13px"}}>
                              📌 Motivo: {req.reviewReason}
                            </p>
                          )}
                          <p style={{margin: "5px 0 0 0", color: "#666", fontSize: "12px"}}>
                            Enviada em: {new Date(req.createdAt).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(req.createdAt).toLocaleTimeString("pt-BR")}
                          </p>
                          {req.reviewedAt && (
                            <p style={{margin: "5px 0 0 0", color: "#666", fontSize: "12px"}}>
                              Revisada em: {new Date(req.reviewedAt).toLocaleDateString("pt-BR")} às{" "}
                              {new Date(req.reviewedAt).toLocaleTimeString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "new-request" && user.role === "SUPPORT" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>➕ Nova Solicitação</h2>

              <div style={styles.formContainer}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);

                    const form = e.target;
                    const type = form.type.value;
                    const nickname = form.nickname.value;
                    const reason = form.reason.value;
                    const duration = form.duration.value;
                    const evidenceFile = form.evidence.files[0];

                    let evidence = null;
                    if (evidenceFile) {
                      evidence = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(evidenceFile);
                      });
                    }

                    try {
                      const response = await fetch("http://127.0.0.1:3001/requests", {
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
                          evidence,
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        setError(data.error || "Erro ao criar solicitação");
                        return;
                      }

                      setSuccessMsg("✅ Solicitação criada com sucesso!");
                      form.reset();
                      setTimeout(() => setSuccessMsg(""), 3000);
                      fetchRequests();
                    } catch {
                      setError("Erro ao conectar com servidor");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Solicitação</label>
                    <select name="type" required style={styles.input}>
                      <option value="">Selecione o tipo</option>
                      {PUNISHMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nickname do Jogador</label>
                    <input name="nickname" placeholder="Ex: JoãoSilva" required style={styles.input} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descrição da Solicitação</label>
                    <textarea
                      name="reason"
                      placeholder="Descreva em detalhes a solicitação"
                      required
                      style={{...styles.input, minHeight: "100px", resize: "vertical"}}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duração (em minutos) - Opcional</label>
                    <input
                      name="duration"
                      type="number"
                      placeholder="Apenas se aplicável"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>📎 Evidências (Imagem/Print) - Opcional</label>
                    <input
                      name="evidence"
                      type="file"
                      accept="image/*,.pdf"
                      style={styles.input}
                    />
                    <p style={{fontSize: "12px", color: "#888", margin: "5px 0 0 0"}}>Formatos: PNG, JPG, PDF</p>
                  </div>

                  <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? "Processando..." : "📤 Enviar Solicitação"}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>

        {tab === "users" && (user.role === "PROGRAMADOR" || user.role === "FUNDADOR") && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>👥 Gerenciar Usuários</h2>

            <div style={styles.formContainer}>
              <h3 style={{marginTop: "0", marginBottom: "20px", color: "#ffc107"}}>➕ Criar Novo Usuário</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nome de Usuário</label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Senha</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Digite a senha"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cargo</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={styles.input}>
                  <option value="SUPPORT">🟡 Support</option>
                  <option value="ADMIN">🔴 Admin</option>
                  <option value="PROGRAMADOR">💜 Programador</option>
                  <option value="FUNDADOR">👑 Fundador</option>
                </select>
              </div>

              <button
                onClick={async () => {
                  if (!newUserUsername || !newUserPassword) {
                    setError("Preencha todos os campos");
                    return;
                  }

                  setLoading(true);
                  try {
                    const response = await fetch("http://127.0.0.1:3001/users", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token"),
                      },
                      body: JSON.stringify({
                        username: newUserUsername,
                        password: newUserPassword,
                        role: newUserRole,
                      }),
                    });

                    if (response.ok) {
                      setSuccessMsg("✅ Usuário criado com sucesso!");
                      setNewUserUsername("");
                      setNewUserPassword("");
                      setNewUserRole("SUPPORT");
                      fetchUsers();
                      setTimeout(() => setSuccessMsg(""), 3000);
                    } else {
                      const data = await response.json();
                      setError(data.error || "Erro ao criar usuário");
                    }
                  } catch {
                    setError("Erro ao conectar com servidor");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? "Criando..." : "➕ Criar Usuário"}
              </button>
            </div>

            <div style={{marginTop: "40px"}}>
              <h3 style={{marginTop: "0", marginBottom: "20px", color: "#ffc107"}}>📋 Lista de Usuários</h3>

              {users.length === 0 ? (
                <div style={styles.emptyMsg}>Nenhum usuário encontrado</div>
              ) : (
                <div style={styles.listContainer}>
                  {users.map((u) => (
                    <div key={u.id} style={styles.listItem}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div>
                          <p style={{margin: "0 0 5px 0", color: "#ffc107", fontWeight: "bold"}}>👤 {u.username}</p>
                          <p style={{margin: "0 0 5px 0", color: "#aaa", fontSize: "12px"}}>
                            Cargo: {u.role === "SUPPORT" ? "🟡 Support" : u.role === "ADMIN" ? "🔴 Admin" : u.role === "PROGRAMADOR" ? "💜 Programador" : "👑 Fundador"}
                          </p>
                          <p style={{margin: "0", color: "#666", fontSize: "11px"}}>Criado em: {new Date(u.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>

                        <div style={{display: "flex", gap: "10px"}}>
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              setLoading(true);
                              try {
                                const response = await fetch(`http://127.0.0.1:3001/users/${u.id}`, {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                  },
                                  body: JSON.stringify({ role: newRole }),
                                });

                                if (response.ok) {
                                  setSuccessMsg("✅ Cargo atualizado com sucesso!");
                                  fetchUsers();
                                  setTimeout(() => setSuccessMsg(""), 3000);
                                } else {
                                  setError("Erro ao atualizar cargo");
                                }
                              } catch {
                                setError("Erro ao conectar com servidor");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            style={{...styles.btn, backgroundColor: "#555", padding: "6px 10px", fontSize: "12px"}}
                          >
                            <option value="SUPPORT">🟡 Support</option>
                            <option value="ADMIN">🔴 Admin</option>
                            <option value="PROGRAMADOR">💜 Programador</option>
                            <option value="FUNDADOR">👑 Fundador</option>
                          </select>

                          <button
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja deletar o usuário "${u.username}"?`)) {
                                fetch(`http://127.0.0.1:3001/users/${u.id}`, {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                  },
                                })
                                  .then(() => {
                                    setSuccessMsg("✅ Usuário deletado com sucesso!");
                                    fetchUsers();
                                    setTimeout(() => setSuccessMsg(""), 3000);
                                  })
                                  .catch(() => {
                                    setError("Erro ao deletar usuário");
                                  });
                              }
                            }}
                            style={{...styles.btn, backgroundColor: "#f44336"}}
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedRequest && (
          <div style={styles.modalOverlay} onClick={() => setSelectedRequest(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={{margin: 0, color: "#ffc107"}}>📋 Detalhes da Solicitação</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#aaa",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalContent}>
                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>👤 Nickname:</label>
                  <span style={styles.detailValue}>{selectedRequest.nickname}</span>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>📌 Tipo:</label>
                  <span style={styles.detailValue}>{selectedRequest.type}</span>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>📝 Descrição:</label>
                  <span style={styles.detailValue}>{selectedRequest.reason}</span>
                </div>

                {selectedRequest.duration && (
                  <div style={styles.detailRow}>
                    <label style={styles.detailLabel}>⏱️ Duração:</label>
                    <span style={styles.detailValue}>{selectedRequest.duration} minutos</span>
                  </div>
                )}

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>🔔 Status:</label>
                  <span
                    style={{
                      ...styles.detailValue,
                      color:
                        selectedRequest.status === "PENDENTE"
                          ? "#ffa500"
                          : selectedRequest.status === "APROVADO"
                            ? "#4CAF50"
                            : "#f44336",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedRequest.status === "PENDENTE"
                      ? "⏳ Pendente"
                      : selectedRequest.status === "APROVADO"
                        ? "✅ Aprovado"
                        : "❌ Rejeitado"}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>👤 Enviado por:</label>
                  <span style={styles.detailValue}>{selectedRequest.support?.username || "Support"}</span>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>📅 Enviada em:</label>
                  <span style={styles.detailValue}>
                    {new Date(selectedRequest.createdAt).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(selectedRequest.createdAt).toLocaleTimeString("pt-BR")}
                  </span>
                </div>

                {selectedRequest.reviewedAt && (
                  <>
                    <div style={styles.detailRow}>
                      <label style={styles.detailLabel}>👤 Revisada por:</label>
                      <span style={styles.detailValue}>{selectedRequest.admin?.username || "Admin"}</span>
                    </div>

                    <div style={styles.detailRow}>
                      <label style={styles.detailLabel}>📅 Revisada em:</label>
                      <span style={styles.detailValue}>
                        {new Date(selectedRequest.reviewedAt).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(selectedRequest.reviewedAt).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                  </>
                )}

                {selectedRequest.reviewReason && (
                  <div style={styles.detailRow}>
                    <label style={styles.detailLabel}>💬 Motivo da Rejeição:</label>
                    <span style={{...styles.detailValue, color: "#f44336"}}>{selectedRequest.reviewReason}</span>
                  </div>
                )}

                {selectedRequest.evidence && (
                  <div style={styles.detailRow}>
                    <label style={styles.detailLabel}>📎 Evidência:</label>
                    <div style={{marginTop: "10px"}}>
                      {selectedRequest.evidence.startsWith("data:image") ? (
                        <img
                          src={selectedRequest.evidence}
                          alt="Evidência"
                          style={{maxWidth: "100%", maxHeight: "300px", borderRadius: "5px"}}
                        />
                      ) : (
                        <a
                          href={selectedRequest.evidence}
                          download
                          style={{color: "#ffc107", textDecoration: "underline"}}
                        >
                          📥 Baixar Arquivo
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button onClick={() => setSelectedRequest(null)} style={styles.submitBtn}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={styles.loginLogo}>
          <img src="/logo.svg" alt="Atlas Logo" style={{width: "120px", height: "120px", marginBottom: "20px"}} />
          <h1 style={styles.loginTitle}>ATLAS</h1>
          <p style={styles.loginSubtitle}>Painel Administrativo</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <input
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Conectando..." : "🔓 Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#1a1a1a",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  loginBox: {
    backgroundColor: "#2a2a2a",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 30px rgba(255, 107, 107, 0.3)",
    width: "100%",
    maxWidth: "400px",
  },
  loginLogo: {
    textAlign: "center",
    marginBottom: "30px",
  },
  loginTitle: {
    margin: "0",
    color: "#ffc107",
    fontSize: "36px",
    fontWeight: "bold",
  },
  loginSubtitle: {
    margin: "5px 0 0 0",
    color: "#aaa",
    fontSize: "14px",
  },
  loginForm: {
    marginBottom: "20px",
  },
  loginHint: {
    textAlign: "center",
    color: "#888",
    fontSize: "12px",
    marginTop: "15px",
    lineHeight: "1.6",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  header: {
    backgroundColor: "#0f0f0f",
    borderBottom: "2px solid #ffc107",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoArea: {
    flex: 1,
  },
  title: {
    margin: "0",
    fontSize: "28px",
    color: "#ffc107",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#777",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userName: {
    fontSize: "14px",
    color: "#d0d0d0",
    fontWeight: "bold",
  },
  userRole: {
    fontSize: "12px",
    padding: "5px 10px",
    backgroundColor: "#333",
    borderRadius: "5px",
    color: "#aaa",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  nav: {
    backgroundColor: "#242424",
    padding: "15px 40px",
    display: "flex",
    gap: "10px",
    borderBottom: "1px solid #333",
    flexWrap: "wrap",
  },
  navBtn: {
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "#aaa",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s",
  },
  navBtnActive: {
    backgroundColor: "#ffc107",
    color: "#fff",
    fontWeight: "bold",
  },
  main: {
    flex: 1,
    padding: "30px 40px",
    overflow: "auto",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    marginTop: "0",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#ffc107",
    borderBottom: "2px solid #ffc107",
    paddingBottom: "10px",
  },
  formContainer: {
    backgroundColor: "#2a2a2a",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#aaa",
    fontSize: "14px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  btn: {
    padding: "8px 12px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#2a2a2a",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "3px solid #ffc107",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  listItem: {
    backgroundColor: "#2a2a2a",
    padding: "15px",
    borderRadius: "5px",
    borderLeft: "3px solid #ffc107",
  },
  emptyMsg: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
    fontStyle: "italic",
  },
  errorAlert: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  successAlert: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#2a2a2a",
    borderRadius: "10px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 0 50px rgba(255, 107, 107, 0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "2px solid #ffc107",
  },
  modalContent: {
    padding: "20px",
  },
  detailRow: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailLabel: {
    color: "#ffc107",
    fontWeight: "bold",
    fontSize: "14px",
  },
  detailValue: {
    color: "#e0e0e0",
    fontSize: "14px",
    backgroundColor: "#1a1a1a",
    padding: "12px",
    borderRadius: "5px",
    wordWrap: "break-word",
  },
  modalFooter: {
    padding: "20px",
    borderTop: "1px solid #333",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
};

export default App;
