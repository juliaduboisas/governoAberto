/* =========================================================
   dashboard.js — Gráficos e indicadores (Chart.js)
   -----------------------------------------------------------
   Em produção, os arrays de dados devem vir de:
   - Consulta a API do observatório
   - Consolidação em backend (SQL, Athena, BigQuery…)
   ========================================================= */

const cores = {
  azul: '#0056B3', azulEscuro: '#003F7D',
  verde: '#2E7D32', amarelo: '#F9A825',
  vermelho: '#C62828', roxo: '#6A1B9A',
  cinza: '#607D8B', laranja: '#E87722'
};

/* --------- Gráfico 1: Motivos de interrupção (rosca) --------- */
new Chart(document.getElementById('graficoMotivos'), {
  type: 'doughnut',
  data: {
    labels: ['Enchente','Alagamento no entorno','Deslizamento','Transporte interrompido','Falta de energia','Calor','Outros'],
    datasets: [{
      data: [38, 24, 12, 18, 9, 15, 5],
      backgroundColor: [cores.vermelho, cores.amarelo, cores.roxo, cores.azul, cores.verde, cores.laranja, cores.cinza]
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }
});

/* --------- Gráfico 2: Dias letivos perdidos por mês --------- */
new Chart(document.getElementById('graficoDiasMes'), {
  type: 'bar',
  data: {
    labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    datasets: [{
      label: 'Dias letivos perdidos',
      data: [8, 12, 41, 36, 29, 21, 10, 6, 9, 7, 6, 4],
      backgroundColor: cores.azul
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

/* --------- Gráfico 3: Escolas por nível de vulnerabilidade --------- */
new Chart(document.getElementById('graficoVulnerabilidade'), {
  type: 'bar',
  data: {
    labels: ['Baixo','Médio','Alto','Muito Alto'],
    datasets: [{
      label: 'Escolas',
      data: [42, 51, 23, 8],
      backgroundColor: [cores.verde, cores.amarelo, cores.vermelho, cores.roxo]
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  }
});

/* --------- Gráfico 4: População escolar afetada por região --------- */
new Chart(document.getElementById('graficoPopulacaoRegiao'), {
  type: 'bar',
  data: {
    labels: ['Parque Bitaru','Japuí','Vila Margarida','Parque das Bandeiras','Humaitá','Samaritá'],
    datasets: [{
      label: 'População escolar afetada',
      data: [3200, 2100, 2800, 4100, 1800, 1432],
      backgroundColor: cores.azulEscuro
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});
