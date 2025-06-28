const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let userName = "";
let numbers = [];
const commands = ["/start", "/name:", "/number:", "/stop"];

const commandHint = document.getElementById("commandHint");
const commandExamples = {
  "/start": "Начать диалог",
  "/name:": "/name: ВашеИмя",
  "/number:": "/number: 5, 3",
  "/stop": "Завершить диалог"
};

let isBotStarted = false;

function updateCommandHint() {
  const text = input.value.trim();
  let hint = "";
  
  if (numbers.length === 2 && ["+", "-", "*", "/"].includes(text)) {
    commandHint.textContent = "";
    return;
  }
  
  if (text === "" && !isBotStarted) {
    hint = "Введите /start чтобы начать";
  } else if (text.startsWith("/")) {
    for (const [cmd, example] of Object.entries(commandExamples)) {
      if (cmd.startsWith(text)) {
        hint = cmd.slice(text.length);
        break;
      }
    }
  }
  
  commandHint.textContent = hint;
  commandHint.style.setProperty('--input-width', input.value.length);
}

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = `message ${isUser ? "user" : "bot"}`;

  const avatar = document.createElement("img");
  avatar.src = isUser ? "user_avatar.png" : "bot_avatar.png";

  const bubble = document.createElement("div");
  bubble.textContent = text;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messages.prepend(msg);
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator bot";
  indicator.innerHTML = '<span></span><span></span><span></span>';
  indicator.id = "typing";
  messages.prepend(indicator);
}

function hideTypingIndicator() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

function handleCommand(inputText) {
  const cmd = inputText.trim();
  
  switch (true) {
    case cmd === "/start":
      isBotStarted = true;
      return "Привет, меня зовут Чат-бот, а как зовут тебя?";
    
    case cmd.startsWith("/name:"):
      userName = cmd.split(":")[1].trim();
      return `Привет ${userName}, приятно познакомиться. Я умею считать, введи числа которые надо посчитать`;
    
    case cmd.startsWith("/number:"):
      const nums = cmd.split(":")[1].split(",").map(n => parseFloat(n.trim()));
      if (nums.length === 2 && nums.every(n => !isNaN(n))) {
        numbers = nums;
        return `Выберите операцию: +, -, *, /`;
      }
      return "Пожалуйста, введите два числа через запятую";
    
    case ["+", "-", "*", "/"].includes(cmd) && numbers.length === 2:
      const [a, b] = numbers;
      let result;
      switch (cmd) {
        case "+": result = a + b; break;
        case "-": result = a - b; break;
        case "*": result = a * b; break;
        case "/": result = b !== 0 ? (a / b).toFixed(2) : "Ошибка: деление на ноль"; break;
      }
      numbers = [];
      return `Результат: ${result}`;
    
    case cmd === "/stop":
      isBotStarted = false;
      return "Всего доброго, если хочешь поговорить пиши /start";
    
    default:
      return "Я не понимаю, введите другую команду!";
  }
}

function autocompleteCommand(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const currentInput = input.value.trim();
    
    if (currentInput === "" && !isBotStarted) {
      input.value = "/start";
      updateCommandHint();
      return;
    }
    
    const matchingCommand = commands.find(cmd => 
      cmd.startsWith(currentInput) && cmd !== currentInput
    );
    
    if (matchingCommand) {
      input.value = matchingCommand;
      if (matchingCommand.endsWith(":")) {
        input.value += " ";
      }
      updateCommandHint();
    }
  }
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  
  addMessage(text, true);
  input.value = "";
  sendBtn.classList.remove("active");
  sendBtn.disabled = true;
  
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    addMessage(handleCommand(text));
  }, 800);
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim() !== "") {
    sendMessage();
  }
});

input.addEventListener('input', () => {
  const isActive = input.value.trim() !== "";
  sendBtn.classList.toggle("active", isActive);
  sendBtn.disabled = !isActive;
  updateCommandHint();
});

input.addEventListener("keydown", autocompleteCommand);

input.addEventListener('focus', updateCommandHint);
input.addEventListener('blur', () => {
  commandHint.textContent = "";
});