const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html'; // Redirect to login if no token
}

let exercises = [];
let weeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

let selectedDay = 'Monday';
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// --- API Calls ---

async function fetchWithAuth(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return null;
    }
    return response;
}

async function loadData() {
    // Load Exercises
    const exRes = await fetchWithAuth('/exercises');
    if (exRes && exRes.ok) {
        exercises = await exRes.json();
    }

    // Load Schedule
    const schRes = await fetchWithAuth('/schedule');
    if (schRes && schRes.ok) {
        const scheduleData = await schRes.json();
        // Reset schedule
        Object.keys(weeklySchedule).forEach(day => weeklySchedule[day] = []);
        // Populate schedule
        scheduleData.forEach(item => {
            if (weeklySchedule[item.dayOfWeek]) {
                weeklySchedule[item.dayOfWeek].push(item.exercise);
            }
        });
    }

    renderAll();
}

async function addExerciseAPI(exerciseData) {
    const res = await fetchWithAuth('/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData)
    });
    if (res && res.ok) {
        await loadData();
    } else {
        alert('Failed to add exercise');
    }
}

async function deleteExerciseAPI(id) {
    const res = await fetchWithAuth(`/exercises/${id}`, {
        method: 'DELETE'
    });
    if (res && res.ok) {
        await loadData();
    }
}

async function addToScheduleAPI(dayOfWeek, exerciseId) {
    const res = await fetchWithAuth('/schedule', {
        method: 'POST',
        body: JSON.stringify({ dayOfWeek, exerciseId })
    });
    if (res && res.ok) {
        await loadData();
    } else {
        alert('Could not add to schedule (maybe duplicate?)');
    }
}

async function removeFromScheduleAPI(dayOfWeek, exerciseId) {
    const res = await fetchWithAuth('/schedule', {
        method: 'DELETE',
        body: JSON.stringify({ dayOfWeek, exerciseId })
    });
    if (res && res.ok) {
        await loadData();
    }
}

// --- UI Logic ---

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Find button that calls this function with tabName (approximate) or just use event target if bound
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabName)) btn.classList.add('active');
    });

    document.getElementById(tabName + '-tab').classList.add('active');
    
    if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Make switchTab global
window.switchTab = switchTab;

function selectDay(day) {
    selectedDay = day;
    document.getElementById('selected-day-label').textContent = day;
    renderScheduleGrid();
    renderAddExerciseList();
}

function renderScheduleGrid() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    daysOfWeek.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card' + (day === selectedDay ? ' selected' : '');
        dayCard.onclick = () => selectDay(day);
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = day;
        dayCard.appendChild(dayName);
        
        const dayExercises = weeklySchedule[day];
        
        if (dayExercises.length === 0) {
            const restDay = document.createElement('div');
            restDay.className = 'rest-day';
            restDay.textContent = 'Rest day';
            dayCard.appendChild(restDay);
        } else {
            dayExercises.forEach(exercise => {
                const item = document.createElement('div');
                item.className = 'exercise-item';
                item.innerHTML = `
                    <span>${exercise.name}</span>
                    <button class="btn btn-danger" onclick="event.stopPropagation(); removeFromScheduleAPI('${day}', ${exercise.id})">
                        🗑️
                    </button>
                `;
                dayCard.appendChild(item);
            });
        }
        
        grid.appendChild(dayCard);
    });
}

function renderAddExerciseList() {
    const list = document.getElementById('add-exercise-list');
    if (!list) return;
    list.innerHTML = '';
    
    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        // Check if already added to selected day
        const isAdded = weeklySchedule[selectedDay].some(ex => ex.id === exercise.id);
        
        card.innerHTML = `
            <div class="exercise-header">
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                </div>
                <button class="btn btn-add" onclick="addToScheduleAPI('${selectedDay}', ${exercise.id})" ${isAdded ? 'disabled' : ''}>
                    ➕
                </button>
            </div>
            <div class="exercise-details">
                <div>${exercise.sets} sets × ${exercise.reps} reps</div>
                <div>⏱️ ${exercise.duration} min</div>
            </div>
        `;
        
        list.appendChild(card);
    });
}

function renderExerciseLibrary() {
    const library = document.getElementById('exercise-library');
    if (!library) return;
    library.innerHTML = '';
    
    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        card.innerHTML = `
            <div class="exercise-header">
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                </div>
                <button class="btn btn-danger" onclick="deleteExerciseAPI(${exercise.id})">
                    🗑️
                </button>
            </div>
            <div class="exercise-details">
                <div><strong>Sets:</strong> ${exercise.sets}</div>
                <div><strong>Reps:</strong> ${exercise.reps}</div>
                <div><strong>Duration:</strong> ${exercise.duration} min</div>
            </div>
        `;
        
        library.appendChild(card);
    });
}

function updateAnalytics() {
    const totalWorkouts = Object.values(weeklySchedule).reduce((sum, day) => sum + day.length, 0);
    document.getElementById('total-workouts').textContent = totalWorkouts;
    
    const activeDays = Object.values(weeklySchedule).filter(day => day.length > 0).length;
    document.getElementById('active-days').textContent = activeDays;
    
    let totalDuration = 0;
    Object.values(weeklySchedule).forEach(day => {
        day.forEach(ex => totalDuration += ex.duration);
    });
    document.getElementById('weekly-duration').textContent = totalDuration;
    
    document.getElementById('total-exercises').textContent = exercises.length;
}

function renderAll() {
    renderScheduleGrid();
    renderAddExerciseList();
    renderExerciseLibrary();
    updateAnalytics();
}

// Expose functions to window for onclick handlers
window.addExercise = () => {
    const name = document.getElementById('exercise-name').value.trim();
    const sets = parseInt(document.getElementById('exercise-sets').value);
    const reps = parseInt(document.getElementById('exercise-reps').value);
    const duration = parseInt(document.getElementById('exercise-duration').value);

    if (name) {
        addExerciseAPI({ name, sets, reps, duration });
        // Clear inputs
        document.getElementById('exercise-name').value = '';
    }
};

window.removeFromScheduleAPI = removeFromScheduleAPI;
window.addToScheduleAPI = addToScheduleAPI;
window.deleteExerciseAPI = deleteExerciseAPI;

// Initialize
document.addEventListener('DOMContentLoaded', loadData);