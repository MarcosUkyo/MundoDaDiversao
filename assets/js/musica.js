/* =========================================================
   MÚSICA DE FUNDO — botão na navbar + <audio> da página
   - Toca assets/audio/musica-fundo.mp3 em loop
   - Lembra se estava ligada e o ponto da música entre páginas
   - Se o navegador bloquear o som automático, retoma no 1º clique
   ========================================================= */
(function () {
  'use strict';

  var VOLUME = 0.35;        // 0 a 1
  var DEFAULT_ON = false;   // true = liga no 1º clique do visitante
  var KEY_ON = 'musicaLigada';
  var KEY_TIME = 'musicaTempo';

  var audio = document.getElementById('musica-fundo'); // <audio> presente em cada página
  var button = null;
  var wantsOn = DEFAULT_ON;
  var resumeArmed = false;

  if (!audio) { return; }
  audio.loop = true;
  audio.volume = VOLUME;

  /* ---------- localStorage seguro ---------- */
  function readStore(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sem storage: ignora */ }
  }

  var savedOn = readStore(KEY_ON);
  if (savedOn !== null) { wantsOn = savedOn === '1'; }

  /* ---------- botão na navbar ---------- */
  function setUI(on) {
    if (button) { button.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }

  function createButton() {
    var nav = document.querySelector('.nav');
    if (!nav) { return; }

    button = document.createElement('button');
    button.type = 'button';
    button.className = 'music-toggle';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Música de fundo');
    button.title = 'Ligar ou desligar a música de fundo';
    button.innerHTML =
      '<svg class="icon-on" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
        '<path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/>' +
        '<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>' +
      '<svg class="icon-off" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
        '<path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/>' +
        '<path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';

    var cta = nav.querySelector('.nav-cta');
    if (cta) { nav.insertBefore(button, cta); } else { nav.appendChild(button); }

    button.addEventListener('click', function () {
      if (audio.paused) { turnOn(); } else { turnOff(); }
    });
  }

  /* ---------- liga / desliga ---------- */
  function play() {
    var t = parseFloat(readStore(KEY_TIME));
    if (t > 0 && audio.currentTime < 1) {
      try { audio.currentTime = t; } catch (e) { /* ainda sem metadados */ }
    }
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function (err) {
        setUI(false);
        if (err && err.name === 'NotAllowedError') { armResume(); } // espera um clique
      });
    }
  }

  function turnOn() {
    wantsOn = true;
    writeStore(KEY_ON, '1');
    play();
  }

  function turnOff() {
    wantsOn = false;
    writeStore(KEY_ON, '0');
    audio.pause();
  }

  /* ---------- retomar após navegar (autoplay bloqueado) ---------- */
  function armResume() {
    if (resumeArmed) { return; }
    resumeArmed = true;
    function resume(ev) {
      if (button && button.contains(ev.target)) { return; } // o clique do botão cuida disso
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
      resumeArmed = false;
      if (wantsOn && audio.paused) { play(); }
    }
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
  }

  /* ---------- eventos do <audio> ---------- */
  audio.addEventListener('playing', function () { setUI(true); });
  audio.addEventListener('pause', function () { setUI(false); });
  audio.addEventListener('error', function () {
    setUI(false);
    if (button) { button.title = 'Música indisponível (arquivo musica-fundo.mp3 não encontrado)'; }
    if (window.console) { console.warn('[musica] Não foi possível carregar ' + audio.currentSrc); }
  });

  /* ---------- guarda o ponto da música para a próxima página ---------- */
  function saveTime() {
    if (!audio.paused) { writeStore(KEY_TIME, String(audio.currentTime)); }
  }
  setInterval(saveTime, 1000);
  window.addEventListener('pagehide', saveTime);

  /* ---------- início ---------- */
  createButton();
  if (wantsOn) { play(); }
})();
