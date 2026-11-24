// ========================================================
// Yahtzee-JS - Core Game Logic & Rules Engine
// ========================================================

// Global Game State
var dice = [1, 1, 1, 1, 1];
var held = [false, false, false, false, false];
var rollCount = 0;       // 0, 1, 2, or 3
var currentTurn = 1;     // Turn 1 to 13
var totalScore = 0;
var upperScore = 0;
var bonusScore = 0;
var lowerScore = 0;
var yahtzeeBonus = 0;    // Count of bonus Yahtzees (each +100)
var firstYahtzeeScored = false;

// Category scores: null = open, number = scored (including 0)
var categoryScores = {
  1: null,  // 1's
  2: null,  // 2's
  3: null,  // 3's
  4: null,  // 4's
  5: null,  // 5's
  6: null,  // 6's
  7: null,  // 3 of a Kind
  8: null,  // 4 of a Kind
  9: null,  // Small Straight (30)
  10: null, // Large Straight (40)
  11: null, // Full House (25)
  12: null, // Chance (sum)
  13: null  // Yahtzee (50)
};

// Legacy form compatibility mappings
var yahtzbox_array = new Array();

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", function () {
  initLegacyBindings();
  loadHighScores();
  renderDice();
  updateUI();
  yahtzlogger("Welcome to Yahtzee! Click 'Roll Dice' to begin.");
});

function initLegacyBindings() {
  if (!document.yahtzform) return;
  yahtzbox_array[0] = { value: "" }; // dummy invalid
  for (var i = 1; i <= 13; i++) {
    yahtzbox_array[i] = document.yahtzform["yahtzbox" + i];
  }
}

// ========================================================
// SCENARIO SCORING CALCULATIONS (Fixed & Comprehensive)
// ========================================================

function getDiceCounts(d) {
  var counts = {};
  for (var i = 0; i < d.length; i++) {
    counts[d[i]] = (counts[d[i]] || 0) + 1;
  }
  return counts;
}

function getDiceSum(d) {
  var s = 0;
  for (var i = 0; i < d.length; i++) s += d[i];
  return s;
}

// Upper section: Ones through Sixes
function calcUpper(d, face) {
  var count = 0;
  for (var i = 0; i < d.length; i++) {
    if (d[i] === face) count++;
  }
  return count * face;
}

// 3 of a Kind: At least 3 of any number, scores sum of all 5 dice
function calcThreeOfAKind(d) {
  var counts = getDiceCounts(d);
  for (var val in counts) {
    if (counts[val] >= 3) return getDiceSum(d);
  }
  return 0;
}

// 4 of a Kind: At least 4 of any number, scores sum of all 5 dice
function calcFourOfAKind(d) {
  var counts = getDiceCounts(d);
  for (var val in counts) {
    if (counts[val] >= 4) return getDiceSum(d);
  }
  return 0;
}

// Full House: 3 of one number and 2 of another (or 5 of a kind under official Yahtzee Joker rules). Scores 25.
function calcFullHouse(d) {
  var counts = getDiceCounts(d);
  var vals = Object.values ? Object.values(counts) : [];
  if (vals.length === 0) {
    for (var k in counts) vals.push(counts[k]);
  }
  vals.sort(function (a, b) { return b - a; });
  if ((vals[0] === 3 && vals[1] === 2) || vals[0] === 5) {
    return 25;
  }
  return 0;
}

// Small Straight: 4 consecutive numbers (1-2-3-4, 2-3-4-5, or 3-4-5-6). Scores 30.
function calcSmallStraight(d) {
  var has1 = d.indexOf(1) !== -1;
  var has2 = d.indexOf(2) !== -1;
  var has3 = d.indexOf(3) !== -1;
  var has4 = d.indexOf(4) !== -1;
  var has5 = d.indexOf(5) !== -1;
  var has6 = d.indexOf(6) !== -1;

  if (has1 && has2 && has3 && has4) return 30;
  if (has2 && has3 && has4 && has5) return 30;
  if (has3 && has4 && has5 && has6) return 30;
  return 0;
}

// Large Straight: 5 consecutive numbers (1-2-3-4-5 or 2-3-4-5-6). Scores 40.
function calcLargeStraight(d) {
  var has1 = d.indexOf(1) !== -1;
  var has2 = d.indexOf(2) !== -1;
  var has3 = d.indexOf(3) !== -1;
  var has4 = d.indexOf(4) !== -1;
  var has5 = d.indexOf(5) !== -1;
  var has6 = d.indexOf(6) !== -1;

  if (has1 && has2 && has3 && has4 && has5) return 40;
  if (has2 && has3 && has4 && has5 && has6) return 40;
  return 0;
}

// Yahtzee: 5 of a kind. Scores 50.
function calcYahtzee(d) {
  var first = d[0];
  for (var i = 1; i < d.length; i++) {
    if (d[i] !== first) return 0;
  }
  return 50;
}

// Calculate potential score for a category index (1 to 13)
function calculatePotentialScore(catIndex, currentDice) {
  if (catIndex >= 1 && catIndex <= 6) {
    return calcUpper(currentDice, catIndex);
  }
  switch (catIndex) {
    case 7: return calcThreeOfAKind(currentDice);
    case 8: return calcFourOfAKind(currentDice);
    case 9: return calcSmallStraight(currentDice);
    case 10: return calcLargeStraight(currentDice);
    case 11: return calcFullHouse(currentDice);
    case 12: return getDiceSum(currentDice); // Chance
    case 13: return calcYahtzee(currentDice);
    default: return 0;
  }
}

// ========================================================
// CORE GAMEPLAY ACTIONS
// ========================================================

// Fair dice roll using Math.floor(Math.random() * 6) + 1
function roll() {
  if (rollCount >= 3) {
    yahtzlogger("-- Maximum 3 rolls reached! Please select a category to score.");
    return;
  }

  rollCount++;
  var rolledIndexes = [];

  for (var i = 0; i < 5; i++) {
    if (!held[i]) {
      dice[i] = Math.floor(Math.random() * 6) + 1;
      rolledIndexes.push(i);
    }
  }

  // Update legacy dice values
  if (document.yahtzform) {
    document.yahtzform.yahtzdice1.value = dice[0];
    document.yahtzform.yahtzdice2.value = dice[1];
    document.yahtzform.yahtzdice3.value = dice[2];
    document.yahtzform.yahtzdice4.value = dice[3];
    document.yahtzform.yahtzdice5.value = dice[4];
    document.yahtzform.yahtzturn.value = rollCount;
  }

  renderDice(rolledIndexes);
  updatePreviews();
  updateUI();

  yahtzlogger("Roll #" + rollCount + ": [" + dice.join(", ") + "]");

  // Check if rolled a Yahtzee
  if (calcYahtzee(dice) === 50) {
    if (firstYahtzeeScored) {
      yahtzlogger("🎉 YAHTZEE BONUS! You rolled another 5 of a kind! (+100 pts bonus)");
    } else {
      yahtzlogger("🎉 YAHTZEE! 5 of a kind! Choose 'Yahtzee' to score 50 points!");
    }
  }
}

// Toggle hold for a die
function toggleHold(index) {
  if (rollCount === 0) {
    yahtzlogger("-- Roll the dice first before holding.");
    return;
  }
  held[index] = !held[index];

  // Update legacy checkboxes
  if (document.yahtzform) {
    var chk = document.yahtzform["chkyahtzbox" + (index + 1)];
    if (chk) chk.checked = held[index];
  }

  renderDice();
}

// Select a category from dropdown or table click
function selectCategory(catIndex) {
  if (categoryScores[catIndex] !== null) {
    yahtzlogger("-- Category already scored: " + getCategoryName(catIndex));
    return;
  }

  var select = document.yahtzform ? document.yahtzform.yahtzmenu : null;
  if (select) {
    select.selectedIndex = catIndex;
  }

  // Highlight selected row
  var rows = document.querySelectorAll(".score-row");
  rows.forEach(function (r) {
    var idx = parseInt(r.getAttribute("data-category"), 10);
    if (idx === catIndex) {
      r.classList.add("selected");
    } else {
      r.classList.remove("selected");
    }
  });

  if (rollCount > 0) {
    var preview = calculatePotentialScore(catIndex, dice);
    yahtzlogger("Selected " + getCategoryName(catIndex) + " (would score " + preview + " points).");
  }
}

// Score the selected category (Take Score)
function yahtzstand() {
  if (rollCount === 0) {
    yahtzlogger("-- You haven't rolled the dice yet!");
    return;
  }

  var catIndex = getSelectedCategoryIndex();
  if (catIndex === 0 || isNaN(catIndex)) {
    yahtzlogger("-- Please choose a category first.");
    return;
  }

  if (categoryScores[catIndex] !== null) {
    yahtzlogger("-- You already used this category!");
    return;
  }

  // Check for Yahtzee Bonus (+100) if user already has Yahtzee = 50 and rolled another Yahtzee
  var isCurrentYahtzee = (calcYahtzee(dice) === 50);
  if (isCurrentYahtzee && categoryScores[13] === 50) {
    yahtzeeBonus++;
    totalScore += 100;
    yahtzlogger("★ YAHTZEE BONUS! +100 points awarded!");
  }

  var earnedPoints = calculatePotentialScore(catIndex, dice);

  // If points are 0, check if this is intentional or if they should take zero
  if (earnedPoints === 0 && catIndex !== 12) { // 12 is chance which is always sum
    var confirmZero = window.confirm(
      "Your dice roll gives 0 points for " + getCategoryName(catIndex) + ".\nAre you sure you want to take 0 for this category?"
    );
    if (!confirmZero) {
      yahtzlogger("-- Scoring cancelled. Select a different category or re-roll.");
      return;
    }
  }

  recordScore(catIndex, earnedPoints);
}

// Take zero for a category (Scratch)
function wastemy() {
  if (rollCount === 0) {
    yahtzlogger("-- You haven't rolled the dice yet!");
    return;
  }

  var catIndex = getSelectedCategoryIndex();
  if (catIndex === 0 || isNaN(catIndex)) {
    yahtzlogger("-- Please choose a category first to take a zero.");
    return;
  }

  if (categoryScores[catIndex] !== null) {
    yahtzlogger("-- You already used this category!");
    return;
  }

  var confirmScratch = window.confirm("Are you sure you want to take a ZERO for " + getCategoryName(catIndex) + "?");
  if (!confirmScratch) return;

  recordScore(catIndex, 0);
}

// Record score and advance turn
function recordScore(catIndex, points) {
  categoryScores[catIndex] = points;
  if (catIndex === 13 && points === 50) {
    firstYahtzeeScored = true;
  }

  // Update legacy array and form boxes
  if (document.yahtzform) {
    var box = document.yahtzform["yahtzbox" + catIndex];
    if (box) box.value = points;
  }

  yahtzlogger("✔ Scored " + points + " points for " + getCategoryName(catIndex) + " with [" + dice.join(", ") + "].");

  recalculateTotals();
  updateUI();

  // Check if all 13 categories are scored
  if (isGameOver()) {
    end_game();
  } else {
    nextturn();
  }
}

// Next turn setup
function nextturn() {
  currentTurn++;
  rollCount = 0;
  held = [false, false, false, false, false];

  if (document.yahtzform) {
    document.yahtzform.chkyahtzbox1.checked = false;
    document.yahtzform.chkyahtzbox2.checked = false;
    document.yahtzform.chkyahtzbox3.checked = false;
    document.yahtzform.chkyahtzbox4.checked = false;
    document.yahtzform.chkyahtzbox5.checked = false;
    document.yahtzform.yahtzturn.value = 0;
    document.yahtzform.yahtzmenu.selectedIndex = 0;
  }

  renderDice();
  clearPreviews();
  updateUI();
  yahtzlogger("--- Turn " + currentTurn + " of 13 ---");
}

// Recalculate Upper, Bonus, Lower, and Grand Total
function recalculateTotals() {
  upperScore = 0;
  for (var i = 1; i <= 6; i++) {
    if (categoryScores[i] !== null) upperScore += categoryScores[i];
  }

  // 63 or higher gets 35 bonus points
  bonusScore = (upperScore >= 63) ? 35 : 0;

  lowerScore = 0;
  for (var j = 7; j <= 13; j++) {
    if (categoryScores[j] !== null) lowerScore += categoryScores[j];
  }
  lowerScore += (yahtzeeBonus * 100);

  totalScore = upperScore + bonusScore + lowerScore;

  // Update legacy form elements
  if (document.yahtzform) {
    document.yahtzform.runbonus.value = upperScore;
    document.yahtzform.yahtzmsg.value = totalScore;
  }
}

function isGameOver() {
  for (var i = 1; i <= 13; i++) {
    if (categoryScores[i] === null) return false;
  }
  return true;
}

// Game Over Handling
function end_game() {
  recalculateTotals();
  updateUI();

  var bonusEarnedMsg = (upperScore >= 63)
    ? "You earned the 35 upper section bonus points! (Upper total: " + upperScore + ")"
    : "You did not earn the 35 bonus points. (Upper total: " + upperScore + "/63)";

  var yBonusMsg = (yahtzeeBonus > 0)
    ? " Yahtzee Bonuses: +" + (yahtzeeBonus * 100) + " pts!"
    : "";

  var finalMsg = "Game Over! Final Score: " + totalScore + " points.\n" + bonusEarnedMsg + yBonusMsg;
  yahtzlogger("========================================");
  yahtzlogger(finalMsg);
  yahtzlogger("========================================");

  // Disable roll and score buttons
  if (document.yahtzform) {
    document.yahtzform.rollbutton.disabled = true;
    document.yahtzform.standbutton.disabled = true;
    document.yahtzform.wastebutton.disabled = true;
  }

  var playerName = getPlayerName();
  saveHighScore(playerName, totalScore);

  setTimeout(function () {
    alert(finalMsg);
  }, 100);
}

// Start New Game
function new_game() {
  var confirmNew = window.confirm("Start a new game? Current progress will be lost.");
  if (!confirmNew) return;

  dice = [1, 1, 1, 1, 1];
  held = [false, false, false, false, false];
  rollCount = 0;
  currentTurn = 1;
  totalScore = 0;
  upperScore = 0;
  bonusScore = 0;
  lowerScore = 0;
  yahtzeeBonus = 0;
  firstYahtzeeScored = false;

  for (var i = 1; i <= 13; i++) {
    categoryScores[i] = null;
    if (document.yahtzform && document.yahtzform["yahtzbox" + i]) {
      document.yahtzform["yahtzbox" + i].value = "";
    }
  }

  if (document.yahtzform) {
    document.yahtzform.reset();
    document.yahtzform.yahtzmsg.value = "0";
    document.yahtzform.runbonus.value = "0";
    document.yahtzform.yahtzturn.value = "0";
    document.yahtzform.rollbutton.disabled = false;
    document.yahtzform.standbutton.disabled = false;
    document.yahtzform.wastebutton.disabled = false;
  }

  clearPreviews();
  renderDice();
  updateUI();
  yahtzlogger("🎲 New game started! Roll the dice to begin.");
}

// ========================================================
// UI RENDERING & FEEDBACK
// ========================================================

// Render 3D SVG/CSS Dice
function renderDice(rolledIndexes) {
  var tray = document.getElementById("diceTray");
  if (!tray) return;

  rolledIndexes = rolledIndexes || [];

  for (var i = 0; i < 5; i++) {
    var val = dice[i];
    var isHeld = held[i];
    var dieCard = document.getElementById("dieCard" + i);
    if (!dieCard) continue;

    if (isHeld) {
      dieCard.classList.add("is-held");
    } else {
      dieCard.classList.remove("is-held");
    }

    var dieElem = dieCard.querySelector(".die");
    if (dieElem) {
      if (isHeld) {
        dieElem.classList.add("held");
      } else {
        dieElem.classList.remove("held");
      }

      // Add roll animation if this die was just rolled
      if (rolledIndexes.indexOf(i) !== -1) {
        dieElem.classList.remove("rolling");
        void dieElem.offsetWidth; // trigger reflow
        dieElem.classList.add("rolling");
      }

      dieElem.innerHTML = getPipsHtml(val);
    }
  }
}

// Generate CSS Grid Pips for 1 to 6
function getPipsHtml(num) {
  var html = "";
  switch (num) {
    case 1:
      html = '<div class="pip pip-mc"></div>';
      break;
    case 2:
      html = '<div class="pip pip-tr"></div><div class="pip pip-bl"></div>';
      break;
    case 3:
      html = '<div class="pip pip-tr"></div><div class="pip pip-mc"></div><div class="pip pip-bl"></div>';
      break;
    case 4:
      html = '<div class="pip pip-tl"></div><div class="pip pip-tr"></div>' +
             '<div class="pip pip-bl"></div><div class="pip pip-br"></div>';
      break;
    case 5:
      html = '<div class="pip pip-tl"></div><div class="pip pip-tr"></div>' +
             '<div class="pip pip-mc"></div>' +
             '<div class="pip pip-bl"></div><div class="pip pip-br"></div>';
      break;
    case 6:
      html = '<div class="pip pip-tl"></div><div class="pip pip-tr"></div>' +
             '<div class="pip pip-ml"></div><div class="pip pip-mr"></div>' +
             '<div class="pip pip-bl"></div><div class="pip pip-br"></div>';
      break;
    default:
      html = '<div class="pip pip-mc"></div>';
  }
  return html;
}

// Update ghost score previews on scorecard
function updatePreviews() {
  if (rollCount === 0) {
    clearPreviews();
    return;
  }

  for (var i = 1; i <= 13; i++) {
    var cell = document.getElementById("cell-score-" + i);
    if (!cell) continue;

    if (categoryScores[i] === null) {
      var potential = calculatePotentialScore(i, dice);
      cell.textContent = potential;
      cell.className = "score-box-cell " + (potential > 0 ? "preview-score" : "preview-zero");
    }
  }
}

function clearPreviews() {
  for (var i = 1; i <= 13; i++) {
    var cell = document.getElementById("cell-score-" + i);
    if (!cell) continue;
    if (categoryScores[i] === null) {
      cell.textContent = "-";
      cell.className = "score-box-cell";
    }
  }
}

// Update all scorecard totals, badges, and controls
function updateUI() {
  // Update category rows
  for (var i = 1; i <= 13; i++) {
    var row = document.querySelector('.score-row[data-category="' + i + '"]');
    var cell = document.getElementById("cell-score-" + i);
    if (row && cell) {
      if (categoryScores[i] !== null) {
        row.classList.add("filled");
        if (categoryScores[i] === 0) {
          row.classList.add("zero-score");
        } else {
          row.classList.remove("zero-score");
        }
        cell.textContent = categoryScores[i];
        cell.className = "score-box-cell";
      } else {
        row.classList.remove("filled", "zero-score");
      }
    }
  }

  // Update totals
  setText("upperSubtotal", upperScore);
  setText("upperBonusVal", (upperScore >= 63) ? 35 : 0);
  setText("upperTotal", upperScore + bonusScore);
  setText("lowerTotal", lowerScore);
  setText("grandTotal", totalScore);
  setText("yahtzeeBonusVal", yahtzeeBonus * 100);

  // Bonus progress bar
  var fill = document.getElementById("bonusProgressFill");
  var text = document.getElementById("bonusProgressText");
  if (fill && text) {
    var pct = Math.min(100, Math.round((upperScore / 63) * 100));
    fill.style.width = pct + "%";
    if (upperScore >= 63) {
      fill.classList.add("bonus-won");
      text.textContent = upperScore + " / 63 pts (Bonus Won: +35!)";
    } else {
      fill.classList.remove("bonus-won");
      text.textContent = upperScore + " / 63 pts (" + (63 - upperScore) + " needed)";
    }
  }

  // Roll button label and state
  var rollBtn = document.getElementById("rollBtn");
  var rollStatusText = document.getElementById("rollStatusText");
  if (rollBtn) {
    if (rollCount === 0) {
      rollBtn.innerHTML = "🎲 Roll Dice (Roll 1 of 3)";
      rollBtn.disabled = isGameOver();
    } else if (rollCount < 3) {
      rollBtn.innerHTML = "🎲 Re-roll (" + (3 - rollCount) + " left)";
      rollBtn.disabled = isGameOver();
    } else {
      rollBtn.innerHTML = "🎲 No Rolls Left";
      rollBtn.disabled = true;
    }
  }

  if (rollStatusText) {
    rollStatusText.textContent = "Roll: " + rollCount + " / 3 | Turn: " + Math.min(currentTurn, 13) + " / 13";
  }

  // Update Dropdown options (disable already scored ones)
  var select = document.yahtzform ? document.yahtzform.yahtzmenu : null;
  if (select) {
    for (var k = 1; k <= 13; k++) {
      if (select.options[k]) {
        var isUsed = categoryScores[k] !== null;
        select.options[k].disabled = isUsed;
        var baseName = getCategoryName(k);
        select.options[k].text = isUsed ? baseName + " (Used: " + categoryScores[k] + ")" : baseName;
      }
    }
  }
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function getCategoryName(idx) {
  var names = [
    "invalid", "1's", "2's", "3's", "4's", "5's", "6's",
    "3 of a Kind", "4 of a Kind", "Small Straight", "Large Straight",
    "Full House", "Chance", "Yahtzee"
  ];
  return names[idx] || "";
}

function getSelectedCategoryIndex() {
  if (!document.yahtzform || !document.yahtzform.yahtzmenu) return 0;
  return document.yahtzform.yahtzmenu.selectedIndex;
}

// ========================================================
// LOGGING & HIGH SCORES (Persistent with LocalStorage)
// ========================================================

function yahtzlogger(logentry) {
  var logger = document.getElementById("yahtzlog");
  if (!logger && document.yahtzform) logger = document.yahtzform.yahtzlog;
  if (logger) {
    logger.value += (logger.value ? "\n" : "") + logentry;
    logger.scrollTop = logger.scrollHeight;
  }
}

function getPlayerName() {
  var pInput = document.getElementById("yahtzplayer");
  if (!pInput && document.yahtzform) pInput = document.yahtzform.yahtzplayer;
  var name = pInput ? pInput.value.trim() : "";
  return name || "Player";
}

function saveHighScore(player, score) {
  var records = [];
  try {
    var saved = localStorage.getItem("yahtzee_records");
    if (saved) records = JSON.parse(saved);
  } catch (e) {}

  var now = new Date();
  var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();

  records.push({ player: player, score: score, date: dateStr });
  records.sort(function (a, b) { return b.score - a.score; });
  records = records.slice(0, 10); // Keep top 10

  try {
    localStorage.setItem("yahtzee_records", JSON.stringify(records));
  } catch (e) {}

  renderHighScores(records);
}

function loadHighScores() {
  var records = [];
  try {
    var saved = localStorage.getItem("yahtzee_records");
    if (saved) records = JSON.parse(saved);
  } catch (e) {}

  if (records.length === 0) {
    // Default initial records
    records = [
      { player: "Champion", score: 285, date: "Classic" },
      { player: "Pro Roller", score: 240, date: "Classic" }
    ];
  }
  renderHighScores(records);
}

function renderHighScores(records) {
  var recBox = document.getElementById("yahtzrecords");
  if (!recBox && document.yahtzform) recBox = document.yahtzform.yahtzrecords;
  if (!recBox) return;

  var text = "🏆 TOP SCORES:\n";
  records.forEach(function (r, i) {
    text += (i + 1) + ". " + r.player + " - " + r.score + " pts (" + r.date + ")\n";
  });
  recBox.value = text;
}

// Help Modal
function toggleHelpModal(show) {
  var modal = document.getElementById("helpModal");
  if (modal) {
    if (show) modal.classList.add("active");
    else modal.classList.remove("active");
  }
}

function help_alert() {
  toggleHelpModal(true);
}
