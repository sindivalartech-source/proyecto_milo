let vidas=3,score=0,level=1,time=15,currentAnswer=0,stepsText="",timer,gameStarted=false;

const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

function startGame(){
if(gameStarted) return;
gameStarted=true;
document.getElementById("answer").disabled=false;
document.getElementById("btnAnswer").disabled=false;
generateQuestion();
}

function generateQuestion(){
let a=rand(-10,10),b=rand(-10,10),c=rand(-10,10);

if(level<=3){
currentAnswer=a+(b-c);
stepsText=`${b}-${c}=${b-c} → ${a}+${b-c}=${currentAnswer}`;
document.getElementById("question").innerText=`${a} + (${b} - ${c})`;
}
else if(level<=6){
let ops=['+','-','*','/'];
let op1=ops[rand(0,3)],op2=ops[rand(0,3)];
let exp=`${a} ${op1} (${b} ${op2} ${c})`;

try{
currentAnswer=eval(exp);
currentAnswer=Math.round(currentAnswer*100)/100;
}catch{
return generateQuestion();
}

stepsText=`Resuelve primero (${b} ${op2} ${c})`;
document.getElementById("question").innerText=exp;
}
else{
let x=rand(1,10),seg=rand(5,20);
currentAnswer=seg-x;
stepsText=`${seg}-${x}=${currentAnswer}`;
document.getElementById("question").innerText=`Segmento total ${seg}, parte ${x}. ¿Falta?`;
}

startTimer();
}

function startTimer(){
  clearInterval(timer);

  if(!gameStarted) return; // 🔥 evita que corra sin juego

  time = 15;
  document.getElementById("time").innerText = time;

  timer = setInterval(()=>{
    if(!gameStarted) return; // 🔥 doble protección

    time--;
    document.getElementById("time").innerText = time;

    if(time <= 0){
      loseLife();
    }
  }, 1000);
}

function parseRespuesta(valor){
  valor = valor.replace(",", ".");

  if(valor.includes("/")){
    let [a,b] = valor.split("/");

    let num = parseFloat(a);
    let den = parseFloat(b);

    if(isNaN(num) || isNaN(den) || den === 0) return NaN;

    return num / den;
  }

  return parseFloat(valor);
}

function checkAnswer(){
  if(!gameStarted) return;

  let input = document.getElementById("answer").value.trim();
  let user = parseRespuesta(input);

  if(input === "" || isNaN(user)){
    alert("⚠️ Ingresa un valor válido");
    return;
  }

  // 🔥 Validación correcta
  if(user === currentAnswer){
    score += 10;
    level++;
    time += 2;
    playSound(true);
    alert("✅ Correcto");
  } else {
    loseLife();
    return;
  }

  updateUI();
  generateQuestion();
}

function loseLife(){
  vidas--;
  playSound(false);

  alert("❌ Incorrecto");

  if(vidas <= 0){
    showSteps();

    setTimeout(()=>{
      saveScore(); // 🔥 guarda ranking
      alert("💀 Game Over");
      resetGame();
    }, 2000);

    return;
  }

  updateUI();
  generateQuestion();
}

function showSteps(){
let s=document.getElementById("steps");
s.style.display="block";
s.innerText="Solución: "+stepsText;
}

function updateUI(){
document.getElementById("vidas").innerText=vidas;
document.getElementById("score").innerText=score;
document.getElementById("level").innerText=level;
document.getElementById("answer").value="";
}

function saveScore(){
let name=prompt("Tu nombre:");
let data=JSON.parse(localStorage.getItem("ranking")||"[]");

data.push({name,score});
data.sort((a,b)=>b.score-a.score);
data=data.slice(0,5);

localStorage.setItem("ranking",JSON.stringify(data));
loadRanking();
}

function loadRanking(){
let data=JSON.parse(localStorage.getItem("ranking")||"[]");
let list=document.getElementById("ranking");
list.innerHTML="";

data.forEach(p=>{
let li=document.createElement("li");
li.innerText=`${p.name} - ${p.score}`;
list.appendChild(li);
});
}

function resetRanking(){
  // 🔥 Detener el tiempo
  clearInterval(timer);

  // 🔥 Reset estado del juego
  gameStarted = false;
  time = 15;

  // 🔥 Reset UI del tiempo
  document.getElementById("time").innerText = time;

  // 🔥 Deshabilitar inputs
  document.getElementById("answer").disabled = true;
  document.getElementById("btnAnswer").disabled = true;

  // 🔥 Reset pregunta
  document.getElementById("question").innerText = "Presiona comenzar";

  // 🔥 Ocultar solución si estaba visible
  document.getElementById("steps").style.display = "none";

  // 🔥 Reset ranking
  localStorage.removeItem("ranking");
  loadRanking();

  // 🔥 (Opcional) reset completo del juego
  vidas = 3;
  score = 0;
  level = 1;

  updateUI();
}

function playSound(ok){
let audio=new Audio(ok?
"https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg":
"https://actions.google.com/sounds/v1/impacts/wood_plank_flicks.ogg");
audio.play();
}

function resetGame(){
  clearInterval(timer); // 🔥 DETIENE el reloj

  vidas=3;
  score=0;
  level=1;
  gameStarted=false;

  document.getElementById("answer").disabled=true;
  document.getElementById("btnAnswer").disabled=true;
  document.getElementById("steps").style.display="none";
  document.getElementById("question").innerText="Presiona comenzar";

  updateUI();
}

loadRanking();


function addValue(val){
  let input = document.getElementById("answer");
  let actual = input.value;

  // 🔥 Evitar múltiples negativos seguidos
  if(val === "-"){
    if(actual === "" || actual.endsWith("/") ){
      input.value += "-"; // permitido: -5 o 3/-2
      return;
    }

    // evitar doble --
    if(actual.endsWith("-")) return;
  }

  input.value += val;
}

function borrar(){
  let input = document.getElementById("answer");
  input.value = input.value.slice(0, -1);
}

function limpiar(){
  document.getElementById("answer").value = "";
}