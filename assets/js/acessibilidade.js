/* =========================================================
   MUNDO DA DIVERSÃO — acessibilidade.js
   Rolagem suave para links de âncora (#id) da mesma página.
   - Compensa a altura do header fixo (sticky)
   - Respeita prefers-reduced-motion (acessibilidade)
   - Move o foco para o destino (teclado e leitor de tela)
   ========================================================= */
(function () {
  'use strict';

  var header = document.querySelector('.header');
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function alturaDoHeader() {
    return header ? header.offsetHeight : 0;
  }

  function rolarPara(alvo) {
    var posicao = alvo.getBoundingClientRect().top + window.pageYOffset - alturaDoHeader();

    window.scrollTo({
      top: Math.max(posicao, 0),
      behavior: reduzMovimento.matches ? 'auto' : 'smooth'
    });

    // permite que o destino receba foco sem entrar na ordem do Tab
    if (!alvo.hasAttribute('tabindex')) {
      alvo.setAttribute('tabindex', '-1');
    }
    alvo.focus({ preventScroll: true });
  }

  function aoClicar(evento) {
    var link = evento.target.closest('a[href*="#"]');
    if (!link) { return; }

    var url = new URL(link.href, window.location.href);

    // ignora links para outra página ou outro site
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
      return;
    }

    var id = decodeURIComponent(url.hash.slice(1));
    var alvo = id ? document.getElementById(id) : null;
    if (!alvo) { return; }

    evento.preventDefault();
    rolarPara(alvo);
    history.pushState(null, '', url.hash);
  }

  document.addEventListener('click', aoClicar);
})();