/* =========================================================
   dados.js — Base fictícia do Observatório Educação Resiliente
   -----------------------------------------------------------
   >>> COMO SUBSTITUIR POR DADOS REAIS <<<
   1) Escolas: substituir o array `escolas` por dados vindos de:
        - Excel da Secretaria da Educação convertido para JSON
        - API pública (ex.: base do Censo Escolar / INEP)
        - Fetch de um arquivo /data/escolas.json
      Colunas esperadas na base real:
        id_escola, nome_escola, bairro, endereco,
        latitude, longitude, quantidade_alunos
   2) Ocorrências: em produção, virão de uma API/BD (ex.: Supabase,
      Firebase, planilha conectada). Aqui usamos localStorage.
   3) Áreas de inundação/deslizamento: shapefiles municipais
      convertidos para GeoJSON com QGIS ou Mapshaper.
   4) População: base do Censo IBGE por setor censitário.
   ========================================================= */

/* --------- ESCOLAS (dados fictícios) --------- */
const escolas = [
  {
    id: 1,
    nome: "EMEF João Paulo II",
    bairro: "Parque Bitaru",
    latitude: -23.9635,
    longitude: -46.3921,
    alunos: 520,
    riscoInundacao: "Alto",
    riscoDeslizamento: "Baixo",
    ivec: 72,
    classificacaoIvec: "Alto",
    ocorrencias: 8,
    diasPerdidos: 21
  },
  {
    id: 2,
    nome: "EMEF Maria Clara Machado",
    bairro: "Japuí",
    latitude: -23.9702,
    longitude: -46.3778,
    alunos: 410,
    riscoInundacao: "Médio",
    riscoDeslizamento: "Baixo",
    ivec: 48,
    classificacaoIvec: "Médio",
    ocorrencias: 4,
    diasPerdidos: 9
  },
  {
    id: 3,
    nome: "EMEF Parque das Bandeiras",
    bairro: "Parque das Bandeiras",
    latitude: -23.9458,
    longitude: -46.4092,
    alunos: 680,
    riscoInundacao: "Alto",
    riscoDeslizamento: "Médio",
    ivec: 86,
    classificacaoIvec: "Muito Alto",
    ocorrencias: 12,
    diasPerdidos: 34
  },
  {
    id: 4,
    nome: "EMEF Vila Margarida",
    bairro: "Vila Margarida",
    latitude: -23.9545,
    longitude: -46.3843,
    alunos: 350,
    riscoInundacao: "Baixo",
    riscoDeslizamento: "Alto",
    ivec: 69,
    classificacaoIvec: "Alto",
    ocorrencias: 6,
    diasPerdidos: 16
  },
  {
    id: 5,
    nome: "EMEF Humaitá",
    bairro: "Humaitá",
    latitude: -23.9387,
    longitude: -46.4172,
    alunos: 590,
    riscoInundacao: "Médio",
    riscoDeslizamento: "Médio",
    ivec: 58,
    classificacaoIvec: "Médio",
    ocorrencias: 5,
    diasPerdidos: 11
  }
];

/* --------- OCORRÊNCIAS INICIAIS (dados fictícios) --------- */
const ocorrenciasIniciais = [
  {
    id: 1,
    escola: "EMEF João Paulo II",
    bairro: "Parque Bitaru",
    data: "2026-03-15",
    motivo: "Enchente",
    diasPerdidos: 2,
    transporteImpactado: "Sim",
    acessoImpactado: "Sim",
    responsavel: "Coordenação Escolar",
    status: "Recebido"
  },
  {
    id: 2,
    escola: "EMEF Parque das Bandeiras",
    bairro: "Parque das Bandeiras",
    data: "2026-03-21",
    motivo: "Alagamento no entorno",
    diasPerdidos: 3,
    transporteImpactado: "Sim",
    acessoImpactado: "Sim",
    responsavel: "Direção Escolar",
    status: "Validado"
  },
  {
    id: 3,
    escola: "EMEF Vila Margarida",
    bairro: "Vila Margarida",
    data: "2026-04-08",
    motivo: "Deslizamento",
    diasPerdidos: 4,
    transporteImpactado: "Não",
    acessoImpactado: "Sim",
    responsavel: "Secretaria Escolar",
    status: "Em análise"
  }
];

/* --------- ÁREAS DE INUNDAÇÃO (fictícias) ---------
   Em produção: substituir por GeoJSON real municipal.
   Exemplo:
     fetch('data/inundacao.geojson')
       .then(r => r.json())
       .then(geo => L.geoJSON(geo).addTo(map));
*/
const areasInundacao = [
  { nome: "Área Central - Baixada",   centro: [-23.9655, -46.3905], raio: 400 },
  { nome: "Faixa Parque das Bandeiras", centro: [-23.9470, -46.4085], raio: 500 },
  { nome: "Trecho Japuí",             centro: [-23.9710, -46.3790], raio: 300 }
];

/* --------- ÁREAS DE DESLIZAMENTO (fictícias) --------- */
const areasDeslizamento = [
  { nome: "Encosta Vila Margarida", centro: [-23.9550, -46.3835], raio: 300 },
  { nome: "Morro Humaitá",          centro: [-23.9390, -46.4180], raio: 350 }
];

/* --------- POPULAÇÃO POR BAIRRO (fictícia) ---------
   Em produção: usar setor censitário do IBGE.
   Campos esperados: id_setor, bairro, populacao_total,
                     populacao_0_14, densidade_demografica
*/
const populacaoPorBairro = [
  { bairro: "Parque Bitaru",        populacao: 3200 },
  { bairro: "Japuí",                populacao: 2100 },
  { bairro: "Vila Margarida",       populacao: 2800 },
  { bairro: "Parque das Bandeiras", populacao: 4100 },
  { bairro: "Humaitá",              populacao: 1800 },
  { bairro: "Samaritá",             populacao: 1432 }
];

/* --------- INDICADORES GERAIS (fictícios) --------- */
const indicadoresGerais = {
  escolasMonitoradas: 124,
  escolasEmRisco: 31,
  diasLetivosPerdidos: 189,
  populacaoAfetada: 15432,
  ocorrenciasRegistradas: 76,
  bairrosPrioritarios: 6
};

/* --------- REGRAS DE NEGÓCIO --------- */

// Regra 1 — Escola em risco: se inundação OU deslizamento = Alto
function escolaEmRisco(escola) {
  return escola.riscoInundacao === "Alto" || escola.riscoDeslizamento === "Alto";
}

// Regra 2 — Cálculo simples de prioridade (0-100)
function calcularPrioridade(escola) {
  const pesoRisco = { "Baixo": 10, "Médio": 25, "Alto": 40, "Muito Alto": 50 };
  const risco = Math.max(
    pesoRisco[escola.riscoInundacao] || 0,
    pesoRisco[escola.riscoDeslizamento] || 0
  );
  const alunosNorm = Math.min(escola.alunos / 20, 25);
  const ocorrNorm = Math.min(escola.ocorrencias * 2, 15);
  const diasNorm = Math.min(escola.diasPerdidos / 2, 20);
  return Math.round(risco + alunosNorm + ocorrNorm + diasNorm);
}

// Regra 3 — Cor do IVEC
function corIvec(classificacao) {
  const mapa = {
    "Baixo": "#2E7D32",
    "Médio": "#F9A825",
    "Alto": "#C62828",
    "Muito Alto": "#6A1B9A"
  };
  return mapa[classificacao] || "#607D8B";
}

// Expor para uso global (caso não use módulos ES)
window.OER = {
  escolas,
  ocorrenciasIniciais,
  areasInundacao,
  areasDeslizamento,
  populacaoPorBairro,
  indicadoresGerais,
  escolaEmRisco,
  calcularPrioridade,
  corIvec
};
