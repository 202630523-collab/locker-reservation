import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ⚠️ 주의: 이 부분은 반드시 본인의 실제 Firebase 설정값으로 채워 넣으셔야 합니다!
const firebaseConfig = {
  apiKey: "여기에키",
  authDomain: "프로젝트.firebaseapp.com",
  databaseURL: "https://프로젝트-default-rtdb.firebaseio.com",
  projectId: "프로젝트",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");

async function render() {
  grid.innerHTML = "";

  // 1. 데이터베이스에서 전체 사물함 데이터를 한 번만 가져옵니다.
  const lockersRef = ref(db, "lockers");
  const snapshot = await get(lockersRef);
  
  // 데이터가 있으면 가져오고, 없으면 빈 객체({})를 준비합니다.
  const lockersData = snapshot.exists() ? snapshot.val() : {};

  // 2. 1번부터 33번까지 사물함 칸을 만듭니다.
  for (let i = 1; i <= 33; i++) {
    let div = document.createElement("div");
    div.className = "locker";

    // 해당 번호(i)에 예약 데이터가 있는지 확인합니다.
    if (lockersData[i]) {
      div.classList.add("reserved");
      div.innerText = i + "\n" + lockersData[i].name;
    } else {
      div.innerText = i;
      
      // 빈 사물함을 클릭했을 때의 동작
      div.onclick = async () => {
        let name = prompt("예약자 이름을 입력하세요.");
        if (!name) return; // 취소하거나 빈 칸이면 무시

        // 클릭한 해당 번호에만 데이터를 저장합니다.
        let specificLockerRef = ref(db, "lockers/" + i);
        await set(specificLockerRef, { name: name });
        
        // 저장이 끝나면 화면을 다시 그립니다.
        render();
      };
    }
    grid.appendChild(div);
  }
}

render();