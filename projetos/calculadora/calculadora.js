function inserir(num){
  document.getElementById('resultado').value += num;
}

function limpar(){
  document.getElementById('resultado').value = "";
}

function apagar(){
  let resultado = document.getElementById('resultado').value;
  document.getElementById('resultado').value = resultado.slice(0,-1);
}

function calcular(){
  let resultado = document.getElementById('resultado').value;

  if(resultado){
    document.getElementById('resultado').value = eval(resultado);
  }
}