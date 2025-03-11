const express = require("express");
const fs = require("fs").promises;
const app = express();

app.use(express.json());

app.use(express.static("public"));

const tasksFilePath = "./tasks.json";

// To read all the tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read tasks from the server." });
  }
});

// To read a single task
app.get("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read tasks from the server." });
  }
});

// To create a new task
app.post("/api/tasks", async (req, res) => {
  const newTask = req.body;
  try {
    let data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);
    newTask.id = tasks.length + 1; // Generating a ID for each task
    tasks.push(newTask);
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save task to the server." });
  }
});

// To update a task
app.put("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body;
  try {
    let data = await fs.readFile(tasksFilePath, "utf8");
    let tasks = JSON.parse(data);
    const index = tasks.findIndex((task) => String(task.id) === String(taskId));
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
      console.log("Task updated successfully:", taskId);
      res.json(tasks[index]);
    } else {
      console.log("Task not found:", taskId);
      res.status(404).json({ error: "Task not found." });
    }
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// To delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  console.log("Received DELETE request for task ID:", taskId);
  try {
    let data = await fs.readFile(tasksFilePath, "utf8");
    let tasks = JSON.parse(data);
    const index = tasks.findIndex((task) => String(task.id) === String(taskId));
    if (index !== -1) {
      tasks.splice(index, 1);
      await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
      console.log("Task deleted successfully:", taskId);
      res.status(204).end();
    } else {
      console.log("Task not found:", taskId);
      res.status(404).json({ error: "Task not found." });
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Start the server
app.listen(4000, () => {
  console.log(`Application link : http://localhost:4000/`);
});
