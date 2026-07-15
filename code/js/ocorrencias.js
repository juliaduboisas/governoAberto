/* =========================================================
   ocorrencias.js — Formulário e listagem de ocorrências
   -----------------------------------------------------------
   Em produção:
   - Substituir localStorage por chamada a API (POST/GET).
   - Exemplos: Firebase, Supabase, planilha conectada,
     backend próprio com banco de dados relacional.
   ========================================================= */

const CHAVE_STORAGE = 'oer_ocorrencias';

/* --------- Popular select de escolas --------- */
const selEscola = document.getElementById('escola');
OER.escolas.forEach(e => {
  const opt = document.createElement('option');
  opt.value = e.nome;
  opt.dataset.bairro = e.bairro;
  opt.textContent = `${e.nome} — ${e.bairro}`;
  selEscola.appendChild(opt);
});

/* --------- Recuperar ocorrências salvas --------- */
function carregarOcorrencias() {
  const salvas = localStorage.getItem(CHAVE_STORAGE);
  if (salvas) return JSON.parse(salvas);
  // primeira execução: seed com iniciais fictícias
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(OER.ocorrenciasIniciais));
  return OER.ocorrenciasIniciais.slice();
}

function salvarOcorrencias(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

/* --------- Renderizar tabela --------- */
function renderizarTabela() {
  const lista = carregarOcorrencias();
  const tbody = document.querySelector('#tabelaOcorrencias tbody');
  tbody.innerHTML = '';
  lista.slice().reverse().forEach(o => {
    const badgeClass = o.status === 'Validado' ? 'validado'
                     : o.status === 'Em análise' ? 'analise' : 'recebido';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.escola}</td>
      <td>${o.data}</td>
      <td>${o.motivo}</td>
      <td>${o.diasPerdidos}</td>
      <td>${o.transporteImpactado}</td>
      <td>${o.responsavel}</td>
      <td><span class="badge ${badgeClass}">${o.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('contagemOcorrencias').textContent = lista.length;
}

/* --------- Submissão do formulário --------- */
const form = document.getElementById('formOcorrencia');
const msg = document.getElementById('mensagemForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  msg.className = ''; msg.textContent = '';

  const dados = new FormData(form);

  // Validação obrigatória
  const obrigatorios = ['escola','data','interrompidas','diasPerdidos','motivo','responsavel'];
  for (const c of obrigatorios) {
    if (!dados.get(c) || String(dados.get(c)).trim() === '') {
      msg.className = 'mensagem erro';
      msg.textContent = '⚠️ Preencha todos os campos obrigatórios (marcados com *).';
      return;
    }
  }

  const escolaSelecionada = OER.escolas.find(e => e.nome === dados.get('escola'));
  const bairro = escolaSelecionada ? escolaSelecionada.bairro : '';

  const lista = carregarOcorrencias();
  const nova = {
    id: lista.length ? Math.max(...lista.map(x => x.id)) + 1 : 1,
    escola: dados.get('escola'),
    bairro,
    data: dados.get('data'),
    motivo: dados.get('motivo'),
    diasPerdidos: Number(dados.get('diasPerdidos')),
    transporteImpactado: dados.get('transporte') || 'Não',
    acessoImpactado: dados.get('acesso') || 'Não',
    danoFisico: dados.get('dano') || 'Não',
    descricao: dados.get('descricao') || '',
    responsavel: dados.get('responsavel'),
    cargo: dados.get('cargo') || '',
    email: dados.get('email') || '',
    // Regra: toda nova ocorrência entra como "Recebido"
    status: 'Recebido'
  };
  lista.push(nova);
  salvarOcorrencias(lista);
  renderizarTabela();

  msg.className = 'mensagem sucesso';
  msg.textContent = `✅ Ocorrência registrada com sucesso! Protocolo #${nova.id}.`;
  form.reset();
  window.scrollTo({ top: msg.offsetTop - 80, behavior: 'smooth' });
});

/* --------- Exportar CSV --------- */
document.getElementById('btnExportarCsv').addEventListener('click', () => {
  const lista = carregarOcorrencias();
  const cols = ['escola','bairro','data','motivo','diasPerdidos','transporteImpactado','acessoImpactado','responsavel','status'];
  const linhas = [cols.join(';')];
  lista.forEach(o => {
    linhas.push(cols.map(c => `"${(o[c] ?? '').toString().replace(/"/g,'""')}"`).join(';'));
  });
  const blob = new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ocorrencias_observatorio.csv';
  a.click();
  URL.revokeObjectURL(url);
});

/* --------- Botão limpar (apenas para demonstração) --------- */
document.getElementById('btnLimparStorage').addEventListener('click', () => {
  if (confirm('Isso apagará todas as ocorrências registradas neste navegador. Continuar?')) {
    localStorage.removeItem(CHAVE_STORAGE);
    renderizarTabela();
  }
});

renderizarTabela();
