
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks") || "[]");
let currentFilter = "all";

// Display current date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (!taskName) {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now() + Math.random(),
        name: taskName,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    taskInput.value = "";
    renderTasks();
});

// Complete or delete tasks
taskList.addEventListener("click", function(event) {
    const taskItem = event.target.closest(".task-item");

    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);

    if (event.target.classList.contains("delete-btn")) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
});

taskList.addEventListener("change", function(event) {
    if (!event.target.matches(".task-checkbox")) return;

    const taskItem = event.target.closest(".task-item");
    const taskId = Number(taskItem.dataset.id);

    const task = tasks.find(item => item.id === taskId);

    if (task) {
        task.completed = event.target.checked;
        saveTasks();
        renderTasks();
    }
});

// Filter tasks
document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        document.querySelectorAll(".filter").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
        renderTasks();
    });
});

// Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";
        item.dataset.id = task.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        const name = document.createElement("span");
        name.className = "task-name";
        name.textContent = task.name;

        if (task.completed) {
            name.classList.add("completed");
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        item.append(checkbox, name, deleteButton);
        taskList.appendChild(item);
    });

    // Update statistics
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    // Update progress
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressText.textContent = percentage + "%";
    progressFill.style.width = percentage + "%";

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (filteredTasks.length === 0) {
        emptyMessage.textContent = "No tasks in this category.";
    }
}

// Initial display
renderTasks();
