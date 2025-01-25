import React, { useState, useEffect } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');  // For Search Bar

  // Fetch tasks from mock API (using JSONPlaceholder as a mock)
  useEffect(() => {
    // Simulating an API call to fetch tasks
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();
        // We'll just use the first 5 tasks as mock data
        const mockTasks = data.slice(0, 5).map((task) => ({
          id: task.id,
          title: task.title,
          description: 'This is a mock description for the task.',
          status: task.completed ? 'Completed' : 'Pending',
        }));
        setTasks(mockTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // Save tasks to localStorage whenever the tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add a new task
  const addTask = () => {
    if (taskTitle && taskDescription) {
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        description: taskDescription,
        status: 'Pending',
      };
      setTasks([...tasks, newTask]);
      setTaskTitle('');
      setTaskDescription('');
    }
  };

  // Mark task as completed
  const markAsCompleted = (taskId) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, status: 'Completed' } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Edit a task
  const editTask = (taskId, newTitle, newDescription) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, title: newTitle, description: newDescription }
        : task
    ));
  };

  // Filter tasks based on status and search query
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle drag-and-drop reordering
  const handleOnDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return; // If dropped outside the list, do nothing

    const reorderedTasks = Array.from(tasks); // Create a copy of tasks array
    const [removed] = reorderedTasks.splice(source.index, 1); // Remove the dragged task
    reorderedTasks.splice(destination.index, 0, removed); // Insert it at the new position

    setTasks(reorderedTasks); // Update the state with the new order
  };

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search tasks by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add Task Form */}
      <div>
        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Filter Tasks */}
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('Pending')}>Pending</button>
        <button onClick={() => setFilter('Completed')}>Completed</button>
      </div>

      {/* Task List */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ padding: 0 }}
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        margin: '10px 0',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: task.status === 'Completed' ? '#d3ffd3' : '#f0f0f0',
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                      }}
                    >
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <p>Status: {task.status}</p>

                      {/* Mark as completed */}
                      {task.status === 'Pending' && (
                        <button onClick={() => markAsCompleted(task.id)}>Mark as Completed</button>
                      )}

                      {/* Edit Task */}
                      <button onClick={() => {
                        const newTitle = prompt("Edit Task Title", task.title);
                        const newDescription = prompt("Edit Task Description", task.description);
                        if (newTitle && newDescription) {
                          editTask(task.id, newTitle, newDescription);
                        }
                      }}>Edit</button>

                      {/* Delete Task */}
                      <button onClick={() => deleteTask(task.id)}>Delete</button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder} {/* Placeholder to handle space during drag */}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default App;
