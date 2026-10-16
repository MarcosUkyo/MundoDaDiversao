/* =========================================================
   MUNDO DA DIVERSÃO — forms.js
   Usado em contato.html e orcamento.html.
   Conteúdo (baseado nos slides de JavaScript/DOM e Storage):
   1. Máscara de telefone         (eventos + DOM)
   2. Data mínima do evento       (DOM)
   3. Contador de caracteres      (eventos + DOM)
   4. Rascunho do formulário      (sessionStorage)
   5. "Lembrar meus dados"        (localStorage)
   ========================================================= */

/* 1. MÁSCARA DE TELEFONE ------------------------------------ */
function formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
  
    if (digitos.length > 10) {
      return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
    }
    if (digitos.length > 6) {
      return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
    }
    if (digitos.length > 2) {
      return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
    }
    if (digitos.length > 0) {
      return "(" + digitos;
    }
    return "";
  }
  
  function aplicarMascaraTelefone(evento) {
    evento.target.value = formatarTelefone(evento.target.value);
  }
  
  const camposTelefone = document.querySelectorAll('input[type="tel"]');
  camposTelefone.forEach(function (campo) {
    campo.addEventListener("input", aplicarMascaraTelefone);
  });
  
  /* 2. DATA MÍNIMA DO EVENTO ---------------------------------- */
  function dataDeHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
  }
  
  const campoData = document.getElementById("orc-data");
  if (campoData) {
    campoData.min = dataDeHoje();
  }
  
  /* 3. CONTADOR DE CARACTERES --------------------------------- */
  function atualizarContador(areaTexto, contador) {
    contador.textContent = areaTexto.value.length + "/" + areaTexto.maxLength + " caracteres";
  }
  
  const areasComLimite = document.querySelectorAll("textarea[maxlength]");
  areasComLimite.forEach(function (area) {
    const contador = document.getElementById(area.id + "-contador");
    if (contador) {
      atualizarContador(area, contador);
      area.addEventListener("input", function () {
        atualizarContador(area, contador);
      });
    }
  });
  
  /* 4. RASCUNHO DO FORMULÁRIO (sessionStorage) -----------------
     Sobrevive ao F5 e some ao fechar a aba.
     O objeto vira texto com JSON.stringify e volta com JSON.parse. */
  function salvarRascunho(formulario) {
    const rascunho = {};
    formulario.querySelectorAll("input, select, textarea").forEach(function (campo) {
      if (!campo.id) {
        return;
      }
      if (campo.type === "checkbox" || campo.type === "radio") {
        rascunho[campo.id] = campo.checked;
      } else {
        rascunho[campo.id] = campo.value;
      }
    });
    sessionStorage.setItem("rascunho-" + formulario.id, JSON.stringify(rascunho));
  }
  
  function restaurarRascunho(formulario) {
    const guardado = sessionStorage.getItem("rascunho-" + formulario.id);
    if (guardado === null) {
      return;
    }
    const rascunho = JSON.parse(guardado);
    Object.keys(rascunho).forEach(function (id) {
      const campo = document.getElementById(id);
      if (!campo) {
        return;
      }
      if (campo.type === "checkbox" || campo.type === "radio") {
        campo.checked = rascunho[id];
      } else {
        campo.value = rascunho[id];
      }
    });
  }
  
  /* 5. LEMBRAR MEUS DADOS (localStorage) -----------------------
     Guarda só nome, e-mail e telefone, e apenas se a pessoa marcar a opção. */
  const CHAVE_DADOS = "dadosContato";
  
  function salvarDados(formulario) {
    const opcao = formulario.querySelector("[data-lembrar-opcao]");
    if (!opcao.checked) {
      localStorage.removeItem(CHAVE_DADOS);
      return;
    }
    const dados = {};
    formulario.querySelectorAll("[data-lembrar]").forEach(function (campo) {
      dados[campo.dataset.lembrar] = campo.value;
    });
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
  }
  
  function restaurarDados(formulario) {
    const guardado = localStorage.getItem(CHAVE_DADOS);
    if (guardado === null) {
      return;
    }
    const dados = JSON.parse(guardado);
    formulario.querySelectorAll("[data-lembrar]").forEach(function (campo) {
      if (dados[campo.dataset.lembrar]) {
        campo.value = dados[campo.dataset.lembrar];
      }
    });
    formulario.querySelector("[data-lembrar-opcao]").checked = true;
  }
  
  /* LIGA TUDO AOS FORMULÁRIOS DA PÁGINA ----------------------- */
  function iniciarFormulario(formulario) {
    try {
      restaurarDados(formulario);
      restaurarRascunho(formulario);
    } catch (erro) {
      // navegador com storage bloqueado: o formulário continua funcionando sem rascunho
    }
  
    // recalcula o contador depois de restaurar o texto
    formulario.querySelectorAll("textarea[maxlength]").forEach(function (area) {
      const contador = document.getElementById(area.id + "-contador");
      if (contador) {
        atualizarContador(area, contador);
      }
    });
  
    formulario.addEventListener("input", function () {
      try {
        salvarRascunho(formulario);
      } catch (erro) {
        // ignora: rascunho é só uma conveniência
      }
    });
  
    formulario.addEventListener("submit", function () {
      try {
        salvarDados(formulario);
      } catch (erro) {
        // ignora: lembrar dados é só uma conveniência
      }
    });
  }
  
  const formularios = document.querySelectorAll("#form-contato, #form-orcamento");
  formularios.forEach(iniciarFormulario);
  