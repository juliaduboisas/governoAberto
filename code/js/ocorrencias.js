/* =========================================================
   ocorrencias.js — Formulário e listagem de ocorrências
   -----------------------------------------------------------
   Protótipo sem servidor: os dados iniciais vêm embutidos em
   dados.js (OER.ocorrenciasIniciais), não de um fetch de CSV.
   Novas ocorrências ficam em localStorage durante a sessão.
   Use "Baixar CSV atualizado" para exportar o que foi cadastrado.
   ========================================================= */


const CHAVE_STORAGE = 'oer_ocorrencias';
const COLS = ['escola', 'data', 'diasPerdidos', 'motivo', 'descricao'];


/* --------- Popular select de escolas --------- */
const selEscola = document.getElementById('escola');
OER.escolas.forEach(e => {
  const opt = document.createElement('option');
  opt.value = e.nome;
  opt.textContent = `${e.nome} — ${e.bairro}`;
  selEscola.appendChild(opt);
});


/* --------- Carregar ocorrências (seed embutido + sessão) --------- */
async function carregarOcorrencias() {
  const salvas = localStorage.getItem(CHAVE_STORAGE);
  if (salvas) return JSON.parse(salvas);

  const lista = OER.ocorrenciasIniciais.map(o => ({
    id: o.id,
    escola: o.escola,
    data: o.data,
    diasPerdidos: Number(o.diasPerdidos),
    motivo: o.motivo,
    descricao: `Responsável: ${o.responsavel} — Status: ${o.status}`
  }));
  salvarOcorrencias(lista);
  return lista;
}


function salvarOcorrencias(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}


/* --------- Renderizar tabela --------- */
async function renderizarTabela() {
  const lista = await carregarOcorrencias();
  const tbody = document.querySelector('#tabelaOcorrencias tbody');
  tbody.innerHTML = '';
  lista.slice().reverse().forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.escola}</td>
      <td>${o.data}</td>
      <td>${o.diasPerdidos}</td>
      <td>${o.motivo}</td>
      <td>${o.descricao}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('contagemOcorrencias').textContent = lista.length;
}


/* --------- Submissão do formulário --------- */
const form = document.getElementById('formOcorrencia');
const msg = document.getElementById('mensagemForm');


form.addEventListener('submit', async function (e) {
  e.preventDefault();
  msg.className = ''; msg.textContent = '';


  const dados = new FormData(form);


  const obrigatorios = ['escola', 'data', 'diasPerdidos', 'motivo'];
  for (const c of obrigatorios) {
    if (!dados.get(c) || String(dados.get(c)).trim() === '') {
      msg.className = 'mensagem erro';
      msg.textContent = '⚠️ Preencha todos os campos obrigatórios (marcados com *).';
      return;
    }
  }


  const lista = await carregarOcorrencias();
  const nova = {
    id: lista.length ? Math.max(...lista.map(x => x.id)) + 1 : 1,
    escola: dados.get('escola'),
    data: dados.get('data'),
    diasPerdidos: Number(dados.get('diasPerdidos')),
    motivo: dados.get('motivo'),
    descricao: dados.get('descricao') || ''
  };
  lista.push(nova);
  salvarOcorrencias(lista);
  await renderizarTabela();


  msg.className = 'mensagem sucesso';
  msg.textContent = `✅ Ocorrência registrada com sucesso! Protocolo #${nova.id}.`;
  form.reset();
  window.scrollTo({ top: msg.offsetTop - 80, behavior: 'smooth' });
});


/* --------- Baixar CSV atualizado (substitui data/ocorrencias.csv manualmente) --------- */
document.getElementById('btnExportarCsv').addEventListener('click', async () => {
  const lista = await carregarOcorrencias();
  const linhas = [COLS.join(';')];
  lista.forEach(o => {
    linhas.push(COLS.map(c => `"${(o[c] ?? '').toString().replace(/"/g, '""')}"`).join(';'));
  });
  const blob = new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ocorrencias.csv';
  a.click();
  URL.revokeObjectURL(url);
});


/* --------- Botão limpar sessão (volta a ler o CSV original) --------- */
document.getElementById('btnLimparStorage').addEventListener('click', () => {
  if (confirm('Isso descarta as ocorrências adicionadas nesta sessão e volta a ler o CSV original. Continuar?')) {
    localStorage.removeItem(CHAVE_STORAGE);
    renderizarTabela();
  }
});


renderizarTabela();