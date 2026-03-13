import React, { useState } from 'react';
import { useForm } from './useForm'; 

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);

  const { values, handleChange, resetForm } = useForm({
    title: '',
    priority: 'Low',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: values.title,
      priority: values.priority,
    };

    setTasks([...tasks, newTask]);
    resetForm();
  };

  return (
    <div>
      <h2>EcoTrack Task Tracker</h2>
      
      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="Enter task name"
          required
        />

        <select
          name="priority"
          value={values.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      <hr />

      <div>
        <h3>Task List</h3>
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong> | Priority: {task.priority}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}