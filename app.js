import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 가져오신 Firebase 설정 적용 완료! (databaseURL 추가됨)
const firebaseConfig = {
  apiKey: "AIzaSyAk8MjKCLDbk-OXqxyW5g8MY7DLaY4Dbjg",
  authDomain: "locker-b8f43.firebaseapp.com",
  projectId: "locker-b8f43",
  storageBucket: "locker-b8f43.firebasestorage.app",
  messagingSenderId: "204210400652",
  appId: "1:204210400652:web:ffd978d8ceba7814e63aa9",
  measurementId: "G-GYHSV2FWNR",
  databaseURL: "https://locker-b8f43-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");

async function render() {
  grid.innerHTML = "";

  const lockersRef = ref(db, "lockers");
  const snapshot = await get(lockersRef);
  const lockersData = snapshot.exists() ? snapshot.val() : {};

  for (let i = 1; i <= 33; i++) {
    let div = document.createElement("div");
    div.className = "locker";

    if (lockersData[i]) {
      div.classList.add("reserved");
      div.innerText = i + "\n" + lockersData[i].name;
    } else {
      div.innerText = i;
      
      div.onclick = async () => {
        let name = prompt("예약자 이름을 입력하세요.");
        if (!name) return; 

        let specificLockerRef = ref(db, "lockers/" + i);
        await set(specificLockerRef, { name: name });
        
        render();
      };
    }
    grid.appendChild(div);
  }
}

render();