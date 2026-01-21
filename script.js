// ===== Elements (calculator) =====
const ageEl = document.getElementById("age");
const genderEl = document.getElementById("gender");
const weightEl = document.getElementById("weight");
const heightEl = document.getElementById("height");
const activityEl = document.getElementById("activity");
const goalEl = document.getElementById("goal");

const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");

const errBox = document.getElementById("errBox");
const resultCard = document.getElementById("resultCard");
const bmrValueEl = document.getElementById("bmrValue");
const tdeeValueEl = document.getElementById("tdeeValue");
const goalTextEl = document.getElementById("goalText");
const bmiValueEl = document.getElementById("bmiValue");
const bmiStatusEl = document.getElementById("bmiStatus");
const rangeValueEl = document.getElementById("rangeValue");

// ===== Elements (menu) =====
const menuBtn = document.getElementById("menuBtn");
const menuClearBtn = document.getElementById("menuClearBtn");
const menuResult = document.getElementById("menuResult");

const mBreakfast = document.getElementById("mBreakfast");
const mLunch = document.getElementById("mLunch");
const mDinner = document.getElementById("mDinner");
const mSnack = document.getElementById("mSnack");

const kBreakfast = document.getElementById("kBreakfast");
const kLunch = document.getElementById("kLunch");
const kDinner = document.getElementById("kDinner");
const kSnack = document.getElementById("kSnack");

const menuNote = document.getElementById("menuNote");

// ===== State =====
let latestTargetCalories = null;

// ===== Helpers =====
function showError(msg){
  errBox.style.display = "block";
  errBox.textContent = msg;
}
function clearError(){
  errBox.style.display = "none";
  errBox.textContent = "";
}

function calculateBMR(gender, weightKg, heightCm, age){
  // Mifflin–St Jeor
  if (gender === "male"){
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function calculateBMI(weightKg, heightCm){
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

function bmiCategoryAsia(bmi){
  if (bmi < 18.5) return "น้ำหนักน้อย";
  if (bmi < 23) return "ปกติ";
  if (bmi < 25) return "ท้วม";
  if (bmi < 30) return "อ้วน";
  return "อ้วนมาก";
}

function goalAdjustText(goal){
  if (goal === "lose") return "โหมด: ลดน้ำหนัก (−300 kcal)";
  if (goal === "gain") return "โหมด: เพิ่มน้ำหนัก (+300 kcal)";
  return "โหมด: คงน้ำหนัก (0 kcal)";
}

function formatKcal(x){
  return `${Math.round(x)} kcal/วัน`;
}

function getSelectedAllergies(){
  return Array.from(document.querySelectorAll(".allergy:checked")).map(cb => cb.value);
}
function isAllowed(menu, banned){
  return !menu.allergens.some(a => banned.includes(a));
}
function pickClosest(candidates, targetKcal){
  if (candidates.length === 0) return null;

  // เรียงตามความใกล้ของแคล
  const sorted = candidates
    .map(item => ({ item, diff: Math.abs(item.kcal - targetKcal) }))
    .sort((a,b) => a.diff - b.diff);

  // เลือกสุ่มจากที่ใกล้สุด
  const topN = Math.min(5, sorted.length);
  const pick = sorted[Math.floor(Math.random() * topN)].item;

  return pick;
}

const MENU_DB = [
  // --- Breakfast ---
  {name:"โจ๊กหมูใส่ไข่", kcal:380, tags:["breakfast"], allergens:["pork","egg"]},
  {name:"โจ๊กไก่", kcal:350, tags:["breakfast"], allergens:["chicken"]},
  {name:"ข้าวต้มปลา", kcal:320, tags:["breakfast"], allergens:["seafood"]},
  {name:"ข้าวต้มหมูสับ", kcal:380, tags:["breakfast"], allergens:["pork"]},
  {name:"ไข่กระทะ", kcal:450, tags:["breakfast"], allergens:["egg","milk"]},
  {name:"ไข่คน + ขนมปังโฮลวีต", kcal:420, tags:["breakfast"], allergens:["egg","milk","flour"]},
  {name:"ซีเรียล + นม", kcal:380, tags:["breakfast"], allergens:["milk","flour"]},
  {name:"โอ๊ตมีล + ผลไม้", kcal:360, tags:["breakfast"], allergens:[]},
  {name:"โยเกิร์ต + กล้วย", kcal:300, tags:["breakfast"], allergens:["milk"]},
  {name:"โยเกิร์ต + กราโนล่า", kcal:380, tags:["breakfast"], allergens:["milk","nuts","flour"]},
  {name:"แซนด์วิชทูน่า", kcal:420, tags:["breakfast"], allergens:["seafood","egg","milk","flour"]},
  {name:"แซนด์วิชอกไก่", kcal:430, tags:["breakfast"], allergens:["chicken","milk","flour"]},
  {name:"ข้าวเหนียวหมูปิ้ง", kcal:520, tags:["breakfast"], allergens:["pork"]},
  {name:"ข้าวเหนียวไก่ย่าง", kcal:520, tags:["breakfast"], allergens:["chicken"]},
  {name:"ข้าวไข่เจียว", kcal:560, tags:["breakfast"], allergens:["egg"]},
  {name:"บะหมี่น้ำไก่", kcal:520, tags:["breakfast"], allergens:["chicken","egg","flour"]},
  {name:"ก๋วยเตี๋ยวเส้นเล็กน้ำใส", kcal:480, tags:["breakfast"], allergens:["flour"]},

  // --- Lunch ---
  {name:"ข้าวกะเพราไก่", kcal:650, tags:["lunch"], allergens:["chicken"]},
  {name:"ข้าวกะเพราหมูสับ", kcal:700, tags:["lunch"], allergens:["pork"]},
  {name:"ข้าวมันไก่", kcal:720, tags:["lunch"], allergens:["chicken"]},
  {name:"สุกี้แห้งไก่", kcal:550, tags:["lunch"], allergens:["chicken","egg","flour"]},
  {name:"สุกี้แห้งทะเล", kcal:600, tags:["lunch"], allergens:["seafood","egg","flour"]},
  {name:"ผัดไทยกุ้ง", kcal:680, tags:["lunch"], allergens:["seafood","egg","nuts","flour"]},
  {name:"ผัดซีอิ๊วไก่", kcal:730, tags:["lunch"], allergens:["chicken","egg","flour"]},
  {name:"ราดหน้าไก่", kcal:700, tags:["lunch"], allergens:["chicken","flour"]},
  {name:"ข้าวผัดกุ้ง", kcal:700, tags:["lunch"], allergens:["seafood","egg"]},
  {name:"ข้าวผัดไก่", kcal:680, tags:["lunch"], allergens:["chicken","egg"]},
  {name:"อกไก่ย่าง + ข้าวกล้อง", kcal:620, tags:["lunch"], allergens:["chicken"]},
  {name:"สลัดอกไก่", kcal:420, tags:["lunch"], allergens:["chicken"]},
  {name:"ยำทูน่า", kcal:460, tags:["lunch"], allergens:["seafood"]},
  {name:"ก๋วยเตี๋ยวเรือหมู", kcal:620, tags:["lunch"], allergens:["pork","flour"]},

  // --- Dinner ---
  {name:"แกงจืดเต้าหู้หมูสับ", kcal:520, tags:["dinner"], allergens:["pork"]},
  {name:"ต้มยำเห็ดน้ำใส + ข้าว", kcal:520, tags:["dinner"], allergens:[]},
  {name:"แกงเลียง + ข้าว", kcal:560, tags:["dinner"], allergens:[]},
  {name:"ปลาย่าง + ข้าวกล้อง", kcal:650, tags:["dinner"], allergens:["seafood"]},
  {name:"อกไก่นึ่ง/ย่าง + ผักลวก", kcal:480, tags:["dinner"], allergens:["chicken"]},
  {name:"ผัดผักรวม + เต้าหู้", kcal:480, tags:["dinner"], allergens:[]},
  {name:"ข้าวผัดไข่", kcal:560, tags:["dinner"], allergens:["egg"]},
  {name:"สุกี้น้ำไก่", kcal:520, tags:["dinner"], allergens:["chicken","egg","flour"]},
  {name:"สุกี้น้ำทะเล", kcal:560, tags:["dinner"], allergens:["seafood","egg","flour"]},
  {name:"ข้าวหน้าไข่ข้น", kcal:650, tags:["dinner"], allergens:["egg","milk"]},

  // --- Snack ---
  {name:"แตงโม 2 ชิ้น", kcal:60, tags:["snack"], allergens:[]},
  {name:"ส้ม 1 ลูก", kcal:80, tags:["snack"], allergens:[]},
  {name:"กีวี 1 ลูก", kcal:70, tags:["snack"], allergens:[]},
  {name:"ฝรั่ง 1 ลูก", kcal:100, tags:["snack"], allergens:[]},
  {name:"แอปเปิล 1 ลูก", kcal:95, tags:["snack"], allergens:[]},
  {name:"กล้วย 1 ลูก", kcal:110, tags:["snack"], allergens:[]},
  {name:"ผลไม้รวมถ้วยเล็ก", kcal:120, tags:["snack"], allergens:[]},
  {name:"สาหร่ายอบ 1 ซอง", kcal:50, tags:["snack"], allergens:[]},
  {name:"ข้าวโพดต้ม 1 ฝักเล็ก", kcal:140, tags:["snack"], allergens:[]},
  {name:"มันหวานนึ่ง 1 ชิ้น", kcal:160, tags:["snack"], allergens:[]},
  {name:"เต้าหู้เย็น/พุดดิ้งเต้าหู้", kcal:150, tags:["snack"], allergens:[]},
  {name:"นมถั่วเหลืองไม่หวาน", kcal:120, tags:["snack"], allergens:[]},

  {name:"ไข่ต้ม 1 ฟอง", kcal:70, tags:["snack"], allergens:["egg"]},
  {name:"อกไก่ฉีก/ไก่ต้ม (ชิ้นเล็ก)", kcal:120, tags:["snack"], allergens:["chicken"]},
  {name:"ทูน่าในน้ำแร่ (ครึ่งกระป๋อง)", kcal:90, tags:["snack"], allergens:["seafood"]},

  {name:"นมจืด 1 แก้ว", kcal:150, tags:["snack"], allergens:["milk"]},
  {name:"โยเกิร์ตรสธรรมชาติ", kcal:130, tags:["snack"], allergens:["milk"]},
  {name:"ชีส 1 แผ่น", kcal:90, tags:["snack"], allergens:["milk"]},
  {name:"โปรตีนเชค 1 serving", kcal:200, tags:["snack"], allergens:["milk"]},

  {name:"อัลมอนด์ 10 เม็ด", kcal:120, tags:["snack"], allergens:["nuts"]},
  {name:"ถั่วลิสงอบ 1 กำมือเล็ก", kcal:170, tags:["snack"], allergens:["nuts"]},

  // snack ที่มีแป้ง
  {name:"ขนมปังโฮลวีต 1 แผ่น", kcal:80, tags:["snack"], allergens:["flour"]},
  {name:"แครกเกอร์ 1 ซองเล็ก", kcal:150, tags:["snack"], allergens:["flour"]},
];

// ===== Analyze Calories =====
function analyze(){
  clearError();

  const age = Number(ageEl.value);
  const gender = genderEl.value;
  const weight = Number(weightEl.value);
  const height = Number(heightEl.value);
  const activity = Number(activityEl.value);
  const goal = goalEl.value;

  if (!age || !weight || !height){
    resultCard.style.display = "none";
    latestTargetCalories = null;
    showError("กรุณากรอกข้อมูลให้ครบก่อนนะ");
    return;
  }
  if (age < 1 || age > 120){
    resultCard.style.display = "none";
    latestTargetCalories = null;
    showError("อายุควรอยู่ระหว่าง 1–120 ปี");
    return;
  }

  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = bmr * activity;

  let adjusted = tdee;
  if (goal === "lose") adjusted = tdee - 300;
  if (goal === "gain") adjusted = tdee + 300;
  if (adjusted < 1200) adjusted = 1200;

  const bmi = calculateBMI(weight, height);
  const bmiCat = bmiCategoryAsia(bmi);

  latestTargetCalories = adjusted;

  resultCard.style.display = "block";
  bmrValueEl.textContent = formatKcal(bmr);
  tdeeValueEl.textContent = formatKcal(adjusted);
  goalTextEl.textContent = goalAdjustText(goal);

  bmiValueEl.textContent = bmi.toFixed(1);
  bmiStatusEl.textContent = bmiCat;

  const low = Math.round(adjusted * 0.9);
  const high = Math.round(adjusted * 1.1);
  rangeValueEl.textContent = `ช่วงแนะนำคร่าว ๆ (±10%): ${low} – ${high} kcal/วัน`;

  // ถ้าวิเคราะห์ใหม่จะซ่อนเมนูเก่า
  menuResult.style.display = "none";
}

// ===== Menu Generation =====
function generateDailyMenu(){
  if (!latestTargetCalories){
    alert("กรุณากดวิเคราะห์แคลอรี่ก่อน แล้วค่อยสุ่มเมนูอาหาร");
    return;
  }

  const banned = getSelectedAllergies();
  const target = latestTargetCalories;

  // 4 มื้อ: เช้า 25% กลางวัน 35% เย็น 30% ของว่าง 10%
  const tB = Math.round(target * 0.25);
  const tL = Math.round(target * 0.35);
  const tD = Math.round(target * 0.30);
  const tS = Math.round(target * 0.10);

  const breakfastList = MENU_DB.filter(m => m.tags.includes("breakfast") && isAllowed(m, banned));
  const lunchList = MENU_DB.filter(m => m.tags.includes("lunch") && isAllowed(m, banned));
  const dinnerList = MENU_DB.filter(m => m.tags.includes("dinner") && isAllowed(m, banned));
  const snackList = MENU_DB.filter(m => m.tags.includes("snack") && isAllowed(m, banned));

  if (breakfastList.length === 0 || lunchList.length === 0 || dinnerList.length === 0 || snackList.length === 0){
    alert("เมนูไม่พอ (อาจติ๊กแพ้เยอะเกิน) ลองเอาติ๊กบางอันออก หรือเพิ่มเมนูใน MENU_DB");
    return;
  }

  const b = pickClosest(breakfastList, tB);
  const l = pickClosest(lunchList, tL);
  const d = pickClosest(dinnerList, tD);
  const s = pickClosest(snackList, tS);

  // กดซ้ำ = สุ่มใหม่เสมอ
  menuResult.style.display = "block";

  mBreakfast.textContent = b.name;
  mLunch.textContent = l.name;
  mDinner.textContent = d.name;
  mSnack.textContent = s.name;

  kBreakfast.textContent = `${b.kcal} kcal (เป้า ~${tB})`;
  kLunch.textContent = `${l.kcal} kcal (เป้า ~${tL})`;
  kDinner.textContent = `${d.kcal} kcal (เป้า ~${tD})`;
  kSnack.textContent = `${s.kcal} kcal (เป้า ~${tS})`;

  menuNote.textContent = `สุ่มจากเป้าหมาย ~ ${Math.round(target)} kcal/วัน (หลังปรับเป้าหมาย) และกรองตามสิ่งที่แพ้แล้ว`;
}

// ===== Clear =====
function clearAll(){
  clearError();

  ageEl.value = "";
  weightEl.value = "";
  heightEl.value = "";
  genderEl.value = "male";
  activityEl.value = "1.55";
  goalEl.value = "maintain";

  latestTargetCalories = null;

  resultCard.style.display = "none";
  menuResult.style.display = "none";
}

function clearMenu(){
  menuResult.style.display = "none";
}

// ===== Events =====
calcBtn.addEventListener("click", analyze);
clearBtn.addEventListener("click", clearAll);

menuBtn.addEventListener("click", generateDailyMenu);
menuClearBtn.addEventListener("click", clearMenu);

// Enter เพื่อคำนวณได้
[ageEl, weightEl, heightEl].forEach(el => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") analyze();
  });
});