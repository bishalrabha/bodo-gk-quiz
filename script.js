let currentLang = 'en';
let currentScreen = 'level1';
let selectedCategory = null; // 'states' or 'world'
let selectedRegion = null;   // 'assam', 'arunachal', etc.
let selectedTopic = null;
let db = {};

// Load JSON Data + Smooth Splash Screen Hide
async function loadPortalData() {
  try {
    const response = await fetch('data.json');
    db = await response.json();
  } catch (error) {
    console.error("data.json load nahi ho paya:", error);
  } finally {
    // 1.5 second tak logo chalega, fir smooth fade out
    setTimeout(() => {
      const splash = document.getElementById('splashScreen');
      if (splash) {
        splash.classList.add('hidden');
      }
    }, 1500);
  }
}

// Start loading
loadPortalData();

function setScreen(screen) {
  currentScreen = screen;
  document.getElementById('viewLevel1').style.display = (screen === 'level1') ? 'block' : 'none';
  document.getElementById('viewLevelStates').style.display = (screen === 'levelStates') ? 'block' : 'none';
  document.getElementById('viewLevel2').style.display = (screen === 'level2') ? 'block' : 'none';
  document.getElementById('viewLevel3').style.display = (screen === 'level3') ? 'block' : 'none';
  document.getElementById('viewLevel4').style.display = (screen === 'level4') ? 'block' : 'none';

  const backBtn = document.getElementById('backBtn');
  backBtn.style.display = (screen === 'level1') ? 'none' : 'block';
}

function handleBack() {
  if (currentScreen === 'level4') {
    setScreen('level3');
    document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "Article" : "फरायसाली";
  } else if (currentScreen === 'level3') {
    setScreen('level2');
    document.getElementById('screenTitle').innerText = db[selectedRegion][currentLang === 'en' ? 'titleEn' : 'titleBodo'];
  } else if (currentScreen === 'level2') {
    if (selectedCategory === 'states') {
      setScreen('levelStates');
      document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "Indian States" : "भारतनि हादरसाफोर";
    } else {
      setScreen('level1');
      document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "State & Global GK" : "हादरसानि गियान";
    }
  } else if (currentScreen === 'levelStates') {
    setScreen('level1');
    document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "State & Global GK" : "हादरसानि गियान";
  }
}

// Category click (States vs World)
function openCategory(catKey) {
  selectedCategory = catKey;
  if (catKey === 'states') {
    setScreen('levelStates');
    document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "Indian States" : "भारतनि हादरसाफोर";
    document.getElementById('lbl-states-list-title').innerText = (currentLang === 'en') ? "Select State" : "हादरसा सायख'";
    renderStatesList();
  } else {
    selectedRegion = 'world';
    setScreen('level2');
    renderTopics();
  }
}

// Render States List
function renderStatesList() {
  const container = document.getElementById('statesContainer');
  container.innerHTML = "";

  const states = [
    { key: "assam", en: "Assam", bodo: "आसाम", descEn: "Dispur | 7 National Parks", descBodo: "दिसपुर | 7 ता हाग्रामा पार्क" },
    { key: "arunachal", en: "Arunachal Pradesh", bodo: "अरुणाचल प्रदेश", descEn: "Itanagar | Land of Dawn-lit Mountains", descBodo: "ईटानगर | सान ओंखारनाय हाजोनि हादरसा" },
    { key: "meghalaya", en: "Meghalaya", bodo: "मेघालय", descEn: "Shillong | Abode of Clouds", descBodo: "शिलंग | जोमबै जायगा" }
  ];

  states.forEach(s => {
    const card = document.createElement('div');
    card.className = "topic-card";
    card.onclick = () => openRegion(s.key);
    card.innerHTML = `
      <div class="topic-card-body">
        <h4>${currentLang === 'en' ? s.en : s.bodo}</h4>
        <span>${currentLang === 'en' ? s.descEn : s.descBodo}</span>
      </div>
      <div class="card-arrow-icon">›</div>
    `;
    container.appendChild(card);
  });
}

function openRegion(regKey) {
  if (!db[regKey]) {
    alert("This section data will be added soon!");
    return;
  }
  selectedRegion = regKey;
  setScreen('level2');
  renderTopics();
}

function renderTopics() {
  const reg = db[selectedRegion];
  document.getElementById('screenTitle').innerText = (currentLang === 'en') ? reg.titleEn : reg.titleBodo;
  document.getElementById('lbl-subtopic-title').innerText = (currentLang === 'en') ? "All Topics" : "गासै फराफोर";

  const container = document.getElementById('topicsContainer');
  container.innerHTML = "";

  reg.topics.forEach(t => {
    const card = document.createElement('div');
    card.className = "topic-card";
    card.onclick = () => openArticle(t);
    // Clean card: Views count removed
    card.innerHTML = `
      <div class="topic-card-body">
        <h4>${currentLang === 'en' ? t.titleEn : t.titleBodo}</h4>
      </div>
      <div class="card-arrow-icon">›</div>
    `;
    container.appendChild(card);
  });
}

function openArticle(topic) {
  selectedTopic = topic;
  setScreen('level3');
  document.getElementById('screenTitle').innerText = (currentLang === 'en') ? "Article" : "फरायसाली";

  document.getElementById('artTitle').innerText = (currentLang === 'en') ? topic.titleEn : topic.titleBodo;
  document.getElementById('artDesc').innerText = (currentLang === 'en') ? topic.descEn : topic.descBodo;
  document.getElementById('quizCalloutTxt').innerText = (currentLang === 'en') ? "Test your knowledge on this topic" : "दा बे फरायाव आनजाद लिर";

  const headers = (currentLang === 'en') ? topic.headersEn : topic.headersBodo;
  let tableHTML = `<table><thead><tr>`;
  headers.forEach(h => tableHTML += `<th>${h}</th>`);
  tableHTML += `</tr></thead><tbody>`;

  topic.rows.forEach(r => {
    tableHTML += `<tr>`;
    r.forEach(c => tableHTML += `<td>${c}</td>`);
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table>`;
  document.getElementById('tableContainer').innerHTML = tableHTML;
}

function toggleLanguage() {
  currentLang = (currentLang === 'en') ? 'bodo' : 'en';
  document.getElementById('langBtn').innerText = (currentLang === 'en') ? "बर' राव" : "English";

  document.getElementById('lbl-cat-states').innerText = (currentLang === 'en') ? "Indian States GK (भारतनि हादरसाफोर)" : "भारतनि हादरसाफोरनि गियान";
  document.getElementById('lbl-cat-world').innerText = (currentLang === 'en') ? "World GK (मुलुगनि गियान)" : "मुलुगनि गियान";

  if (currentScreen === 'levelStates') renderStatesList();
  if (currentScreen === 'level2') renderTopics();
  if (currentScreen === 'level3') openArticle(selectedTopic);
}

// Quiz System
let qIndex = 0;
let answered = false;

function startTopicQuiz() {
  if (!selectedTopic.quiz || selectedTopic.quiz.length === 0) return;
  setScreen('level4');
  document.getElementById('screenTitle').innerText = "Quiz Practice";
  qIndex = 0;
  loadQuiz();
}

function loadQuiz() {
  answered = false;
  const qList = selectedTopic.quiz;
  const cur = qList[qIndex];

  document.getElementById('qProgress').innerText = `Question ${qIndex + 1} of ${qList.length}`;
  document.getElementById('qTimer').innerText = `⏱️ 15s`;
  document.getElementById('qText').innerText = (currentLang === 'en') ? cur.qEn : cur.qBodo;
  document.getElementById('qFact').style.display = 'none';
  document.getElementById('qNextBtn').style.display = 'none';

  const box = document.getElementById('qOptions');
  box.innerHTML = "";

  cur.o.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = "opt-btn";
    btn.innerText = opt;
    btn.onclick = () => selectOpt(idx);
    box.appendChild(btn);
  });
}

function selectOpt(idx) {
  if (answered) return;
  answered = true;

  const cur = selectedTopic.quiz[qIndex];
  const btns = document.querySelectorAll('.opt-btn');

  if (idx === cur.a) {
    btns[idx].classList.add('correct');
  } else {
    btns[idx].classList.add('wrong');
    btns[cur.a].classList.add('correct');
  }

  const fact = document.getElementById('qFact');
  fact.innerText = "💡 Fact: " + ((currentLang === 'en') ? cur.factEn : cur.factBodo);
  fact.style.display = 'block';

  const nextBtn = document.getElementById('qNextBtn');
  nextBtn.style.display = 'block';
  nextBtn.innerText = (qIndex + 1 < selectedTopic.quiz.length) ? "Next Question" : "Back to Article";
}

function nextQuestion() {
  if (qIndex + 1 < selectedTopic.quiz.length) {
    qIndex++;
    loadQuiz();
  } else {
    handleBack();
  }
}

function filterItems() {
  const q = document.getElementById('mainSearch').value.toLowerCase();
  const cards = document.querySelectorAll('#viewLevel1 .topic-card');
  cards.forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
  });
  }
