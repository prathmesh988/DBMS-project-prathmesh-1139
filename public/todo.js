document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const usernameDisplay = document.getElementById('username-display');
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');

    if (username) {
        usernameDisplay.textContent = username;
    } else {
        // Redirect to login if no username is present
        window.location.href = '/login';
    }

    // Fetch existing todos
    fetchTodos();

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    function fetchTodos() {
        if (!username) return;
        
        fetch(`/api/todos?username=${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(todos => {
                todoList.innerHTML = '';
                todos.forEach(todo => renderTodo(todo));
            })
            .catch(err => console.error('Error fetching todos:', err));
    }

    function addTodo() {
        const task = todoInput.value.trim();
        if (!task || !username) return;

        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, task })
        })
        .then(res => res.json())
        .then(newTodo => {
            renderTodo(newTodo);
            todoInput.value = '';
        })
        .catch(err => console.error('Error adding todo:', err));
    }

    function renderTodo(todo) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${escapeHtml(todo.task)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id}, this)">&times;</button>
        `;
        todoList.appendChild(li);
    }

    // Expose delete function to global scope due to inline onclick
    window.deleteTodo = function(id, btnElement) {
        fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                const li = btnElement.parentElement;
                li.style.opacity = '0';
                setTimeout(() => li.remove(), 300);
            }
        })
        .catch(err => console.error('Error deleting todo:', err));
    };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
