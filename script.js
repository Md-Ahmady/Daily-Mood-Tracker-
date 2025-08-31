// Utility: Get today's date in yyyy-mm-dd format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Set current date display
document.getElementById("current-date").textContent = `Today: ${getTodayDate()}`;

// Mood to color mapping (CSS classes)
const moodClasses = {
  happy: "mood-happy",
  sad: "mood-sad",
  angry: "mood-angry",
  anxious: "mood-anxious",
  calm: "mood-calm",
  excited: "mood-excited",
};

// Mood to quote mapping
const moodQuotes = {
  happy: "Keep smiling, it's contagious!",
  sad: "It's okay to feel down. Better days are coming.",
  angry: "Take a deep breath. You're stronger than your anger.",
  anxious: "This too shall pass.",
  calm: "Peace begins with a smile.",
  excited: "Stay pumped! The world is yours.",
};

// Variables for calendar navigation
let currentYear, currentMonth; // integers

// Initialize currentYear and currentMonth to today
function initCurrentDate() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
}

// Save mood and note to localStorage
function saveMood(mood, note = "") {
  const date = getTodayDate();
  let moodData = JSON.parse(localStorage.getItem("moodData")) || {};
  moodData[date] = { mood, note };
  localStorage.setItem("moodData", JSON.stringify(moodData));
  renderCalendar(currentYear, currentMonth);
  renderQuote(mood);
  updateChart();
  renderNoteForToday();
  updateSummary();
}

// Event listener for mood buttons
document.querySelectorAll(".emoji-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedMood = btn.dataset.mood;
    const noteInput = document.getElementById("mood-note");
    saveMood(selectedMood, noteInput.value.trim());
    noteInput.value = ""; // Clear after saving
  });
});

// Render quote based on mood
function renderQuote(mood) {
  const quoteBox = document.getElementById("quote-text");
  if (!quoteBox) {
    // Create quote box if not exists
    const section = document.createElement("section");
    section.className = "quote-section";
    const p = document.createElement("p");
    p.id = "quote-text";
    p.textContent = moodQuotes[mood] || "Stay mindful and take care.";
    section.appendChild(p);
    document.body.insertBefore(section, document.querySelector(".mood-history"));
  } else {
    quoteBox.textContent = moodQuotes[mood] || "Stay mindful and take care.";
  }
}

// Render note for today's mood
function renderNoteForToday() {
  const date = getTodayDate();
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {};
  const noteDisplay = document.getElementById("note-display");
  if (moodData[date] && moodData[date].note) {
    noteDisplay.textContent = `Note: ${moodData[date].note}`;
  } else {
    noteDisplay.textContent = "No note added for today.";
  }
}

// Generate calendar for given year and month
function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar-view");
  calendar.innerHTML = "";

  const moodData = JSON.parse(localStorage.getItem("moodData")) || {};

  // Show month-year text
  const monthYearLabel = document.getElementById("month-year");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  // Weekday headers (Sun-Sat)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    const dayHeader = document.createElement("div");
    dayHeader.textContent = day;
    dayHeader.classList.add("weekday");
    calendar.appendChild(dayHeader);
  });

  // First day of month and how many days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();

  // Calculate day of week of first day (0-6 Sun-Sat)
  const startDay = firstDay.getDay();

  // Calculate total grid cells (including blanks before and after)
  // Fill previous month's days for better UI (optional)
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Fill days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = prevMonthLastDay - i;
    dayDiv.classList.add("outside-month");
    calendar.appendChild(dayDiv);
  }

  // Fill days of current month
  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;

    if (moodData[dateStr]) {
      const mood = moodData[dateStr].mood;
      if (mood && moodClasses[mood]) {
        dayDiv.classList.add(moodClasses[mood]);
        dayDiv.title = `${mood.charAt(0).toUpperCase() + mood.slice(1)} - Note: ${moodData[dateStr].note || "No note"}`;
      }
    }

    calendar.appendChild(dayDiv);
  }

  // Fill next month's days to complete the grid (total cells should be multiple of 7)
  const totalCells = startDay + numDays;
  const nextMonthDaysToShow = (7 - (totalCells % 7)) % 7;

  for (let i = 1; i <= nextMonthDaysToShow; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = i;
    dayDiv.classList.add("outside-month");
    calendar.appendChild(dayDiv);
  }
}

// Calendar navigation buttons
document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

// Update mood chart
function updateChart() {
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {};

  const counts = {
    happy: 0,
    sad: 0,
    angry: 0,
    anxious: 0,
    calm: 0,
    excited: 0,
  };

  Object.values(moodData).forEach(entry => {
    if (entry.mood && counts[entry.mood] !== undefined) {
      counts[entry.mood]++;
    }
  });

  const ctx = document.getElementById("moodChart").getContext("2d");
  if (window.moodChart) window.moodChart.destroy();

  window.moodChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: "Mood Frequency",
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(m => {
          switch (m) {
            case "happy": return "#FFD700";
            case "sad": return "#87CEEB";
            case "angry": return "#FF6347";
            case "anxious": return "#9370DB";
            case "calm": return "#90EE90";
            case "excited": return "#FFA500";
            default: return "#ccc";
          }
        }),
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, stepSize: 1 }
      }
    }
  });
}

// Calculate and update summary stats
function updateSummary() {
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {};
  const moods = Object.values(moodData).map(e => e.mood).filter(Boolean);

  if (moods.length === 0) {
    document.getElementById("common-mood-name").textContent = "-";
    document.getElementById("average-score").textContent = "-";
    document.getElementById("mood-count").textContent = "0";
    document.getElementById("streak-count").textContent = "0";
    document.getElementById("positive-day-date").textContent = "-";
    return;
  }

  // Most common mood
  const counts = {};
  moods.forEach(m => {
    counts[m] = (counts[m] || 0) + 1;
  });
  const commonMood = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
  document.getElementById("common-mood-name").textContent = commonMood.charAt(0).toUpperCase() + commonMood.slice(1);

  // Average mood score (assign scores for moods)
  const moodScores = {
    happy: 5,
    excited: 5,
    calm: 4,
    anxious: 2,
    sad: 1,
    angry: 0,
  };

  const totalScore = moods.reduce((sum, m) => sum + (moodScores[m] || 0), 0);
  const avgScore = (totalScore / moods.length).toFixed(2);
  document.getElementById("average-score").textContent = avgScore;

  // Total moods recorded
  document.getElementById("mood-count").textContent = moods.length;

  // Best streak of same mood days
  let bestStreak = 1, currentStreak = 1;
  const sortedDates = Object.keys(moodData).sort();
  for (let i = 1; i < sortedDates.length; i++) {
    const prevMood = moodData[sortedDates[i-1]].mood;
    const currMood = moodData[sortedDates[i]].mood;
    const prevDate = new Date(sortedDates[i-1]);
    const currDate = new Date(sortedDates[i]);
    const dayDiff = (currDate - prevDate) / (1000*60*60*24);

    if (dayDiff === 1 && currMood === prevMood) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;
  }
  document.getElementById("streak-count").textContent = bestStreak;

  // Most positive day (highest score)
  let maxScore = -1;
  let maxScoreDate = "";
  for (const date in moodData) {
    const mood = moodData[date].mood;
    const score = moodScores[mood] || 0;
    if (score > maxScore) {
      maxScore = score;
      maxScoreDate = date;
    }
  }
  document.getElementById("positive-day-date").textContent = maxScoreDate || "-";
}

// Initialize app
function init() {
  initCurrentDate();
  renderCalendar(currentYear, currentMonth);
  updateChart();
  renderNoteForToday();
  updateSummary();
}

init();
