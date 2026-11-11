/*
 * 다이어리 달력과 일기 목록
 *
 * - 데이터는 diary-data.js 의 DIARY_ENTRIES / DIARY_HOLIDAYS 에서 읽습니다.
 * - diary-data.js 보다 뒤에 불러와야 합니다.
 * - file:// 로 열어도 동작하도록 fetch 와 ES module 은 쓰지 않았습니다.
 */
(function () {
  "use strict";

  var WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
  var WEEKDAYS_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  var monthLabelEl = document.getElementById("calendar-month");
  var prevButton = document.getElementById("calendar-prev");
  var nextButton = document.getElementById("calendar-next");
  var todayBoxEl = document.getElementById("date-today");
  var dateListEl = document.getElementById("date-list");
  var diaryListEl = document.getElementById("diary-list");
  var scrollBoxEl = document.querySelector(".diary-scrollbox");

  if (!monthLabelEl || !prevButton || !nextButton || !todayBoxEl || !dateListEl || !diaryListEl) {
    return;
  }

  // ---------- 날짜 도우미 ----------
  // "YYYY-MM-DD" 를 직접 쪼갭니다. new Date("2022-01-03") 은 UTC 로 해석돼
  // 지역에 따라 요일이 하루 어긋날 수 있어 쓰지 않습니다.
  function parseDate(text) {
    var parts = text.split("-");
    return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
  }

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function toKey(year, month, day) {
    return year + "-" + pad(month) + "-" + pad(day);
  }

  function weekdayOf(year, month, day) {
    return new Date(year, month - 1, day).getDay();
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function isRealDate(year, month, day) {
    var date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  // ---------- 데이터 준비 ----------
  function loadEntries(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    var valid = raw.filter(function (item) {
      var ok = false;
      if (item && typeof item.date === "string" && DATE_PATTERN.test(item.date) && typeof item.body === "string") {
        var parsed = parseDate(item.date);
        ok = isRealDate(parsed.year, parsed.month, parsed.day);
      }
      if (!ok && window.console) {
        console.warn("diary-data.js: 형식이 맞지 않는 항목을 건너뜁니다.", item);
      }
      return ok;
    });
    // 날짜와 시간 순(오래된 것이 먼저)
    return valid.slice().sort(function (a, b) {
      var keyA = a.date + " " + (a.time || "");
      var keyB = b.date + " " + (b.time || "");
      return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    });
  }

  function groupByDate(list) {
    var groups = {};
    list.forEach(function (entry) {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    return groups;
  }

  var entries = loadEntries(window.DIARY_ENTRIES);
  var holidays = Array.isArray(window.DIARY_HOLIDAYS) ? window.DIARY_HOLIDAYS : [];
  var entriesByDate = groupByDate(entries);

  // ---------- 상태 ----------
  // 처음에는 일기가 있는 가장 최근 달을 보여줍니다(일기가 하나도 없으면 이번 달).
  var state = { year: 0, month: 0, selected: null };
  if (entries.length > 0) {
    var latest = parseDate(entries[entries.length - 1].date);
    state.year = latest.year;
    state.month = latest.month;
  } else {
    var now = new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth() + 1;
  }

  function monthPrefix() {
    return state.year + "-" + pad(state.month);
  }

  function entriesInViewMonth() {
    var prefix = monthPrefix();
    return entries.filter(function (entry) {
      return entry.date.slice(0, 7) === prefix;
    });
  }

  // ---------- 그리기 ----------
  function renderMonthLabel() {
    monthLabelEl.textContent = monthPrefix().replace("-", ".");
  }

  function renderCalendar() {
    dateListEl.textContent = "";
    var total = daysInMonth(state.year, state.month);
    for (var day = 1; day <= total; day++) {
      var key = toKey(state.year, state.month, day);
      var weekday = weekdayOf(state.year, state.month, day);
      var hasDiary = Boolean(entriesByDate[key]);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "date";
      button.textContent = String(day);
      button.setAttribute("data-date", key);

      // 일요일과 공휴일은 빨강(토요일 파랑보다 우선)
      if (weekday === 0 || holidays.indexOf(key) !== -1) {
        button.classList.add("date-red");
      } else if (weekday === 6) {
        button.classList.add("date-blue");
      }
      if (hasDiary) {
        button.classList.add("has-diary");
      }
      var isSelected = state.selected === key;
      if (isSelected) {
        button.classList.add("selected");
      }
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      button.setAttribute("aria-label", state.month + "월 " + day + "일" + (hasDiary ? ", 일기 있음" : ""));

      dateListEl.appendChild(button);
    }
  }

  // 왼쪽 날짜 박스: 선택한 날짜 → 그 달의 가장 늦은 일기 날짜 → 1일 순
  function renderTodayBox() {
    var key = state.selected;
    if (!key) {
      var inMonth = entriesInViewMonth();
      key = inMonth.length > 0 ? inMonth[inMonth.length - 1].date : toKey(state.year, state.month, 1);
    }
    var parsed = parseDate(key);
    todayBoxEl.textContent = "";
    todayBoxEl.appendChild(document.createTextNode(pad(parsed.month) + "." + pad(parsed.day)));
    todayBoxEl.appendChild(document.createElement("br"));
    todayBoxEl.appendChild(
      document.createTextNode(WEEKDAYS_EN[weekdayOf(parsed.year, parsed.month, parsed.day)])
    );
  }

  function createDiaryElement(entry) {
    var parsed = parseDate(entry.date);
    var weekday = WEEKDAYS_KO[weekdayOf(parsed.year, parsed.month, parsed.day)];

    var wrapper = document.createElement("div");
    wrapper.className = "diary";

    var dateEl = document.createElement("div");
    dateEl.className = "diary-date";
    dateEl.textContent =
      parsed.year + "." + pad(parsed.month) + "." + pad(parsed.day) + ". " + weekday +
      (entry.time ? " " + entry.time : "");

    var contentsEl = document.createElement("div");
    contentsEl.className = "diary-contents";
    var paragraph = document.createElement("p");
    // 본문은 textContent 로만 넣습니다(HTML 로 해석되지 않음). 줄바꿈은 CSS 가 처리합니다.
    paragraph.textContent = entry.body;
    contentsEl.appendChild(paragraph);

    wrapper.appendChild(dateEl);
    wrapper.appendChild(contentsEl);
    return wrapper;
  }

  function renderList() {
    var items = state.selected ? entriesByDate[state.selected] || [] : entriesInViewMonth();
    diaryListEl.textContent = "";

    if (items.length === 0) {
      var empty = document.createElement("div");
      empty.className = "diary-empty font-kyobohand";
      empty.textContent = state.selected ? "이 날은 일기가 없습니다." : "이 달에는 일기가 없습니다.";
      diaryListEl.appendChild(empty);
      return;
    }
    items.forEach(function (entry) {
      diaryListEl.appendChild(createDiaryElement(entry));
    });
  }

  function render(scrollToTop) {
    renderMonthLabel();
    renderCalendar();
    renderTodayBox();
    renderList();
    if (scrollToTop && scrollBoxEl) {
      scrollBoxEl.scrollTop = 0;
    }
  }

  // ---------- 이벤트 ----------
  function moveMonth(delta) {
    var index = state.year * 12 + (state.month - 1) + delta;
    state.year = Math.floor(index / 12);
    state.month = (index % 12) + 1;
    state.selected = null;
    render(true);
  }

  prevButton.addEventListener("click", function () {
    moveMonth(-1);
  });

  nextButton.addEventListener("click", function () {
    moveMonth(1);
  });

  // 날짜를 누르면 그날 일기만 보이고, 같은 날짜를 다시 누르면 해제됩니다.
  dateListEl.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("button.date") : null;
    if (!button || !dateListEl.contains(button)) {
      return;
    }
    var key = button.getAttribute("data-date");
    state.selected = state.selected === key ? null : key;
    render(true);
    // 다시 그리면서 사라진 버튼 대신, 같은 날짜 버튼에 포커스를 돌려줍니다(키보드 사용자용).
    var again = dateListEl.querySelector('[data-date="' + key + '"]');
    if (again) {
      again.focus();
    }
  });

  render(false);
})();
