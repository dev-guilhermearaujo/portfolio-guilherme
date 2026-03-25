const input = document.getElementById("tarefa");
const lista = document.getElementById("lista");

// carregar tarefas salvas
window.onload = () => {
  carregarTarefas();
};

// adicionar com botão ou enter
input.addEventListener("keypress", function(e){
  if(e.key === "Enter"){
    adicionar();
  }
});

function adicionar(){
  let texto = input.value.trim();

  if(texto === "") return;

  criarTarefa(texto);
  salvarTarefas();

  input.value = "";
}

function criarTarefa(texto, concluida = false){
  let li = document.createElement("li");

  if(concluida){
    li.classList.add("concluida");
  }

  li.innerHTML = `
    <span onclick="toggle(this)">${texto}</span>
    <button onclick="remover(this)">X</button>
  `;

  lista.appendChild(li);
}

function remover(botao){
  botao.parentElement.remove();
  salvarTarefas();
}

function toggle(elemento){
  elemento.parentElement.classList.toggle("concluida");
  salvarTarefas();
}

// salvar no navegador
function salvarTarefas(){
  let tarefas = [];

  document.querySelectorAll("li").forEach(li => {
    tarefas.push({
      texto: li.innerText.replace("X","").trim(),
      concluida: li.classList.contains("concluida")
    });
  });

  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// carregar do navegador
function carregarTarefas(){
  let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  tarefas.forEach(t => {
    criarTarefa(t.texto, t.concluida);
  });
}