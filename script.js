// ===============================
// 1. ESTADO
// ===============================
let tasks = []
let currentFilter = "all"

let currentDate = new Date()
let selectedDate = new Date()

// ===============================
// 2. ELEMENTOS
// ===============================
const input = document.getElementById("taskInput")
const btn = document.getElementById("addTaskBtn")
const list = document.getElementById("taskList")
const prioritySelect = document.getElementById("priority")

const landing = document.querySelector(".landing")
const app = document.getElementById("app")

// ===============================
// 3. EVENTOS
// ===============================
btn.addEventListener("click", addTask)

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask()
})

// ===============================
// 4. CONTROLE DE TELAS
// ===============================
function showLanding() {
  if (landing) landing.style.display = "block"
  if (app) app.style.display = "none"
}

function showApp() {
  if (landing) landing.style.display = "none"
  if (app) app.style.display = "flex"
}

// ===============================
// 5. TASKS
// ===============================
function addTask() {
  const value = input.value.trim()
  if (!value) return

  tasks.push({
    id: Date.now(),
    title: value,
    done: false,
    date: selectedDate.toISOString(),
    priority: prioritySelect.value
  })

  saveTasks()
  input.value = ""

  renderTasks()
  renderCalendar()
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id)
  if (!task) return

  task.done = !task.done
  saveTasks()
  renderTasks()
  renderCalendar()
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id)
  saveTasks()
  renderTasks()
  renderCalendar()
}

// ===============================
// 6. FILTRO
// ===============================
function setFilter(filter) {
  currentFilter = filter
  renderTasks()
}

// ===============================
// 7. MÉTRICAS
// ===============================
function updateMetrics() {
  const totalEl = document.getElementById("total")
  const doneEl = document.getElementById("done")

  if (!totalEl || !doneEl) return

  totalEl.innerText = tasks.length
  doneEl.innerText = tasks.filter(t => t.done).length
}

// ===============================
// 8. PRIORIDADE
// ===============================
function getPriorityLabel(priority) {
  if (priority === "high") return "Alta"
  if (priority === "medium") return "Média"
  return "Baixa"
}

// ===============================
// 9. FILTRAR POR DATA
// ===============================
function getTasksByDate(date) {
  return tasks.filter(task => {
    const d = new Date(task.date)
    return d.toDateString() === date.toDateString()
  })
}

// ===============================
// 10. RENDER TASKS
// ===============================
function renderTasks() {
  list.innerHTML = ""

  let filtered = tasks

  if (currentFilter === "done") {
    filtered = tasks.filter(t => t.done)
  } else if (currentFilter === "pending") {
    filtered = tasks.filter(t => !t.done)
  }

  filtered = filtered.filter(task => {
    const d = new Date(task.date)
    return d.toDateString() === selectedDate.toDateString()
  })

  if (filtered.length === 0) {
    list.innerHTML = `<p>🚀 Nenhuma tarefa nesse dia</p>`
    updateMetrics()
    return
  }

  filtered.forEach(task => {
    const div = document.createElement("div")
    div.className = "task"
    div.setAttribute("draggable", true)
    div.dataset.id = task.id

    if (task.done) div.classList.add("done")

    div.innerHTML = `
      <span>
        ${task.title}
        <small class="priority ${task.priority}">
          ${getPriorityLabel(task.priority)}
        </small>
      </span>

      <div class="task-actions">
        <button class="done-btn" onclick="toggleTask(${task.id})">✔</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `

    list.appendChild(div)
  })

  updateMetrics()
}

// ===============================
// 11. DRAG AND DROP
// ===============================
document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("task")) {
    e.target.classList.add("dragging")
  }
})

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("task")) {
    e.target.classList.remove("dragging")
  }
})

document.addEventListener("dragover", (e) => {
  e.preventDefault()

  const afterElement = getDragAfterElement(list, e.clientY)
  const dragging = document.querySelector(".dragging")

  if (!dragging) return

  if (!afterElement) {
    list.appendChild(dragging)
  } else {
    list.insertBefore(dragging, afterElement)
  }
})

document.addEventListener("drop", () => {
  const newOrder = []

  document.querySelectorAll(".task").forEach(el => {
    const id = Number(el.dataset.id)
    const task = tasks.find(t => t.id === id)
    if (task) newOrder.push(task)
  })

  tasks = newOrder
  saveTasks()
})

// ===============================
// AUX DRAG
// ===============================
function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".task:not(.dragging)")]

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

// ===============================
// 12. CALENDÁRIO
// ===============================
function renderCalendar() {
  const container = document.getElementById("calendarDays")
  const title = document.getElementById("monthYear")

  container.innerHTML = ""

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()

  title.innerText = `${month + 1}/${year}`

  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement("div"))
  }

  for (let day = 1; day <= lastDate; day++) {
    const div = document.createElement("div")
    div.className = "calendar-day"

    const date = new Date(year, month, day)
    const tasksOfDay = getTasksByDate(date)

    div.innerHTML = `
      <span>${day}</span>
      ${tasksOfDay.length ? `<div class="dot"></div>` : ""}
    `

    div.onclick = () => {
      selectedDate = date
      renderTasks()
      renderCalendar()
    }

    container.appendChild(div)
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1)
  renderCalendar()
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1)
  renderCalendar()
}

// ===============================
// 13. LOGIN / LANDING
// ===============================
function login() {
  localStorage.setItem("user", "Usuário")
  checkLogin()
}

function logout() {
  localStorage.removeItem("user")
  checkLogin()
}

function checkLogin() {
  const user = localStorage.getItem("user")

  if (user) {
    showApp()
  } else {
    showLanding()
  }
}

// ===============================
// 14. STORAGE
// ===============================
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

function loadTasks() {
  const data = localStorage.getItem("tasks")
  if (data) tasks = JSON.parse(data)
}

// ===============================
// 15. TEMA
// ===============================
function toggleTheme() {
  document.body.classList.toggle("dark")

  const isDark = document.body.classList.contains("dark")
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

function loadTheme() {
  const theme = localStorage.getItem("theme")
  if (theme === "dark") {
    document.body.classList.add("dark")
  }
}

// ===============================
// 16. RELÓGIO
// ===============================
function updateClock() {
  const now = new Date()

  const clock = document.getElementById("clock")
  const date = document.getElementById("date")

  if (!clock || !date) return

  clock.innerText = now.toLocaleTimeString()
  date.innerText = now.toLocaleDateString()
}

// ===============================
// 17. INIT
// ===============================
loadTasks()
loadTheme()
checkLogin()
renderCalendar()
renderTasks()

updateClock()
setInterval(updateClock, 1000)