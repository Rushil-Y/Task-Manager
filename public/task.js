document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  let tasks = [];

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form input values
    const taskName = document.getElementById("task-name").value;
    const taskInput = document.getElementById("task-input").value;
    const assignedTo = document.getElementById("assigned-to").value;
    const dueDate = document.getElementById("due-date").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;

    // Creating a new task object
    const newTask = {
      taskname: taskName,
      description: taskInput,
      assignedTo: assignedTo,
      dueDate: dueDate,
      priority: priority,
      status: status,
    };

    // Adding task to the tasks array
    tasks.push(newTask);

    // Send a POST request to create a new task
    fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create task");
        }
        return response.json();
      })
      .then((data) => {
        console.log("New task created:", data);
        renderTasks();
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
    taskForm.reset();
  });

  // Function to render task card
  function renderTaskCard(task) {
    const column = document.getElementById(task.status + "-column");
    const card = document.createElement("div");
    let priorityClass = "";
    switch (task.priority) {
      case "low":
        priorityClass = "priority-low";
        break;
      case "medium":
        priorityClass = "priority-medium";
        break;
      case "high":
        priorityClass = "priority-high";
        break;
      default:
        priorityClass = "";
    }
    card.className = `task-card ${priorityClass}`;
    card.setAttribute("data-task-id", task.id);
    card.innerHTML = `
                    <h3 class="task-title">Task name: ${task.taskname}</h3>
                    <p class="task-description">Description: ${task.description}</p>
                    <p class="task-info">Assigned to: ${task.assignedTo}</p>
                    <p class="task-info">Due date: ${task.dueDate}</p>
                    <p class="task-info">Priority: ${task.priority}</p>
                    <p class="task-info">Status: ${task.status}</p>
                    <button class="edit-button" onclick="editTask('${task.id}')">Edit</button>
                    <button class="delete-button" onclick="deleteTask('${task.id}')">Delete</button>
                `;
    column.appendChild(card);
  }

  function renderTasks() {
    document.getElementById("todo-column").innerHTML = "";
    document.getElementById("inprogress-column").innerHTML = "";
    document.getElementById("completed-column").innerHTML = "";

    // Send a GET request to fetch all tasks
    fetch("/api/tasks")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((tasks) => {
        tasks.forEach((task) => {
          renderTaskCard(task);
        });
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }

  // Initial rendering of tasks
  renderTasks();
});

// Function to edit a task
function editTask(taskId) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (!taskElement) {
    console.error(`Task with ID ${taskId} not found in the UI.`);
    return;
  }

  // Get the task details from the task element
  const taskName = taskElement.querySelector(".task-title").textContent;
  const taskDescription =
    taskElement.querySelector(".task-description").textContent;
  const taskAssignedTo = taskElement.querySelector(
    ".task-info:nth-child(3)"
  ).textContent;
  const taskDueDate = taskElement.querySelector(
    ".task-info:nth-child(4)"
  ).textContent;
  const taskPriority = taskElement.querySelector(
    ".task-info:nth-child(5)"
  ).textContent;
  const taskStatus = taskElement.querySelector(
    ".task-info:nth-child(6)"
  ).textContent;

  // Create an edit form or input fields to allow users to edit task details
  const editForm = document.createElement("form");
  editForm.innerHTML = `
    <label for="edit-task-name">Task Name:</label>
    <input type="text" id="edit-task-name" value="${taskName}"><br>
    <label for="edit-task-description">Description:</label>
    <textarea id="edit-task-description">${taskDescription}</textarea><br>
    <label for="edit-task-assigned-to">Assigned To:</label>
    <input type="text" id="edit-task-assigned-to" value="${taskAssignedTo}"><br>
    <label for="edit-task-due-date">Due Date:</label>
    <input type="date" id="edit-task-due-date" value="${taskDueDate}"><br>
    <label for="edit-task-priority">Priority:</label>
    <select id="edit-task-priority">
      <option value="low" ${
        taskPriority === "low" ? "selected" : ""
      }>Low</option>
      <option value="medium" ${
        taskPriority === "medium" ? "selected" : ""
      }>Medium</option>
      <option value="high" ${
        taskPriority === "high" ? "selected" : ""
      }>High</option>
    </select><br>
    <label for="edit-task-status">Status:</label>
    <select id="edit-task-status">
      <option value="todo" ${
        taskStatus === "todo" ? "selected" : ""
      }>To Do</option>
      <option value="inprogress" ${
        taskStatus === "inprogress" ? "selected" : ""
      }>In Progress</option>
      <option value="completed" ${
        taskStatus === "completed" ? "selected" : ""
      }>Completed</option>
    </select><br>
    <button type="button" onclick="saveEditedTask('${taskId}')">Save</button>
    <button type="button" onclick="cancelEdit('${taskId}')">Cancel</button>
  `;

  // Replace the task element with the edit form
  taskElement.parentNode.replaceChild(editForm, taskElement);
}

// Function to save the edited task
function saveEditedTask(taskId) {
  const editedTaskName = document.getElementById("edit-task-name").value;
  const editedTaskDescription = document.getElementById(
    "edit-task-description"
  ).value;
  const editedTaskAssignedTo = document.getElementById(
    "edit-task-assigned-to"
  ).value;
  const editedTaskDueDate = document.getElementById("edit-task-due-date").value;
  const editedTaskPriority =
    document.getElementById("edit-task-priority").value;
  const editedTaskStatus = document.getElementById("edit-task-status").value;

  const editedTask = {
    taskname: editedTaskName,
    description: editedTaskDescription,
    assignedTo: editedTaskAssignedTo,
    dueDate: editedTaskDueDate,
    priority: editedTaskPriority,
    status: editedTaskStatus,
  };

  // Send a PUT request to update the task on the server
  fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedTask),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      console.log("Task updated:", editedTask);
      renderTasks();
    })
    .catch((error) => {
      console.error("Error updating task:", error);
    });
}

// Function to delete a task
function deleteTask(taskId) {
  fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      removeTaskFromUI(taskId);
    })
    .catch((error) => {
      console.error("Error deleting task:", error);
    });
}

function removeTaskFromUI(taskId) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (taskElement) {
    taskElement.parentNode.removeChild(taskElement);
  } else {
    console.error(`Task with ID ${taskId} not found in the UI.`);
  }
}
