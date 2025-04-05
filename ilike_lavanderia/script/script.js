// URL do Web App do Google Apps Script
var scriptURL = "https://script.google.com/macros/s/AKfycbzr8Ch7xod-C-f922Ti3w-Q-WykbVxbJ8wTwde456y0tDkQOKQ2db2kjC6jaRcAzkBn/exec";

// Função para popular os selects com horários permitidos
function populateTimeSelect(selectId) {
  var select = document.getElementById(selectId);

  // Adiciona uma opção de placeholder
  var placeholder = document.createElement('option');
  placeholder.value = "";
  placeholder.text = "Selecione o horário";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  for (var hour = 8; hour <= 18; hour++) {
    for (var minute = 0; minute < 60; minute += 10) {
      // Para as 18:00, somente permite 00 minutos
      if (hour === 18 && minute > 0) break;
      var hh = hour < 10 ? '0' + hour : hour;
      var mm = minute < 10 ? '0' + minute : minute;
      var timeString = hh + ':' + mm;
      var option = document.createElement('option');
      option.value = timeString;
      option.text = timeString;
      select.appendChild(option);
    }
  }
}

// Popula os selects ao carregar a página
populateTimeSelect("horarioInicio");
populateTimeSelect("horarioFim");

// Função para converter a data do formato YYYY-MM-DD para DD-MM-YYYY
function formatDate(dateStr) {
  var parts = dateStr.split("-");
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

// Função para validar o número do apartamento
function validarApartamento(numero) {
  var num = parseInt(numero, 10);
  if (isNaN(num)) return false;

  var numStr = num.toString();

  // Validação para apartamentos de 1º a 9º andar (3 dígitos)
  if (numStr.length === 3) {
    var andar = parseInt(numStr.charAt(0), 10);
    var apto = parseInt(numStr.slice(1), 10);
    if (andar < 1 || andar > 9) return false;
    if (apto < 1 || apto > 8) return false;
    return true;
  }
  // Validação para o 10º andar (4 dígitos)
  else if (numStr.length === 4) {
    var andar = parseInt(numStr.slice(0, 2), 10);
    var apto = parseInt(numStr.slice(2), 10);
    if (andar !== 10) return false;
    if (apto < 1 || apto > 8) return false;
    return true;
  } else {
    return false;
  }
}

// Evento para tratar o envio do formulário
document.getElementById('aptoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  var nomeInput = document.getElementById('nome').value.trim();
  var aptoInput = document.getElementById('apto').value.trim();
  var dataInput = document.getElementById('data').value.trim();
  var horarioInicioInput = document.getElementById('horarioInicio').value.trim();
  var horarioFimInput = document.getElementById('horarioFim').value.trim();
  var messageDiv = document.getElementById('message');

  if (nomeInput === "") {
    messageDiv.textContent = "Por favor, informe o seu nome.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  if (!validarApartamento(aptoInput)) {
    messageDiv.textContent = "Número do apartamento inválido. Por favor, insira o número correto da sua unidade.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  if (dataInput === "") {
    messageDiv.textContent = "Por favor, informe a data do agendamento.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  if (horarioInicioInput === "" || horarioFimInput === "") {
    messageDiv.textContent = "Por favor, informe os horários de início e fim.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  // Validação extra dos horários
  if (horarioInicioInput < "08:00" || horarioInicioInput > "18:00" ||
      horarioFimInput < "08:00" || horarioFimInput > "18:00") {
    messageDiv.textContent = "O horário de funcionamento da lavanderia é das 08:00 às 18:00";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  if (horarioInicioInput >= horarioFimInput) {
    messageDiv.textContent = "O horário de funcionamento da lavanderia é das 08:00 às 18:00.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    return;
  }

  var dataFormatada = formatDate(dataInput);

  // Cria o objeto com os dados a serem enviados
  var formData = {
    nome: nomeInput,
    unidade: aptoInput,
    data: dataInput,
    horarioInicio: horarioInicioInput,
    horarioFim: horarioFimInput
  };

  // Envia os dados para o Google Sheets via fetch
  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(function (response) {
    messageDiv.textContent = "Reserva efetuada para " + nomeInput + ", agendado para " + dataFormatada + " das " + horarioInicioInput + " às " + horarioFimInput + "!";
    messageDiv.classList.remove("error");
    messageDiv.classList.add("success");
    document.getElementById('aptoForm').reset();
  })
  .catch(function (error) {
    messageDiv.textContent = "Ocorreu um erro ao enviar os dados. Tente novamente.";
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
    console.error('Error:', error);
  });
});