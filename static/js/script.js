document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let tasks = JSON.parse(localStorage.getItem('glassTasks')) || [];
    let currentFilter = 'all'; // all, active, completed
    let selectedTags = new Set();
    let searchQuery = '';

    // --- DOM ELEMENTS ---
    const taskListEl = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const inputCard = document.getElementById('input-card');
    const inputTrigger = document.getElementById('input-trigger');
    const closeInputBtn = document.getElementById('close-input');
    const dateEl = document.getElementById('current-date');
    const themeBtn = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const statusFilters = document.getElementById('status-filters');
    const tagCloudEl = document.getElementById('tag-cloud');
    const statsEl = document.getElementById('task-stats');
    const clearBtn = document.getElementById('clear-completed');

    // --- INITIAL SETUP ---
    // Date
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Theme Check
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    // --- RENDER FUNCTIONS ---
    function save() {
        localStorage.setItem('glassTasks', JSON.stringify(tasks));
        updateTagCloud();
        render();
    }

    function updateTagCloud() {
        // Collect all unique tags
        const allTags = new Set();
        tasks.forEach(t => t.tags.forEach(tag => allTags.add(tag)));
        
        let html = '';
        allTags.forEach(tag => {
            const isActive = selectedTags.has(tag) ? 'active' : '';
            html += `<span class="chip ${isActive}" data-tag="${tag}">#${tag}</span>`;
        });
        tagCloudEl.innerHTML = html;
    }

    function render() {
        // Filter Logic
        const filtered = tasks.filter(task => {
            const matchesStatus = 
                currentFilter === 'all' ? true :
                currentFilter === 'active' ? !task.done :
                task.done;
            
            const matchesSearch = 
                task.title.toLowerCase().includes(searchQuery) || 
                task.desc.toLowerCase().includes(searchQuery);

            const matchesTags = selectedTags.size === 0 || 
                task.tags.some(tag => selectedTags.has(tag));

            return matchesStatus && matchesSearch && matchesTags;
        });

        // Stats
        const activeCount = tasks.filter(t => !t.done).length;
        statsEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;

        // Render List
        taskListEl.innerHTML = '';
        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-card glass-panel ${task.done ? 'completed' : ''}`;
            li.draggable = true;
            li.dataset.id = task.id;
            
            // Priority Dot Color
            const pClass = `p-${task.priority}`;

            // Tags HTML
            const tagsHtml = task.tags.map(t => `<span class="meta-tag">#${t}</span>`).join('');

            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <div class="custom-checkbox" role="checkbox" aria-checked="${task.done}">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.desc ? `<div class="task-desc">${escapeHtml(task.desc)}</div>` : ''}
                    <div class="task-meta">
                        <span class="priority-dot ${pClass}"></span>
                        ${tagsHtml}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    <i class="fa-solid fa-grip-lines action-btn" style="cursor: grab"></i>
                </div>
            `;
            taskListEl.appendChild(li);
        });
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // --- INTERACTIONS ---

    // 1. Input Expansion
    inputTrigger.addEventListener('click', () => {
        inputCard.classList.add('expanded');
        document.getElementById('task-title').focus();
    });
    closeInputBtn.addEventListener('click', () => {
        inputCard.classList.remove('expanded');
    });

    // 2. Add Task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        const rawTags = document.getElementById('task-tags').value;
        const priority = document.getElementById('task-priority').value;

        const tags = rawTags.split(',').map(t => t.trim()).filter(t => t !== '');

        const newTask = {
            id: Date.now(),
            title,
            desc,
            tags,
            priority,
            done: false,
            createdAt: new Date()
        };

        tasks.unshift(newTask); // Add to top
        
        // Reset form
        taskForm.reset();
        inputCard.classList.remove('expanded');
        
        // Save and Render (with animation hack)
        save();
        
        // Apply Enter Animation to first item
        const firstItem = taskListEl.firstElementChild;
        if(firstItem) firstItem.classList.add('task-enter');
    });

    // 3. Task Actions (Delegation)
    taskListEl.addEventListener('click', (e) => {
        const card = e.target.closest('.task-card');
        if (!card) return;
        const id = parseInt(card.dataset.id);
        
        // Delete
        if (e.target.closest('.delete')) {
            card.classList.add('task-exit');
            card.addEventListener('animationend', () => {
                tasks = tasks.filter(t => t.id !== id);
                save();
            });
            return;
        }

        // Toggle Complete
        if (e.target.closest('.checkbox-wrapper') || e.target.closest('.task-content')) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.done = !task.done;
                save();
            }
        }
    });

    // 4. Filters
    statusFilters.addEventListener('click', (e) => {
        if(e.target.classList.contains('chip')) {
            document.querySelectorAll('#status-filters .chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            render();
        }
    });

    // 5. Tag Filter
    tagCloudEl.addEventListener('click', (e) => {
        if(e.target.classList.contains('chip')) {
            const tag = e.target.dataset.tag;
            if(selectedTags.has(tag)) {
                selectedTags.delete(tag);
                e.target.classList.remove('active');
            } else {
                selectedTags.add(tag);
                e.target.classList.add('active');
            }
            render();
        }
    });

    // 6. Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        render();
    });

    // 7. Clear Completed
    clearBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.done);
        save();
    });

    // 8. Theme Toggle
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        const isLight = document.body.classList.contains('light-mode');
        themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // --- DRAG AND DROP LOGIC ---
    let draggedItem = null;

    taskListEl.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.style.opacity = '0.5', 0);
    });

    taskListEl.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
        draggedItem = null;
        // Remove visual classes
        document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
        
        // Re-sync array based on DOM order
        const newOrderIds = Array.from(taskListEl.children).map(el => parseInt(el.dataset.id));
        // Sort tasks array based on new IDs order
        tasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
        save();
    });

    taskListEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskListEl, e.clientY);
        const currentOver = e.target.closest('.task-card');
        
        if(currentOver && currentOver !== draggedItem) {
           // visual feedback could go here
        }

        if (afterElement == null) {
            taskListEl.appendChild(draggedItem);
        } else {
            taskListEl.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Initial Render
    updateTagCloud();
    render();
});
