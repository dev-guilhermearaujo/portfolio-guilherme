const inputCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");
const body = document.getElementById("body");

inputCidade.addEventListener("keypress", function(e){
  if(e.key === "Enter"){
    buscar();
  }
});

async function buscar(){
  const cidade = inputCidade.value.trim();

  if(cidade === ""){
    resultado.innerHTML = `<p class="erro">Digite uma cidade</p>`;
    return;
  }

  resultado.innerHTML = `<p class="loading">Buscando clima...</p>`;

  try{
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
    const geoResposta = await fetch(geoUrl);
    const geoDados = await geoResposta.json();

    if(!geoDados.results || geoDados.results.length === 0){
      resultado.innerHTML = `<p class="erro">Cidade não encontrada</p>`;
      return;
    }

    const local = geoDados.results[0];
    const latitude = local.latitude;
    const longitude = local.longitude;

    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
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
      <h2>${local.name}</h2>
      <p class="temperatura">${temperatura}°C</p>
      <p class="descricao">${descricao}</p>

      <div class="info-extra">
        <div class="info-box">
          <span>Sensação</span>
          <strong>${sensacao}°C</strong>
        </div>

        <div class="info-box">
          <span>Umidade</span>
          <strong>${umidade}%</strong>
        </div>

        <div class="info-box">
          <span>Vento</span>
          <strong>${vento} km/h</strong>
        </div>

        <div class="info-box">
          <span>País</span>
          <strong>${local.country_code || "-"}</strong>
        </div>
      </div>
    `;

  }catch(erro){
    console.log(erro);
    resultado.innerHTML = `<p class="erro">Erro ao buscar dados</p>`;
  }
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