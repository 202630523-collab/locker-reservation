import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "여기에키",
  authDomain: "프로젝트.firebaseapp.com",
  databaseURL: "https://프로젝트-default-rtdb.firebaseio.com",
  projectId: "프로젝트",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");

async function render(){

grid.innerHTML="";

for(let i=1;i<=33;i++){

let lockerRef = ref(db,"lockers/"+i);
let snapshot = await get(lockerRef);

let div=document.createElement("div");
div.className="locker";

if(snapshot.exists()){

div.classList.add("reserved");
div.innerText=i+"\n"+snapshot.val().name;

}else{

div.innerText=i;

div.onclick=async ()=>{

let name=prompt("이름 입력");

if(!name) return;

await set(lockerRef,{name:name});

render();

}

}

grid.appendChild(div);

}

}

render();