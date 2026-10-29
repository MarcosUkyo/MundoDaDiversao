/* =========================================================
   MÁSCARAS DE DIGITAÇÃO — telefone e CEP
   Uso: <input data-mascara="telefone"> ou <input data-mascara="cep">
   A validação final continua nativa (pattern, required, maxlength).
   ========================================================= */
(function () {
  'use strict';

  var MASCARAS = {
    telefone: function (digitos) {
      var d = digitos.slice(0, 11);
      if (d.length === 0) { return ''; }
      if (d.length <= 2) { return '(' + d; }
      if (d.length <= 6) { return '(' + d.slice(0, 2) + ') ' + d.slice(2); }
      if (d.length <= 10) { return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6); }
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    },
    cep: function (digitos) {
      var d = digitos.slice(0, 8);
      if (d.length <= 5) { return d; }
      return d.slice(0, 5) + '-' + d.slice(5);
    }
  };

  function soDigitos(texto) { return texto.replace(/\D/g, ''); }

  // posição do cursor depois de formatar: logo após o mesmo nº de dígitos
  function posicaoCursor(texto, qtdDigitos) {
    if (qtdDigitos === 0) { return 0; }
    var contados = 0;
    for (var i = 0; i < texto.length; i++) {
      if (/\d/.test(texto.charAt(i))) { contados++; }
      if (contados === qtdDigitos) { return i + 1; }
    }
    return texto.length;
  }

  function ligarMascara(campo) {
    var formatar = MASCARAS[campo.getAttribute('data-mascara')];
    if (!formatar) { return; }
    var digitosAntes = soDigitos(campo.value);

    function aplicar(ev) {
      var cursor = campo.selectionStart;
      var bruto = campo.value;
      var digitos = soDigitos(bruto);

      // apagou só um símbolo "(", ")", "-" ou espaço: remove também o dígito anterior
      if (ev && ev.inputType === 'deleteContentBackward' && digitos === digitosAntes && digitos.length > 0) {
        var antesCursor = soDigitos(bruto.slice(0, cursor)).length;
        if (antesCursor > 0) {
          digitos = digitos.slice(0, antesCursor - 1) + digitos.slice(antesCursor);
          cursor = bruto.length; // recalculado abaixo
          var novoTexto = formatar(digitos);
          campo.value = novoTexto;
          var pos = posicaoCursor(novoTexto, antesCursor - 1);
          campo.setSelectionRange(pos, pos);
          digitosAntes = digitos;
          return;
        }
      }

      var qtdAntesDoCursor = soDigitos(bruto.slice(0, cursor)).length;
      var texto = formatar(digitos);
      campo.value = texto;
      var nova = posicaoCursor(texto, Math.min(qtdAntesDoCursor, texto.replace(/\D/g, '').length));
      try { campo.setSelectionRange(nova, nova); } catch (e) { /* tipo sem seleção */ }
      digitosAntes = soDigitos(texto);
    }

    campo.addEventListener('input', aplicar);
    if (campo.value) { campo.value = formatar(soDigitos(campo.value)); } // preenchimento automático
  }

  var campos = document.querySelectorAll('input[data-mascara]');
  for (var i = 0; i < campos.length; i++) { ligarMascara(campos[i]); }
})();