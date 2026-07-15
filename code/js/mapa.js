/* =========================================================
   mapa.js — Mapa interativo (Leaflet + OpenStreetMap)
   -----------------------------------------------------------
   >>> Em produção:
   - Substituir `escolas` de dados.js por fetch de API/JSON real.
   - Substituir os círculos fictícios de inundação/deslizamento
     por camadas GeoJSON reais:
       fetch("data/inundacao.geojson")
         .then(r => r.json())
         .then(geo => L.geoJSON(geo, {style: {...}}).addTo(map));
   ========================================================= */

// Centro aproximado de São Vicente/SP
const CENTRO_SV = [-23.963, -46.391];

const map = L.map('mapa').setView(CENTRO_SV, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

/* --------- Cores por nível de risco --------- */
function corPorRisco(nivel) {
  switch (nivel) {
    case "Muito Alto": return "#6A1B9A";
    case "Alto":       return "#C62828";
    case "Médio":      return "#F9A825";
    case "Baixo":      return "#2E7D32";
    default:           return "#607D8B";
  }
}

/* --------- Camadas ---------- */
const camadaEscolas       = L.layerGroup().addTo(map);
const camadaInundacao     = L.layerGroup().addTo(map);
const camadaDeslizamento  = L.layerGroup().addTo(map);

/* --------- Marcadores de escolas --------- */
function criarMarcadorEscola(escola) {
  const nivel = escola.classificacaoIvec;
  const icone = L.divIcon({
    className: 'marcador-escola',
    html: `<div style="
      background:${corPorRisco(nivel)};
      width:22px;height:22px;border-radius:50%;
      border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:11px;font-weight:bold;
    " title="Escola: ${escola.nome}">🏫</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const popup = `
    <div style="min-width:220px">
      <h3 style="margin:0 0 8px;color:#003F7D">${escola.nome}</h3>
      <p style="margin:2px 0"><strong>Bairro:</strong> ${escola.bairro}</p>
      <p style="margin:2px 0"><strong>Alunos:</strong> ${escola.alunos}</p>
      <p style="margin:2px 0"><strong>Risco inundação:</strong>
        <span style="color:${corPorRisco(escola.riscoInundacao)}">${escola.riscoInundacao}</span></p>
      <p style="margin:2px 0"><strong>Risco deslizamento:</strong>
        <span style="color:${corPorRisco(escola.riscoDeslizamento)}">${escola.riscoDeslizamento}</span></p>
      <p style="margin:2px 0"><strong>IVEC:</strong> ${escola.ivec} (${escola.classificacaoIvec})</p>
      <p style="margin:2px 0"><strong>Ocorrências:</strong> ${escola.ocorrencias}</p>
      <button class="btn" style="margin-top:8px;padding:6px 12px;font-size:.85rem"
        onclick="alert('Detalhes da escola ${escola.nome.replace(/'/g,"")} — Aqui iria uma página/modal com histórico completo.')">
        Ver detalhes
      </button>
    </div>
  `;
  return L.marker([escola.latitude, escola.longitude], { icon: icone }).bindPopup(popup);
}

/* --------- Renderização inicial --------- */
function renderizarEscolas(lista) {
  camadaEscolas.clearLayers();
  lista.forEach(e => criarMarcadorEscola(e).addTo(camadaEscolas));
}

function renderizarInundacao() {
  camadaInundacao.clearLayers();
  OER.areasInundacao.forEach(a => {
    L.circle(a.centro, {
      radius: a.raio, color: '#1976D2', fillColor: '#64B5F6', fillOpacity: 0.35, weight: 2
    }).bindTooltip(`💧 ${a.nome}`).addTo(camadaInundacao);
  });
}

function renderizarDeslizamento() {
  camadaDeslizamento.clearLayers();
  OER.areasDeslizamento.forEach(a => {
    L.circle(a.centro, {
      radius: a.raio, color: '#795548', fillColor: '#A1887F', fillOpacity: 0.4, weight: 2
    }).bindTooltip(`⛰️ ${a.nome}`).addTo(camadaDeslizamento);
  });
}

renderizarEscolas(OER.escolas);
renderizarInundacao();
renderizarDeslizamento();

/* --------- Preencher filtro de bairros --------- */
const selBairro = document.getElementById('filtroBairro');
const bairros = [...new Set(OER.escolas.map(e => e.bairro))].sort();
bairros.forEach(b => {
  const opt = document.createElement('option');
  opt.value = b; opt.textContent = b;
  selBairro.appendChild(opt);
});

/* --------- Aplicar filtros --------- */
function aplicarFiltros() {
  const bairro = document.getElementById('filtroBairro').value;
  const risco = document.getElementById('filtroRisco').value;
  const soComOcorr = document.getElementById('filtroOcorrencias').checked;

  let lista = OER.escolas.slice();
  if (bairro) lista = lista.filter(e => e.bairro === bairro);
  if (risco) lista = lista.filter(e => e.classificacaoIvec === risco);
  if (soComOcorr) lista = lista.filter(e => e.ocorrencias > 0);

  renderizarEscolas(lista);

  const mostrarInund = document.getElementById('camadaInundacao').checked;
  const mostrarDesliz = document.getElementById('camadaDeslizamento').checked;

  if (mostrarInund) { if (!map.hasLayer(camadaInundacao)) map.addLayer(camadaInundacao); }
  else map.removeLayer(camadaInundacao);

  if (mostrarDesliz) { if (!map.hasLayer(camadaDeslizamento)) map.addLayer(camadaDeslizamento); }
  else map.removeLayer(camadaDeslizamento);

  document.getElementById('contagemEscolas').textContent =
    `${lista.length} escola(s) exibida(s)`;
}

['filtroBairro','filtroRisco','filtroOcorrencias','camadaInundacao','camadaDeslizamento']
  .forEach(id => document.getElementById(id).addEventListener('change', aplicarFiltros));

document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('filtroBairro').value = '';
  document.getElementById('filtroRisco').value = '';
  document.getElementById('filtroOcorrencias').checked = false;
  document.getElementById('camadaInundacao').checked = true;
  document.getElementById('camadaDeslizamento').checked = true;
  aplicarFiltros();
});

aplicarFiltros();
