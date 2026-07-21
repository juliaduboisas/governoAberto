/* =========================================================
   relatorios.js — Geração e exportação de relatórios
   -----------------------------------------------------------
   Em produção:
   - Filtragem e agregação devem ser feitas no backend, com
     consultas SQL/Athena/BI já otimizadas.
   - Exportação PDF pode usar bibliotecas (jsPDF, pdfmake) ou
     ferramenta de impressão do navegador (window.print).
   ========================================================= */

/* --------- Popular filtros --------- */
const selEscola = document.getElementById('filtroEscola');
const selBairro = document.getElementById('filtroBairroRel');
const bairrosUn = [...new Set(OER.escolas.map(e => e.bairro))].sort();

OER.escolas.forEach(e => {
  const o = document.createElement('option');
  o.value = e.nome; o.textContent = e.nome;
  selEscola.appendChild(o);
});
bairrosUn.forEach(b => {
  const o = document.createElement('option');
  o.value = b; o.textContent = b;
  selBairro.appendChild(o);
});

/* --------- Ocorrências reais (mesma fonte usada em ocorrencias.html) --------- */
const CHAVE_STORAGE_OCORRENCIAS = 'oer_ocorrencias';

function obterOcorrenciasRegistradas() {
  const salvas = localStorage.getItem(CHAVE_STORAGE_OCORRENCIAS);
  return salvas ? JSON.parse(salvas) : [];
}

function renderizarTabelaOcorrencias(lista) {
  const tbody = document.querySelector('#tabelaOcorrenciasRel tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  lista.slice().reverse().forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.escola ?? ''}</td>
      <td>${o.data ?? ''}</td>
      <td>${o.diasPerdidos ?? ''}</td>
      <td>${o.motivo ?? ''}</td>
      <td>${o.descricao ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });
  const contagem = document.getElementById('contagemOcorrRel');
  if (contagem) contagem.textContent = lista.length;
}

function filtrarOcorrenciasAtuais() {
  const escola = document.getElementById('filtroEscola').value;
  const bairro = document.getElementById('filtroBairroRel').value;
  const motivo = document.getElementById('filtroMotivo').value;
  const inicio = document.getElementById('periodoInicio').value;
  const fim = document.getElementById('periodoFim').value;

  let lista = obterOcorrenciasRegistradas();

  if (escola) lista = lista.filter(o => o.escola === escola);
  if (bairro) {
    const nomesDoBairro = OER.escolas.filter(e => e.bairro === bairro).map(e => e.nome);
    lista = lista.filter(o => nomesDoBairro.includes(o.escola));
  }
  if (motivo) lista = lista.filter(o => o.motivo === motivo);
  if (inicio) lista = lista.filter(o => o.data >= inicio);
  if (fim) lista = lista.filter(o => o.data <= fim);

  return lista;
}

function aplicarFiltrosOcorrencias() {
  renderizarTabelaOcorrencias(filtrarOcorrenciasAtuais());
}

/* --------- Renderizar tabela resumo --------- */
function renderizarTabelaResumo(lista) {
  const tbody = document.querySelector('#tabelaResumo tbody');
  tbody.innerHTML = '';
  lista.forEach(e => {
    const tr = document.createElement('tr');
    const badge = e.classificacaoIvec.toLowerCase().replace(' ','-');
    tr.innerHTML = `
      <td>${e.nome}</td>
      <td>${e.bairro}</td>
      <td>${e.ocorrencias}</td>
      <td>${e.diasPerdidos}</td>
      <td><span class="badge ${e.riscoInundacao.toLowerCase()}">${e.riscoInundacao}</span></td>
      <td><span class="badge ${e.riscoDeslizamento.toLowerCase()}">${e.riscoDeslizamento}</span></td>
      <td>${e.alunos}</td>
      <td><span class="badge ${badge}">${e.ivec} (${e.classificacaoIvec})</span></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('contagemLinhas').textContent = lista.length;
}

/* --------- Filtro --------- */
function aplicar() {
  const escola = document.getElementById('filtroEscola').value;
  const bairro = document.getElementById('filtroBairroRel').value;
  const risco  = document.getElementById('filtroNivel').value;

  let lista = OER.escolas.slice();
  if (escola) lista = lista.filter(e => e.nome === escola);
  if (bairro) lista = lista.filter(e => e.bairro === bairro);
  if (risco)  lista = lista.filter(e => e.classificacaoIvec === risco);

  renderizarTabelaResumo(lista);
  aplicarFiltrosOcorrencias();

  const totalOcorr = filtrarOcorrenciasAtuais().length;
  const msg = document.getElementById('mensagemRel');
  msg.className = 'mensagem info';
  msg.textContent = `📄 Relatório gerado com ${lista.length} escola(s) e ${totalOcorr} ocorrência(s).`;
}

document.getElementById('btnGerar').addEventListener('click', aplicar);

/* --------- Exportar CSV (resumo por escola) --------- */
document.getElementById('btnCsv').addEventListener('click', () => {
  const cols = ['nome','bairro','ocorrencias','diasPerdidos','riscoInundacao','riscoDeslizamento','alunos','ivec','classificacaoIvec'];
  const linhas = ['escola;bairro;ocorrencias;dias_perdidos;risco_inundacao;risco_deslizamento;alunos_afetados;ivec;classificacao'];

  const lista = filtrarEscolasAtuais();
  lista.forEach(e => {
    linhas.push(cols.map(c => `"${(e[c] ?? '').toString().replace(/"/g,'""')}"`).join(';'));
  });
  const blob = new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'relatorio_observatorio.csv'; a.click();
  URL.revokeObjectURL(url);
});

/* --------- Exportar CSV (ocorrências reais) --------- */
document.getElementById('btnCsvOcorrencias').addEventListener('click', () => {
  const cols = ['escola', 'data', 'diasPerdidos', 'motivo', 'descricao'];
  const linhas = [cols.join(';')];
  filtrarOcorrenciasAtuais().forEach(o => {
    linhas.push(cols.map(c => `"${(o[c] ?? '').toString().replace(/"/g, '""')}"`).join(';'));
  });
  const blob = new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ocorrencias_relatorio.csv';
  a.click();
  URL.revokeObjectURL(url);
});

/* --------- Exportar PDF (via impressão) --------- */
document.getElementById('btnPdf').addEventListener('click', () => window.print());

/* --------- Helper para pegar lista atual --------- */
function filtrarEscolasAtuais() {
  const escola = document.getElementById('filtroEscola').value;
  const bairro = document.getElementById('filtroBairroRel').value;
  const risco  = document.getElementById('filtroNivel').value;
  let lista = OER.escolas.slice();
  if (escola) lista = lista.filter(e => e.nome === escola);
  if (bairro) lista = lista.filter(e => e.bairro === bairro);
  if (risco)  lista = lista.filter(e => e.classificacaoIvec === risco);
  return lista;
}

renderizarTabelaResumo(OER.escolas);
renderizarTabelaOcorrencias(obterOcorrenciasRegistradas());