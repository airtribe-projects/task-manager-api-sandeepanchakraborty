const express = require("express");

const app = express();
app.use(express.json());

// In-memory data storage
let tasks = [];
let taskIdCounter = 1;

// Helper function to validate tasks
const validateTask = (task) => {
  const errors = [];

  // Validate title
  if (!task.title || typeof task.title !== "string" || task.title.trim().length < 3) {
    errors.push("Title is required and must be at least 3 characters long.");
  }

  // Validate status
  const validStatuses = ["pending", "in progress", "completed"];
  if (task.status && !validStatuses.includes(task.status)) {
    errors.push("Status must be one of: pending, in progress, completed.");
  }

  // Validate dueDate (if provided)
  if (task.dueDate && isNaN(Date.parse(task.dueDate))) {
    errors.push("Due date must be a valid date.");
  }

  return errors;
};

// Create a new task
app.post("/tasks", (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const task = {
    id: taskIdCounter++,
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "pending",
    dueDate: req.body.dueDate || null,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// Get all tasks (with optional filtering)
app.get("/tasks", (req, res) => {
  const { status, dueDate } = req.query;
  let filteredTasks = tasks;

  if (status) {
    filteredTasks = filteredTasks.filter((task) => task.status === status);
  }

  if (dueDate) {
    filteredTasks = filteredTasks.filter((task) => task.dueDate === dueDate);
  }

  res.json(filteredTasks);
});

// Get a specific task by ID
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// Update a task (full update)
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const errors = validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: req.body.title,
    description: req.body.description || tasks[taskIndex].description,
    status: req.body.status || tasks[taskIndex].status,
    dueDate: req.body.dueDate || tasks[taskIndex].dueDate,
  };
  res.json(tasks[taskIndex]);
});

// Update a task (partial update)
app.patch("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const updatedTask = { ...tasks[taskIndex], ...req.body };
  const errors = validateTask(updatedTask);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  tasks[taskIndex] = updatedTask;
  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});