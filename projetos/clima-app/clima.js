const inputCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");
const body = document.getElementById("body");
const historico = document.getElementById("historico");
const previsao = document.getElementById("previsao");

inputCidade.addEventListener("keypress", function(e){
  if(e.key === "Enter"){
    buscar();
  }
});

window.onload = () => {
  renderizarHistorico();
};

async function buscar(){
  const cidade = inputCidade.value.trim();

  if(cidade === ""){
    resultado.innerHTML = `<p class="erro">Digite uma cidade</p>`;
    return;
  }

  await buscarClimaPorCidade(cidade);
}

async function buscarClimaPorCidade(cidade){
  mostrarLoading("Buscando clima...");

  try{
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
    const geoResposta = await fetch(geoUrl);
    const geoDados = await geoResposta.json();

    if(!geoDados.results || geoDados.results.length === 0){
      resultado.innerHTML = `<p class="erro">Cidade não encontrada</p>`;
      previsao.innerHTML = "";
      return;
    }

    const local = geoDados.results[0];
    await exibirClima(local.latitude, local.longitude, local.name, local.country_code || "-");
    salvarHistorico(local.name);

  }catch(erro){
    console.log(erro);
    resultado.innerHTML = `<p class="erro">Erro ao buscar dados</p>`;
    previsao.innerHTML = "";
  }
}

async function usarLocalizacao(){
  if(!navigator.geolocation){
    resultado.innerHTML = `<p class="erro">Geolocalização não suportada</p>`;
    return;
  }

  mostrarLoading("Obtendo localização...");

  navigator.geolocation.getCurrentPosition(async (posicao) => {
    const latitude = posicao.coords.latitude;
    const longitude = posicao.coords.longitude;

    try{
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=pt&format=json`;
      const geoResposta = await fetch(geoUrl);
      const geoDados = await geoResposta.json();

      const local = geoDados.results && geoDados.results[0]
        ? geoDados.results[0]
        : { name: "Sua localização", country_code: "-" };

      await exibirClima(latitude, longitude, local.name, local.country_code || "-");
      salvarHistorico(local.name);

    }catch(erro){
      console.log(erro);
      resultado.innerHTML = `<p class="erro">Erro ao obter localização</p>`;
      previsao.innerHTML = "";
    }
  }, () => {
    resultado.innerHTML = `<p class="erro">Permissão de localização negada</p>`;
    previsao.innerHTML = "";
  });
}

async function exibirClima(latitude, longitude, nomeCidade, pais){
  const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const climaResposta = await fetch(climaUrl);
  const climaDados = await climaResposta.json();

  const temperatura = Math.round(climaDados.current.temperature_2m);
  const sensacao = Math.round(climaDados.current.apparent_temperature);
  const umidade = climaDados.current.relative_humidity_2m;
  const vento = Math.round(climaDados.current.wind_speed_10m);
  const codigo = climaDados.current.weather_code;

  const descricao = traduzirClima(codigo);
  const icone = iconeClima(codigo);

  mudarFundo(codigo);

  resultado.innerHTML = `
    <div class="icone-clima">${icone}</div>
    <h2>${nomeCidade}</h2>
    <p class="temperatura">${temperatura}°C</p>
    <p class="descricao">${descricao}</p>

    <div class="info-extra">
      <div class="info-box">
        <span>🌡️ Sensação</span>
        <strong>${sensacao}°C</strong>
      </div>

      <div class="info-box">
        <span>💧 Umidade</span>
        <strong>${umidade}%</strong>
      </div>

      <div class="info-box">
        <span>🌬️ Vento</span>
        <strong>${vento} km/h</strong>
      </div>

      <div class="info-box">
        <span>🌍 País</span>
        <strong>${pais}</strong>
      </div>
    </div>
  `;

  renderizarPrevisao(climaDados.daily);
}

function renderizarPrevisao(daily){
  previsao.innerHTML = "";

  for(let i = 0; i < 5; i++){
    const data = new Date(daily.time[i]);
    const dia = data.toLocaleDateString("pt-BR", { weekday: "short" });
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    const codigo = daily.weather_code[i];

    const card = document.createElement("div");
    card.className = "previsao-dia";

    card.innerHTML = `
      <div class="dia">${dia}</div>
      <div class="icone">${iconeClima(codigo)}</div>
      <div class="temp">${max}° / ${min}°</div>
    `;

    previsao.appendChild(card);
  }
}

function mostrarLoading(texto){
  resultado.innerHTML = `
    <div class="spinner"></div>
    <p class="loading">${texto}</p>
  `;
  previsao.innerHTML = "";
}

function traduzirClima(codigo){
  const clima = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Nevoeiro",
    48: "Nevoeiro com geada",
    51: "Garoa fraca",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve forte",
    80: "Pancadas de chuva fracas",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    95: "Trovoadas"
  };

  return clima[codigo] || "Clima indisponível";
}

function iconeClima(codigo){
  if(codigo === 0) return "☀️";
  if(codigo === 1 || codigo === 2) return "🌤️";
  if(codigo === 3) return "☁️";
  if(codigo === 45 || codigo === 48) return "🌫️";
  if([51,53,55,61,63,65,80,81,82].includes(codigo)) return "🌧️";
  if([71,73,75].includes(codigo)) return "❄️";
  if(codigo === 95) return "⛈️";
  return "🌍";
}

function mudarFundo(codigo){
  if(codigo === 0){
    body.style.background = "linear-gradient(135deg,#0f172a,#1d4ed8)";
    return;
  }

  if(codigo === 1 || codigo === 2){
    body.style.background = "linear-gradient(135deg,#0f172a,#0369a1)";
    return;
  }

  if(codigo === 3 || codigo === 45 || codigo === 48){
    body.style.background = "linear-gradient(135deg,#1e293b,#475569)";
    return;
  }

  if([51,53,55,61,63,65,80,81,82].includes(codigo)){
    body.style.background = "linear-gradient(135deg,#0f172a,#334155)";
    return;
  }

  if([71,73,75].includes(codigo)){
    body.style.background = "linear-gradient(135deg,#1e3a8a,#64748b)";
    return;
  }

  if(codigo === 95){
    body.style.background = "linear-gradient(135deg,#111827,#312e81)";
    return;
  }

  body.style.background = "linear-gradient(135deg,#0f172a,#1e293b)";
}

function salvarHistorico(cidade){
  let cidades = JSON.parse(localStorage.getItem("historicoClima")) || [];

  cidades = cidades.filter(item => item.toLowerCase() !== cidade.toLowerCase());
  cidades.unshift(cidade);

  if(cidades.length > 5){
    cidades = cidades.slice(0, 5);
  }

  localStorage.setItem("historicoClima", JSON.stringify(cidades));
  renderizarHistorico();
}

function renderizarHistorico(){
  let cidades = JSON.parse(localStorage.getItem("historicoClima")) || [];

  historico.innerHTML = "";

  cidades.forEach(cidade => {
    const tag = document.createElement("button");
    tag.className = "tag-cidade";
    tag.textContent = cidade;
    tag.onclick = () => {
      inputCidade.value = cidade;
      buscarClimaPorCidade(cidade);
    };
    historico.appendChild(tag);
  });
}

function limparHistorico(){
  localStorage.removeItem("historicoClima");
  renderizarHistorico();
}