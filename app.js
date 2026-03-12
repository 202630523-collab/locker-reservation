import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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

function openModal(title, desc) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-desc");
    const inputEl = document.getElementById("modal-input");
    const btnConfirm = document.getElementById("modal-confirm");
    const btnCancel = document.getElementById("modal-cancel");

    titleEl.innerText = title;
    descEl.innerText = desc;
    inputEl.value = ""; 
    
    overlay.classList.add("active");
    inputEl.focus();

    function close(result) {
      overlay.classList.remove("active");
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      resolve(result);
    }

    btnConfirm.onclick = () => close(inputEl.value.trim() || null);
    btnCancel.onclick = () => close(null);
    
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        close(inputEl.value.trim() || null);
      }
    };
  });
}

async function render() {
  grid.innerHTML = "";

  const lockersRef = ref(db, "lockers");
  const snapshot = await get(lockersRef);
  const lockersData = snapshot.exists() ? snapshot.val() : {};

  let occupiedCount = 0;
  const totalLockers = 33;

  for (let i = 1; i <= totalLockers; i++) {
    let div = document.createElement("div");
    div.className = "locker";

    if (lockersData[i]) {
      occupiedCount++; 
      
      div.classList.add("reserved");
      div.innerText = i + "\n사용중";
      
      div.onclick = async () => {
        let inputName = await openModal(
          "등록 취소", 
          i + "번 사물함 등록을 취소하시겠습니까?\n등록하신 이름을 정확히 입력해주세요."
        );
        
        if (inputName === null) return; 
        
        if (inputName === lockersData[i].name) {
          // 💡 [Level 2] 이름이 맞으면 비밀번호를 한 번 더 물어봅니다!
          let inputPin = prompt("🔒 설정하신 4자리 비밀번호를 입력해주세요.");
          if (inputPin === null) return; // 취소 누르면 중단
          
          // 예전에 등록해서 비밀번호가 없는 데이터는 '0000'으로 통과되게 예외 처리
          let savedPin = lockersData[i].pin || "0000"; 

          if (inputPin === savedPin) {
            let specificLockerRef = ref(db, "lockers/" + i);
            await remove(specificLockerRef);
            alert("✅ 등록이 안전하게 취소되었습니다.");
            render();
          } else {
            alert("❌ 비밀번호가 일치하지 않습니다!");
          }
        } else {
          alert("❌ 이름이 일치하지 않아 취소할 수 없습니다.");
        }
      };

    } else {
      div.innerText = i;
      
      div.onclick = async () => {
        const openTime = new Date("2026-03-12T21:47:00"); 
        const now = new Date();

        if (now < openTime) {
          alert("⏳ 아직 등록 시간이 아닙니다!\n(오픈 시간: 3월 14일 오후 6시 정각)");
          return; 
        }

        const agree = confirm(
          "🚨 [경고: 야자 12시간 필수] 🚨\n\n" +
          "본인은 '주 12시간 이상 야간자율학습' 참여자임을 확인합니다.\n\n" +
          "거짓으로 등록할 경우, 예고 없이 사물함 사용 권한이 박탈되며 안의 물건은 강제 철거됩니다.\n\n" +
          "동의하십니까?"
        );
        
        if (!agree) {
          alert("❌ 동의하지 않아 등록이 취소되었습니다.");
          return; 
        }

        let name = await openModal(
          "사물함 등록", 
          i + "번 사물함을 등록합니다.\n등록자 이름을 입력하세요."
        );
        
        if (!name) return; 

        // 💡 [Level 1] 1인 1사물함 중복 검사
        let isDuplicate = false;
        for (let key in lockersData) {
          if (lockersData[key] && lockersData[key].name === name) {
            isDuplicate = true;
            break;
          }
        }
        if (isDuplicate) {
          alert("❌ 이미 다른 사물함을 등록하셨습니다! (1인 1사물함 원칙)");
          return; // 중복이면 여기서 쫓아냄!
        }

        // 💡 [Level 2] 비밀번호 설정 (숫자 4자리)
        let pin = prompt("🔒 나중에 등록을 취소할 때 사용할\n'숫자 4자리 비밀번호'를 설정해주세요.");
        
        // 정규식을 사용해 숫자 4자리인지 엄격하게 검사
        if (!/^\d{4}$/.test(pin)) {
          alert("❌ 비밀번호는 '숫자 4자리'로 정확히 입력해야 합니다. (등록 실패)");
          return;
        }

        const nowTimeStr = new Date().toLocaleString('ko-KR', { 
          month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        let specificLockerRef = ref(db, "lockers/" + i);
        // 이름, 시간과 함께 비밀번호(pin)도 같이 저장합니다.
        await set(specificLockerRef, { name: name, time: nowTimeStr, pin: pin });
        
        render();
      };
    }
    grid.appendChild(div);
  }

  document.getElementById("count-occupied").innerText = occupiedCount;
  document.getElementById("count-available").innerText = totalLockers - occupiedCount;
}

render();

const quotes = [
  { text: "성공은 매일 반복한 작은 노력들의 합이다.", author: "- 로버트 콜리어 -" },
  { text: "오늘 걷지 않으면, 내일은 뛰어야 한다.", author: "- 카를레스 푸욜 -" },
  { text: "승리는 가장 끈기 있는 자에게 돌아간다.", author: "- 나폴레옹 보나파르트 -" },
  { text: "아무것도 하지 않으면 아무 일도 일어나지 않는다.", author: "- 기시미 이치로 -" },
  { text: "지금 잠을 자면 꿈을 꾸지만, 지금 공부하면 꿈을 이룬다.", author: "- 작자 미상 -" },
  { text: "이거 내가 만들었다.", author: "- 3학년 5반 최하은 -" },
  { text: "공부가 가장 잘되는 시간은 즉시", author: "- 이종호 선생님 -" } 
];

function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];
  document.getElementById("quote-text").innerText = `"${selectedQuote.text}"`;
  document.getElementById("quote-author").innerText = selectedQuote.author;
}
displayRandomQuote();