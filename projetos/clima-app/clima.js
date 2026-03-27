async function buscar(){
  const cidade = document.getElementById("cidade").value.trim();
  const resultado = document.getElementById("resultado");

  if(cidade === ""){
    resultado.innerHTML = "<p>Digite uma cidade</p>";
    return;
  }

  try{
    // Busca coordenadas da cidade
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
    const geoResposta = await fetch(geoUrl);
    const geoDados = await geoResposta.json();

    if(!geoDados.results || geoDados.results.length === 0){
      resultado.innerHTML = "<p>Cidade não encontrada</p>";
      return;
    }

    const local = geoDados.results[0];
    const latitude = local.latitude;
    const longitude = local.longitude;

    // Busca clima atual
    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
    const climaResposta = await fetch(climaUrl);
    const climaDados = await climaResposta.json();

    const temperatura = Math.round(climaDados.current.temperature_2m);
    const vento = climaDados.current.wind_speed_10m;
    const codigo = climaDados.current.weather_code;

    resultado.innerHTML = `
      <h2>${local.name}</h2>
      <p><strong>${temperatura}°C</strong></p>
      <p>${traduzirClima(codigo)}</p>
      <p>Vento: ${vento} km/h</p>
    `;

  }catch(erro){
    console.log(erro);
resultado.innerHTML = `
  <h2>${local.name}</h2>
  <p><strong>${temperatura}°C</strong></p>
  <p>${traduzirClima(codigo)}</p>
  <img src="https://openweathermap.org/img/wn/01d.png" width="60">
  <p>Vento: ${vento} km/h</p>
`;

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