// ===== STATE =====
let users = [];
let currentMonth = new Date();
let currentPhotoIndex = 0;
let autoplayInterval = null;
const totalPhotos = 15;
const AUTOPLAY_DELAY = 3000; // 3 segundos
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Get today's date in local timezone (YYYY-MM-DD format)
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkLoginState();
});

function setupEventListeners() {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  });

  // Carousel listeners
  document.getElementById('prev-photo')?.addEventListener('click', () => prevPhoto());
  document.getElementById('next-photo')?.addEventListener('click', () => nextPhoto());

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('app-container').classList.contains('active')) {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    }
  });
}

function checkLoginState() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    loadAppData();
  }
}

// ===== LOGIN FLOW =====
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('login-error');

  errorMsg.classList.remove('show');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('currentUser', JSON.stringify({ username }));
      loadAppData();
    } else {
      showError('Credenciais inválidas. Verifique código e senha.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Erro ao conectar. Tente novamente.');
  }
}

function handleLogout() {
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('currentUser');
    document.getElementById('login-container').classList.add('login-active');
    document.getElementById('app-container').classList.remove('active');
    document.getElementById('login-form').reset();
  }
}

function showError(message) {
  const errorMsg = document.getElementById('login-error');
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
}

// ===== APP DATA =====
async function loadAppData() {
  try {
    const response = await fetch('/api/casal-info');
    users = await response.json();

    if (users.length >= 2) {
      showApp();
      updateUserInfo();
      setupPrayerButtons();
      await updatePrayerStatus();
      await renderCalendar();
    }
  } catch (error) {
    console.error('Error loading app data:', error);
    showError('Erro ao carregar dados. Tente novamente.');
  }
}

function showApp() {
  document.getElementById('login-container').classList.remove('login-active');
  document.getElementById('app-container').classList.add('active');
  initCarousel();
}

function updateUserInfo() {
  document.getElementById('person1-name').textContent = users[0]?.name || 'Pessoa 1';
  document.getElementById('person2-name').textContent = users[1]?.name || 'Pessoa 2';
}

// ===== PRAYER BUTTONS =====
function setupPrayerButtons() {
  if (!users || users.length < 2) {
    console.error('Users not loaded yet');
    return;
  }

  ['person1', 'person2'].forEach((personId, index) => {
    const btn = document.getElementById(`${personId}-btn`);
    if (btn) {
      // Remove old listeners and add new one
      btn.onclick = null;
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await markPrayer(users[index].id, personId);
        btn.disabled = false;
      });
    }
  });
}

async function markPrayer(userId, personId) {
  try {
    const today = getTodayDate();
    const response = await fetch('/api/prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, date: today })
    });

    if (response.ok) {
      await updatePrayerStatus();
      await renderCalendar();
    } else {
      console.error('Error:', response.statusText);
    }
  } catch (error) {
    console.error('Error marking prayer:', error);
  }
}

async function updatePrayerStatus() {
  if (!users || users.length === 0) return;

  for (let i = 0; i < users.length; i++) {
    const personId = `person${i + 1}`;
    const userId = users[i].id;

    try {
      // Fetch if prayed today
      const prayedResponse = await fetch(`/api/prayed-today/${userId}`);
      if (!prayedResponse.ok) throw new Error('Failed to fetch prayed status');
      const prayedData = await prayedResponse.json();

      // Fetch prayer count
      const countResponse = await fetch(`/api/prayer-count/${userId}`);
      if (!countResponse.ok) throw new Error('Failed to fetch prayer count');
      const countData = await countResponse.json();

      // Update UI
      const card = document.getElementById(`${personId}-card`);
      const btn = document.getElementById(`${personId}-btn`);
      const countElement = document.getElementById(`${personId}-count`);

      if (card && btn && countElement) {
        if (prayedData.prayed) {
          card.classList.add('prayed');
          btn.disabled = true;
        } else {
          card.classList.remove('prayed');
          btn.disabled = false;
        }
        countElement.textContent = countData.count || 0;
      }
    } catch (error) {
      console.error(`Error updating ${personId} prayer status:`, error);
    }
  }
}

// ===== CALENDAR =====
async function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Update headers
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
  document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;

  // Fetch prayers for the month
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  let person1Prayers = [];
  let person2Prayers = [];

  try {
    const res1 = await fetch(`/api/prayers/${users[0].id}/${monthStr}`);
    const res2 = await fetch(`/api/prayers/${users[1].id}/${monthStr}`);
    person1Prayers = await res1.json();
    person2Prayers = await res2.json();
  } catch (error) {
    console.error('Error fetching prayers:', error);
  }

  // Generate days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.appendChild(createDayElement(day, 'other-month'));
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let className = '';

    const p1Prayed = person1Prayers.includes(dateStr);
    const p2Prayed = person2Prayers.includes(dateStr);

    if (p1Prayed && p2Prayed) {
      className = 'prayed-both';
    }

    calendarDays.appendChild(createDayElement(day, className));
  }

  // Next month days
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.appendChild(createDayElement(day, 'other-month'));
  }
}

function createDayElement(day, className) {
  const div = document.createElement('div');
  div.className = `day ${className}`;
  div.textContent = day;
  return div;
}

// ===== CAROUSEL =====
function initCarousel() {
  generateCarouselDots();
  showPhoto(0);
  startAutoplay();
}

function generateCarouselDots() {
  const dotsContainer = document.getElementById('carousel-dots');
  dotsContainer.innerHTML = '';

  for (let i = 0; i < totalPhotos; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      showPhoto(i);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);
  }
}

function showPhoto(index) {
  currentPhotoIndex = index;
  const img = document.getElementById('carousel-img');
  const slide = document.getElementById('carousel-slide');
  const photoNum = index + 1;

  img.src = `/images/${photoNum}.jpeg`;

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // Fade animation
  slide.classList.remove('fade-in');
  setTimeout(() => slide.classList.add('fade-in'), 10);
}

function nextPhoto() {
  const nextIndex = (currentPhotoIndex + 1) % totalPhotos;
  showPhoto(nextIndex);
  restartAutoplay();
}

function prevPhoto() {
  const prevIndex = (currentPhotoIndex - 1 + totalPhotos) % totalPhotos;
  showPhoto(prevIndex);
  restartAutoplay();
}

function startAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
  autoplayInterval = setInterval(() => {
    nextPhoto();
  }, AUTOPLAY_DELAY);
}

function restartAutoplay() {
  startAutoplay();
}

function stopAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
}
