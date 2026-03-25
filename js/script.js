const cards = document.querySelectorAll('.card');
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

window.addEventListener('scroll', () => {
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;

    if (cardTop < window.innerHeight - 100) {
      card.classList.add('show');
    }
  });
});

window.dispatchEvent(new Event('scroll'));

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('ativo');
});

document.querySelectorAll('#menu a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('ativo');
  });
});