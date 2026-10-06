const STORAGE_KEY = "convivencia-ocorrencias-v1";
const USERS_KEY = "convivencia-demo-users-v1";
const SESSION_KEY = "convivencia-demo-session-v1";
const PASSWORD_RULES = {
  length: value => value.length >= 8,
  upper: value => /[A-Z]/.test(value),
  lower: value => /[a-z]/.test(value),
  number: value => /\d/.test(value),
  special: value => /[^A-Za-z0-9]/.test(value)
};

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const seedRecords = [
  { id: "demo-1", student: "Lucas Ferreira", className: "8º A", type: "Convivência", date: dateDaysAgo(1), time: "10:20", priority: "Média", status: "Em acompanhamento", description: "Desentendimento verbal entre colegas durante o intervalo. Os estudantes foram ouvidos individualmente.", actions: "Conversa mediada pela coordenação. Acompanhamento combinado para a próxima semana.", responsible: "Mariana Alves" },
  { id: "demo-2", student: "Beatriz Costa", className: "6º B", type: "Acadêmica", date: dateDaysAgo(2), time: "09:10", priority: "Baixa", status: "Resolvida", description: "Estudante relatou dificuldade em acompanhar a atividade de matemática.", actions: "Professora ofereceu orientação individual e indicou exercícios de reforço.", responsible: "Mariana Alves" },
  { id: "demo-3", student: "Rafael Oliveira", className: "9º A", type: "Presença", date: dateDaysAgo(3), time: "08:00", priority: "Baixa", status: "Em acompanhamento", description: "Ausências consecutivas identificadas no acompanhamento diário da turma.", actions: "Contato inicial com a família para compreender a situação.", responsible: "Mariana Alves" },
  { id: "demo-4", student: "Ana Clara Souza", className: "7º C", type: "Bem-estar", date: dateDaysAgo(5), time: "11:35", priority: "Alta", status: "Em acompanhamento", description: "Estudante procurou a orientação relatando que não estava se sentindo bem emocionalmente.", actions: "Escuta acolhedora e contato reservado com a família. Encaminhamento para acompanhamento conforme protocolo escolar.", responsible: "Mariana Alves" },
  { id: "demo-5", student: "Pedro Henrique Lima", className: "5º A", type: "Patrimônio", date: dateDaysAgo(7), time: "13:15", priority: "Baixa", status: "Resolvida", description: "Carteira da sala apresentou avaria identificada após a aula.", actions: "Equipe de manutenção informada; reparo realizado.", responsible: "Mariana Alves" }
];

const categories = ["Convivência", "Acadêmica", "Presença", "Bem-estar", "Patrimônio", "Outra"];
const chartColors = ["#7868e5", "#5eb99a", "#e7b158", "#ea8d7d", "#8eaccb", "#c1a0cf"];
let records = loadRecords();
let users = loadUsers();
let currentUser = null;
let toastTimer;

function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Formato de contas inválido.");
    return parsed;
  } catch (error) {
    console.error("Não foi possível carregar as contas locais.", error);
    return [];
  }
}

function saveUsers(nextUsers) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    users = nextUsers;
    return true;
  } catch (error) {
    console.error("Não foi possível salvar as contas locais.", error);
    showToast("Não foi possível salvar a conta neste navegador.");
    return false;
  }
}

function passwordIsValid(value) {
  return Object.values(PASSWORD_RULES).every(check => check(value));
}

function renderPasswordRules(fieldId) {
  const ruleLabels = [
    ["length", "Ao menos 8 caracteres"],
    ["upper", "Uma letra maiúscula"],
    ["lower", "Uma letra minúscula"],
    ["number", "Um número"],
    ["special", "Um caractere especial"]
  ];
  return `<ul class="password-rules" data-rules-for="${fieldId}">${ruleLabels.map(([rule, label]) => `<li data-rule="${rule}"><span aria-hidden="true">○</span>${label}</li>`).join("")}</ul>`;
}

function refreshPasswordRules(input) {
  const container = document.querySelector(`[data-rules-for="${input.id}"]`);
  if (!container) return;
  for (const [rule, check] of Object.entries(PASSWORD_RULES)) {
    const item = container.querySelector(`[data-rule="${rule}"]`);
    if (!item) continue;
    const valid = check(input.value);
    item.classList.toggle("valid", valid);
    item.querySelector("span").textContent = valid ? "✓" : "○";
  }
}

function passwordToggleButton(id) {
  return `<div class="password-control"><input id="${id}" name="password" type="password" required autocomplete="new-password" /><button type="button" class="password-toggle" data-toggle-password="${id}" aria-label="Mostrar senha">Mostrar</button></div>`;
}

function renderAuth(errorMessage = "") {
  const isFirstAccount = users.length === 0;
  document.getElementById("app-shell").hidden = true;
  const screen = document.getElementById("auth-screen");
  screen.hidden = false;
  screen.innerHTML = `<div class="auth-layout">
    <aside class="auth-visual">
      <div class="auth-visual-copy">
        <span class="auth-visual-kicker">INSTITUTO PRIMAVERA</span>
        <h2>Um espaço seguro para cuidar da convivência.</h2>
        <p>Acompanhe cada situação com escuta, atenção e responsabilidade.</p>
      </div>
      <img class="auth-illustration" src="school-welcome.svg" alt="Ilustração de educadores acolhendo estudantes na escola" />
      <div class="auth-visual-footer"><span>Educar também é cuidar.</span><span>Unidade Centro</span></div>
    </aside>
    <div class="auth-card">
    <a class="brand auth-brand" href="#" aria-label="Convivência">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3.5 27 8v7.2c0 6.4-4.6 11.1-11 13.3C9.6 26.3 5 21.6 5 15.2V8l11-4.5Z"/><path d="m11.2 15.7 3.2 3.1 6.8-7"/></svg></span>
      <span class="brand-copy"><strong>convivência</strong><small>GESTÃO ESCOLAR</small></span>
    </a>
    <p class="eyebrow">${isFirstAccount ? "CONFIGURAÇÃO INICIAL" : "INSTITUTO PRIMAVERA · UNIDADE CENTRO"}</p>
    <h1>${isFirstAccount ? "Criar conta da coordenação" : "Bem-vindo de volta"}</h1>
    <p class="auth-subtitle">${isFirstAccount ? "Crie a primeira conta. Depois, a coordenação poderá cadastrar professores." : "Entre com o e-mail e a senha fornecidos pela coordenação."}</p>
    ${errorMessage ? `<p class="auth-error" role="alert">${escapeHtml(errorMessage)}</p>` : ""}
    ${isFirstAccount ? `<form id="auth-setup-form" class="auth-form">
      <div class="field"><label for="setup-name">Nome da coordenação *</label><input id="setup-name" name="name" required maxlength="100" autocomplete="name" placeholder="Seu nome completo" /></div>
      <div class="field"><label for="setup-email">E-mail *</label><input id="setup-email" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="voce@escola.com" /></div>
      <div class="field"><label for="setup-password">Senha *</label>${passwordToggleButton("setup-password")}${renderPasswordRules("setup-password")}</div>
      <button class="primary-button auth-submit" type="submit">Criar conta da coordenação</button>
    </form>` : `<form id="auth-login-form" class="auth-form">
      <div class="field"><label for="login-email">E-mail *</label><input id="login-email" name="email" type="email" required autocomplete="username" placeholder="voce@escola.com" /></div>
      <div class="field"><label for="login-password">Senha *</label><div class="password-control"><input id="login-password" name="password" type="password" required autocomplete="current-password" /><button type="button" class="password-toggle" data-toggle-password="login-password" aria-label="Mostrar senha">Mostrar</button></div></div>
      <button class="primary-button auth-submit" type="submit">Entrar</button>
    </form>`}
    <p class="demo-warning auth-warning"><strong>Modo de demonstração:</strong> contas e senhas são guardadas neste navegador. Isso não equivale a uma autenticação segura para dados escolares reais.</p>
    </div>
  </div>`;
  const passwordInput = screen.querySelector("#setup-password");
  if (passwordInput) passwordInput.addEventListener("input", () => refreshPasswordRules(passwordInput));
  const focusTarget = screen.querySelector("input");
  if (focusTarget) focusTarget.focus();
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

async function hashPassword(password, saltValue = null) {
  if (!crypto.subtle) throw new Error("Este navegador não oferece a criptografia necessária. Abra o aplicativo em localhost ou HTTPS.");
  const salt = saltValue ? fromBase64(saltValue) : crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, material, 256);
  return { salt: toBase64(salt), hash: toBase64(new Uint8Array(bits)) };
}

function enterApp(user) {
  currentUser = user;
  try {
    sessionStorage.setItem(SESSION_KEY, user.id);
  } catch (error) {
    console.error("Não foi possível iniciar a sessão local.", error);
    renderAuth("Não foi possível iniciar a sessão neste navegador.");
    return;
  }
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app-shell").hidden = false;
  document.getElementById("profile-name").textContent = user.name;
  document.getElementById("profile-role").textContent = user.role === "coordinator" ? "Coordenação" : "Professor(a)";
  document.getElementById("profile-initials").textContent = initials(user.name);
  document.getElementById("top-avatar").textContent = initials(user.name);
  document.getElementById("top-avatar").setAttribute("aria-label", `Perfil de ${user.name}`);
  document.getElementById("welcome-name").textContent = user.name.split(/\s+/)[0];
  const hour = new Date().getHours();
  document.getElementById("welcome-greeting").textContent = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  document.querySelectorAll(".coordinator-only").forEach(item => item.classList.toggle("hidden", user.role !== "coordinator"));
  showPage("inicio");
  renderAll();
}

function restoreSession() {
  try {
    const userId = sessionStorage.getItem(SESSION_KEY);
    const user = users.find(item => item.id === userId);
    if (user) {
      enterApp(user);
      return;
    }
  } catch (error) {
    console.error("Não foi possível restaurar a sessão local.", error);
  }
  renderAuth();
}

function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Não foi possível encerrar a sessão local.", error);
    showToast("Não foi possível encerrar a sessão neste navegador.");
    return;
  }
  currentUser = null;
  document.getElementById("sidebar").classList.remove("open");
  document.querySelector(".mobile-overlay").classList.remove("visible");
  renderAuth();
}

function renderTeacherList() {
  const list = document.getElementById("teacher-list");
  if (!list) return;
  const teachers = users.filter(user => user.role === "teacher");
  list.innerHTML = teachers.length
    ? teachers.map(user => `<div class="teacher-row"><span class="student-initials">${initials(user.name)}</span><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></span></div>`).join("")
    : `<p class="teacher-empty">Nenhum professor cadastrado ainda.</p>`;
}

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return seedRecords.map(record => ({ ...record }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Formato de registros inválido.");
    return parsed;
  } catch (error) {
    console.error("Não foi possível carregar os registros locais.", error);
    return seedRecords.map(record => ({ ...record }));
  }
}

function persistRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Não foi possível salvar os registros locais.", error);
    showToast("Não foi possível salvar. Verifique o espaço disponível no navegador.");
    return false;
  }
  return true;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

function localDate(dateString, options = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!dateString) return "—";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(year, month - 1, day));
}

function statusClass(status) {
  return status === "Resolvida" ? "status-done" : "status-open";
}

function safeRecord(record) {
  return {
    id: escapeHtml(record.id),
    student: escapeHtml(record.student),
    className: escapeHtml(record.className),
    type: escapeHtml(record.type),
    date: escapeHtml(record.date),
    time: escapeHtml(record.time || ""),
    priority: escapeHtml(record.priority),
    status: escapeHtml(record.status),
    description: escapeHtml(record.description),
    actions: escapeHtml(record.actions || ""),
    responsible: escapeHtml(record.responsible || "Mariana Alves")
  };
}

function renderTableRow(source, includeClass = true) {
  const record = safeRecord(source);
  const priority = record.priority.toLocaleLowerCase("pt-BR");
  return `<tr>
    <td><div class="student-cell"><span class="student-initials">${initials(record.student)}</span><span><span class="student-name">${record.student}</span>${includeClass ? `<span class="student-class">${record.className}</span>` : ""}</span></div></td>
    ${includeClass ? `<td>${record.className}</td>` : ""}
    <td><span class="type-pill">${record.type}</span></td>
    <td>${localDate(record.date, { day: "2-digit", month: "short" })}</td>
    ${includeClass ? `<td><span class="priority-pill priority-${priority}">${record.priority}</span></td>` : ""}
    <td><span class="status-pill ${statusClass(record.status)}">${record.status}</span></td>
    <td><button class="row-action" data-view="${record.id}" aria-label="Ver ocorrência de ${record.student}">···</button></td>
  </tr>`;
}

function getMonthRecords() {
  const now = new Date();
  return records.filter(record => {
    const [year, month] = record.date.split("-").map(Number);
    return year === now.getFullYear() && month === now.getMonth() + 1;
  });
}

function renderDashboard() {
  const monthRecords = getMonthRecords();
  document.getElementById("summary-period").textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());
  const open = records.filter(record => record.status !== "Resolvida").length;
  const resolved = records.filter(record => record.status === "Resolvida").length;
  document.getElementById("stat-total").textContent = monthRecords.length;
  document.getElementById("stat-open").textContent = open;
  document.getElementById("stat-resolved").textContent = resolved;
  document.getElementById("stat-total-note").textContent = monthRecords.length ? "Registros no período atual" : "Nenhum registro neste mês";
  document.getElementById("stat-resolved-note").textContent = `${resolved} ${resolved === 1 ? "acompanhamento concluído" : "acompanhamentos concluídos"}`;
  document.getElementById("nav-count").textContent = open;
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || "")).slice(0, 5);
  document.getElementById("recent-table").innerHTML = recent.map(record => renderTableRow(record, false)).join("");
  document.getElementById("recent-empty").classList.toggle("hidden", recent.length > 0);
  document.querySelector("#recent-table").closest(".table-wrap").classList.toggle("hidden", recent.length === 0);

  const counts = categories.map(type => ({ type, count: monthRecords.filter(record => record.type === type).length }));
  const max = Math.max(1, ...counts.map(item => item.count));
  document.getElementById("type-chart").innerHTML = counts.slice(0, 5).map((item, index) =>
    `<div class="chart-column"><div class="chart-bar" style="--bar-scale:${Math.max(0.08, item.count / max)};background:${chartColors[index]}"></div><span class="chart-label">${item.type === "Convivência" ? "Conviv." : item.type === "Acadêmica" ? "Acad." : item.type === "Presença" ? "Pres." : item.type === "Bem-estar" ? "Bem-estar" : "Patrim."}</span></div>`
  ).join("");
  document.getElementById("type-legend").innerHTML = counts.filter(item => item.count > 0).map(item => {
    const index = categories.indexOf(item.type);
    return `<div class="legend-item"><span class="legend-dot" style="background:${chartColors[index]}"></span>${item.type}<span class="legend-count">${item.count}</span></div>`;
  }).join("") || `<span class="legend-item">Sem registros neste mês</span>`;
}

function filteredRecords() {
  const query = document.getElementById("search-input").value.trim().toLocaleLowerCase("pt-BR");
  const status = document.getElementById("filter-status").value;
  const type = document.getElementById("filter-type").value;
  return [...records]
    .filter(record => status === "todas" || record.status === status)
    .filter(record => type === "todos" || record.type === type)
    .filter(record => !query || [record.student, record.className, record.type, record.description].some(value => (value || "").toLocaleLowerCase("pt-BR").includes(query)))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || ""));
}

function renderList() {
  const filtered = filteredRecords();
  document.getElementById("all-table").innerHTML = filtered.map(record => renderTableRow(record, true)).join("");
  document.getElementById("list-empty").classList.toggle("hidden", filtered.length > 0);
  document.querySelector("#all-table").closest(".table-wrap").classList.toggle("hidden", filtered.length === 0);
  document.getElementById("results-count").textContent = `${filtered.length} ${filtered.length === 1 ? "registro" : "registros"}`;
}

function renderReports() {
  const open = records.filter(record => record.status !== "Resolvida").length;
  const resolved = records.length - open;
  document.getElementById("report-total").textContent = records.length;
  document.getElementById("report-open").textContent = open;
  document.getElementById("report-resolved").textContent = resolved;
  document.getElementById("report-breakdown").innerHTML = categories.map((type, index) => {
    const count = records.filter(record => record.type === type).length;
    const width = records.length ? Math.round(count / records.length * 100) : 0;
    return `<div class="breakdown-row"><span>${type}</span><div class="breakdown-track"><div class="breakdown-fill" style="width:${width}%;background:${chartColors[index]}"></div></div><span class="breakdown-count">${count}</span></div>`;
  }).join("");
  document.getElementById("priority-breakdown").innerHTML = ["Baixa", "Média", "Alta"].map(priority => {
    const count = records.filter(record => record.priority === priority).length;
    return `<div class="priority-card"><strong>${count}</strong><span>${priority}</span></div>`;
  }).join("");
}

async function handleAuthSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLocaleLowerCase("pt-BR");
  const password = String(formData.get("password") || "");

  if (form.id === "auth-setup-form" || form.id === "teacher-form") {
    if (!passwordIsValid(password)) {
      showToast("A senha precisa cumprir todos os requisitos.");
      return;
    }
    if (users.some(user => user.email === email)) {
      if (form.id === "auth-setup-form") renderAuth("Este e-mail já possui uma conta.");
      else showToast("Já existe uma conta com esse e-mail.");
      return;
    }
    if (form.id === "teacher-form" && currentUser?.role !== "coordinator") {
      showToast("Somente a coordenação pode cadastrar professores.");
      return;
    }
    try {
      const credentials = await hashPassword(password);
      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        role: form.id === "auth-setup-form" ? "coordinator" : "teacher",
        ...credentials
      };
      const nextUsers = [...users, user];
      if (!saveUsers(nextUsers)) return;
      if (user.role === "coordinator") enterApp(user);
      else {
        form.reset();
        renderTeacherList();
        showToast("Professor cadastrado.");
      }
    } catch (error) {
      console.error("Não foi possível criar a conta.", error);
      showToast(error.message || "Não foi possível criar a conta.");
    }
    return;
  }

  if (form.id === "auth-login-form") {
    const user = users.find(item => item.email === email);
    if (!user) {
      renderAuth("E-mail ou senha inválidos.");
      return;
    }
    try {
      const credentials = await hashPassword(password, user.salt);
      const matches = credentials.hash === user.hash;
      if (!matches) {
        renderAuth("E-mail ou senha inválidos.");
        return;
      }
      enterApp(user);
    } catch (error) {
      console.error("Não foi possível validar a senha.", error);
      renderAuth(error.message || "Não foi possível validar a senha.");
    }
  }
}

function renderAll() {
  renderDashboard();
  renderList();
  renderReports();
}

function showPage(page) {
  const names = { inicio: "Visão geral", ocorrencias: "Ocorrências", relatorios: "Relatórios", professores: "Professores" };
  if (page === "professores" && currentUser?.role !== "coordinator") return;
  document.querySelectorAll(".page-view").forEach(view => view.classList.toggle("visible", view.id === `page-${page}`));
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  document.getElementById("breadcrumb-current").textContent = names[page] || names.inicio;
  document.getElementById("sidebar").classList.remove("open");
  document.querySelector(".mobile-overlay").classList.remove("visible");
  if (page === "ocorrencias") renderList();
  if (page === "professores") renderTeacherList();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.add("hidden");
  document.body.style.overflow = "";
}

function openModal(content) {
  const backdrop = document.getElementById("modal-backdrop");
  document.getElementById("modal").innerHTML = content;
  backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  const firstInput = backdrop.querySelector("input,button");
  if (firstInput) firstInput.focus();
}

function openForm(record = null) {
  const editing = Boolean(record);
  const current = record || {};
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const typeOptions = categories.map(type => `<option ${current.type === type ? "selected" : ""}>${type}</option>`).join("");
  openModal(`<form id="occurrence-form">
    <div class="modal-header"><div><h2 id="modal-title">${editing ? "Editar ocorrência" : "Novo registro"}</h2><p>Registre os fatos com clareza e cuidado.</p></div><button type="button" class="close-modal" data-close aria-label="Fechar">×</button></div>
    <div class="form-body">
      <div class="field"><label for="student">Nome do estudante *</label><input id="student" name="student" required maxlength="100" placeholder="Ex.: Ana Clara Souza" value="${escapeHtml(current.student || "")}" /></div>
      <div class="field"><label for="className">Turma *</label><input id="className" name="className" required maxlength="30" placeholder="Ex.: 8º A" value="${escapeHtml(current.className || "")}" /></div>
      <div class="field"><label for="type">Tipo de ocorrência *</label><select id="type" name="type" required>${typeOptions}</select></div>
      <div class="field"><label for="priority">Prioridade</label><select id="priority" name="priority"><option ${current.priority === "Baixa" ? "selected" : ""}>Baixa</option><option ${current.priority === "Média" || !current.priority ? "selected" : ""}>Média</option><option ${current.priority === "Alta" ? "selected" : ""}>Alta</option></select></div>
      <div class="field"><label for="date">Data *</label><input type="date" id="date" name="date" required max="${todayString}" value="${escapeHtml(current.date || todayString)}" /></div>
      <div class="field"><label for="time">Horário</label><input type="time" id="time" name="time" value="${escapeHtml(current.time || "")}" /></div>
      <div class="field full"><label for="description">Descrição dos fatos *</label><textarea id="description" name="description" required maxlength="2000" placeholder="Descreva o que aconteceu de forma objetiva, sem julgamentos.">${escapeHtml(current.description || "")}</textarea><span class="form-hint">Registre somente as informações necessárias ao acompanhamento escolar.</span></div>
      <div class="field full"><label for="actions">Encaminhamentos e próximos passos</label><textarea id="actions" name="actions" maxlength="1500" placeholder="Quais ações foram tomadas ou precisam acontecer?">${escapeHtml(current.actions || "")}</textarea></div>
      <div class="field full"><label for="status">Acompanhamento</label><select id="status" name="status"><option ${current.status === "Em acompanhamento" || !current.status ? "selected" : ""}>Em acompanhamento</option><option ${current.status === "Resolvida" ? "selected" : ""}>Resolvida</option></select></div>
    </div>
    <div class="form-footer"><span class="privacy-note"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg> Registro privado neste dispositivo</span><div class="form-actions"><button type="button" class="secondary-button" data-close>Cancelar</button><button class="primary-button" type="submit">${editing ? "Salvar alterações" : "Salvar registro"}</button></div></div>
  </form>`);
  document.getElementById("occurrence-form").addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updated = {
      ...current,
      id: current.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      student: String(formData.get("student")).trim(),
      className: String(formData.get("className")).trim(),
      type: String(formData.get("type")),
      priority: String(formData.get("priority")),
      date: String(formData.get("date")),
      time: String(formData.get("time")),
      description: String(formData.get("description")).trim(),
      actions: String(formData.get("actions")).trim(),
      status: String(formData.get("status")),
      responsible: current.responsible || currentUser?.name || "Coordenação"
    };
    const previous = records;
    records = editing ? records.map(item => item.id === current.id ? updated : item) : [updated, ...records];
    if (!persistRecords()) { records = previous; return; }
    closeModal();
    renderAll();
    showToast(editing ? "Alterações salvas." : "Ocorrência registrada.");
  });
}

function openDetails(id) {
  const record = records.find(item => item.id === id);
  if (!record) return;
  const item = safeRecord(record);
  const editButton = `<button type="button" class="secondary-button" data-edit="${item.id}">Editar registro</button>`;
  const resolveButton = item.status !== "Resolvida"
    ? `<button type="button" class="primary-button" data-resolve="${item.id}">Marcar como resolvida</button>`
    : `<button type="button" class="primary-button" data-reopen="${item.id}">Reabrir acompanhamento</button>`;
  openModal(`<div class="modal-header"><div><p class="eyebrow">DETALHES DO REGISTRO</p><h2 id="modal-title">${item.type}</h2></div><button type="button" class="close-modal" data-close aria-label="Fechar">×</button></div>
    <div class="detail-body">
      <div class="detail-student"><span class="detail-avatar">${initials(item.student)}</span><div><strong>${item.student}</strong><span>${item.className} · Registrado por ${item.responsible}</span></div></div>
      <div class="detail-meta"><div><label>Data e horário</label><strong>${localDate(item.date)}${item.time ? ` · ${item.time}` : ""}</strong></div><div><label>Prioridade</label><strong><span class="priority-pill priority-${item.priority.toLocaleLowerCase("pt-BR")}">${item.priority}</span></strong></div><div><label>Status</label><strong><span class="status-pill ${statusClass(item.status)}">${item.status}</span></strong></div><div><label>Tipo</label><strong>${item.type}</strong></div></div>
      <div class="detail-description"><strong>Descrição dos fatos</strong>${item.description}</div>
      ${item.actions ? `<div class="detail-section"><strong>Encaminhamentos e próximos passos</strong>${item.actions}</div>` : ""}
    </div><div class="form-footer detail-footer"><button type="button" class="danger-button" data-delete="${item.id}">Excluir</button>${editButton}${resolveButton}</div>`);
}

function updateStatus(id, status) {
  const previous = records;
  records = records.map(record => record.id === id ? { ...record, status } : record);
  if (!persistRecords()) { records = previous; return; }
  closeModal();
  renderAll();
  showToast(status === "Resolvida" ? "Acompanhamento concluído." : "Acompanhamento reaberto.");
}

function deleteRecord(id) {
  const record = records.find(item => item.id === id);
  if (!record || !window.confirm(`Excluir o registro de ${record.student}? Esta ação não pode ser desfeita.`)) return;
  const previous = records;
  records = records.filter(item => item.id !== id);
  if (!persistRecords()) { records = previous; return; }
  closeModal();
  renderAll();
  showToast("Registro excluído.");
}

function exportCsv() {
  if (!records.length) {
    showToast("Não há registros para exportar.");
    return;
  }
  const columns = ["Estudante", "Turma", "Tipo", "Data", "Horário", "Prioridade", "Status", "Descrição", "Encaminhamentos", "Responsável"];
  const values = records.map(record => [record.student, record.className, record.type, record.date, record.time, record.priority, record.status, record.description, record.actions, record.responsible]);
  const csv = [columns, ...values].map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ocorrencias-escolares.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Relatório CSV exportado.");
}

document.addEventListener("click", event => {
  const passwordToggle = event.target.closest("[data-toggle-password]");
  if (passwordToggle) {
    const input = document.getElementById(passwordToggle.dataset.togglePassword);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
      passwordToggle.textContent = input.type === "password" ? "Mostrar" : "Ocultar";
      passwordToggle.setAttribute("aria-label", input.type === "password" ? "Mostrar senha" : "Ocultar senha");
    }
    return;
  }
  if (event.target.closest("#logout-button")) { logout(); return; }
  const pageButton = event.target.closest("[data-page]");
  const newButton = event.target.closest('[data-action="new"]');
  const viewButton = event.target.closest("[data-view]");
  const editButton = event.target.closest("[data-edit]");
  const resolveButton = event.target.closest("[data-resolve]");
  const reopenButton = event.target.closest("[data-reopen]");
  const deleteButton = event.target.closest("[data-delete]");
  if (pageButton) { event.preventDefault(); showPage(pageButton.dataset.page); }
  else if (newButton) openForm();
  else if (viewButton) openDetails(viewButton.dataset.view);
  else if (editButton) { const record = records.find(item => item.id === editButton.dataset.edit); if (record) openForm(record); }
  else if (resolveButton) updateStatus(resolveButton.dataset.resolve, "Resolvida");
  else if (reopenButton) updateStatus(reopenButton.dataset.reopen, "Em acompanhamento");
  else if (deleteButton) deleteRecord(deleteButton.dataset.delete);
  else if (event.target.closest("[data-close]") || event.target.id === "modal-backdrop") closeModal();
});

document.addEventListener("submit", event => {
  if (["auth-setup-form", "auth-login-form", "teacher-form"].includes(event.target.id)) {
    event.preventDefault();
    handleAuthSubmit(event);
  }
});

document.addEventListener("input", event => {
  if (event.target.matches("#teacher-password")) refreshPasswordRules(event.target);
});

document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => showPage(button.dataset.page)));
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => showPage(button.dataset.page)));
document.getElementById("search-input").addEventListener("input", renderList);
document.getElementById("filter-status").addEventListener("change", renderList);
document.getElementById("filter-type").addEventListener("change", renderList);
document.getElementById("clear-filters").addEventListener("click", () => {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-status").value = "todas";
  document.getElementById("filter-type").value = "todos";
  renderList();
});
document.getElementById("export-button").addEventListener("click", exportCsv);
document.getElementById("mobile-menu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.add("open");
  document.querySelector(".mobile-overlay").classList.add("visible");
});
document.getElementById("help-button").addEventListener("click", () => {
  openModal(`<div class="modal-header"><div><p class="eyebrow">BOAS PRÁTICAS</p><h2 id="modal-title">Um registro que acolhe</h2><p>Registre com cuidado e respeito à privacidade.</p></div><button type="button" class="close-modal" data-close aria-label="Fechar">×</button></div><div class="detail-body"><div class="detail-section"><strong>Descreva os fatos com objetividade</strong>Prefira informações claras sobre o que aconteceu, quando e onde. Evite julgamentos, rótulos ou conclusões precipitadas.</div><div class="detail-section"><strong>Cuide da privacidade</strong>Inclua somente os dados necessários para o acompanhamento da situação. Compartilhe os registros apenas com as pessoas responsáveis.</div><div class="detail-section"><strong>Acompanhe os próximos passos</strong>Registre os encaminhamentos combinados e atualize o status quando o acompanhamento for concluído.</div></div><div class="form-footer detail-footer"><button class="primary-button" data-close>Entendi</button></div>`);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    document.getElementById("sidebar").classList.remove("open");
    document.querySelector(".mobile-overlay").classList.remove("visible");
  }
});

const overlay = document.createElement("div");
overlay.className = "mobile-overlay";
overlay.addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("open");
  overlay.classList.remove("visible");
});
document.body.append(overlay);

const now = new Date();
const hour = now.getHours();
document.getElementById("today-label").textContent = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(now);
restoreSession();
