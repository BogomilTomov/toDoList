function Controller() {
    const taskList = document.getElementById('task-list');
    const filterField = document.getElementById('filter-field');
    const addField = document.getElementById('add-field');
    const tasksRemaining = document.getElementById('tasks-remaining');
    const addButton = document.getElementById("add-button");
    const clearAllButton = document.getElementById('clear-all-button');
    const clearCompletedButton = document.getElementById('clear-completed-button');
    const saveButton = document.getElementById('save-button');
    const discardButton = document.getElementById('discard-button');
    const regularStateButtonSection =  document.getElementById('regular-state-buttons');
    const editStateButtonSection =  document.getElementById('edit-state-buttons');
    const container = document.querySelector('.jumbotron');
    const listItems = document.getElementsByTagName("li");
    source = new Datasource();

    this.init = function() {
        renderPage();
        loadStaticEventListeners();
    }

    const renderPage = function() {
        let tasks = source.getTasks();
        source.getId();
        taskList.innerHTML = '';
        tasks.forEach(function(task) {
            renderListItem(task);
          });
        addField.value = '';
        tasksRemaining.textContent = `${tasks.length} tasks remaining`;
    }

    const renderListItem = function(item) {
        let template = document.getElementById('task-item').innerHTML;
        let html = Handlebars.compile(template)(item);
        taskList.insertAdjacentHTML('beforeend', html);
        const currentLi = listItems[listItems.length-1];
        loadDynamicEventListeners(currentLi);
    }
    
    const loadStaticEventListeners = function() {
        addButton.addEventListener('click', addTask);
        clearAllButton.addEventListener('click', clearAllTasks);
        clearCompletedButton.addEventListener('click', clearCompletedTask);
        saveButton.addEventListener('click', saveChanges);
        discardButton.addEventListener('click', discardChanges);
        filterField.addEventListener('keyup', filterTasks);
    }

    const loadDynamicEventListeners = function(currentLi) {
        const descendants = Array.from(currentLi.getElementsByTagName('*'));
        descendants.forEach(function(descendant) {
            if (descendant.matches('[type="checkbox"]')) {
                descendant.addEventListener('click', toggleCompleted);
            }
            if (descendant.classList.contains('delete-icon')) {
                descendant.addEventListener('click', removeTask);
            }
            if (descendant.classList.contains('edit-icon')) {
                descendant.addEventListener('click', editTask);
            }
        });
    }

    const displayMessage = function(message, color)
    {
        const card = document.createElement('div');
        card.className = `card bg-${color} mb-2 message`;
        const cardBody = document.createElement('div');
        cardBody.className = `card-body`;
        cardBody.textContent = message;
        card.appendChild(cardBody);
        container.append(card);
        setTimeout(function () { 
            card.remove(); 
            }, 2000);
    }

    const addTask = function(e) { 
        e.preventDefault();
        if (addField.value === '') {
            displayMessage('Add a task name!', 'warning');
        } else {
            let newTaskName = addField.value;
            let newTaskId = source.getNextId();
            if (source.taskExists(newTaskName) === true)
            {
                displayMessage('Task with that name already exists!', 'warning');
            } else {
                let task = new Task(newTaskName, newTaskId);
                source.saveTask(task);
                renderPage();
                displayMessage('Task added!', 'success');
            }
        }
    }

    const removeTask = function(e) {
        e.preventDefault();
        let removedLinkElement = lookUpPropagationChain(e.target, 'delete-icon');
        let removedTaskId = removedLinkElement.getAttribute('data-id');
        source.removeTask(removedTaskId);
        renderPage();
        displayMessage('Task removed!', 'success');
    }

    const filterTasks = function(e) {
        let input = e.target.value;
        for (var i = 0; i < listItems.length; i++) {
            let id = listItems[i].getAttribute('data-id');
            if (source.getTaskById(id) !== undefined) {
                if (source.getTaskById(id).name.toLowerCase().includes(input.toLowerCase())) {
                    listItems[i].style.display = "";
                } else {
                    listItems[i].style.display = "none";
                }
            }
        }
    }

    const editTask = function(e) {
        e.preventDefault();
        const editedLinkElement = lookUpPropagationChain(e.target, 'edit-icon');
        let arrayListItems = Array.from(listItems)
        const editedLi = arrayListItems.find(listItem => listItem.getAttribute('data-id') === editedLinkElement.getAttribute('data-id'));
        editedLi.classList += ' to-be-edited';
        const editedTaskName = editedLi.textContent.trim();
        changeToEditMode(editedTaskName);
    }

    const lookUpPropagationChain = function(target, iconType) {
        let currentElement = target;
        while (!currentElement.classList.contains(iconType)) {
            currentElement = currentElement.parentElement;
        }
        return currentElement;
    }

    const saveChanges = function(e) {
        e.preventDefault();
        const input = addField.value;
        if (input) {
            if (source.taskExists(input) === true)
            {
                displayMessage('Task with that name already exists!', 'warning');
            } else {
                const editedTaskId = getEditedTaskId(input);
                const updatedTask = source.getTaskById(editedTaskId);
                updatedTask.name = input;
                source.updateTask(editedTaskId, updatedTask);
                renderPage();
                displayMessage('Task updated!', 'success');
                changeToRegularMode();
            }
        }
    }

    const getEditedTaskId = function(input) {
        const arrayListItems = Array.from(listItems);
        const editedLi = arrayListItems.find(listItem => listItem.classList.contains('to-be-edited'));
        editedLi.textContent = input;
        const editedTaskId = editedLi.getAttribute('data-id');
        return editedTaskId;
    }

    const discardChanges = function(e) {
        changeToRegularMode();
        e.preventDefault();
    }

    const changeToEditMode  = function(editedTaskName) {
        addField.value = editedTaskName;
        addButton.style.display = 'none';
        regularStateButtonSection.style.display = 'none';
        editStateButtonSection.style.display = '';
    }

    const changeToRegularMode = function()
    {
        regularStateButtonSection.style.display = '';
        editStateButtonSection.style.display = 'none';
        addField.value = '';
        addButton.style.display = '';
    }

    const clearAllTasks = function(e)
    {
        e.preventDefault();
        if (source.getTasksCount() > 0) {
            source.clearAllTasks();
            displayMessage('All tasks cleared!', 'success');
            renderPage();
        }
    }

    const clearCompletedTask = function(e) {
        e.preventDefault();
        let initialTasksCount = source.getTasksCount();      
        for (var i = 0; i < listItems.length; i++) {
            let id = listItems[i].getAttribute('data-id');
            if (source.getTaskById(id).completed) {
                source.removeTask(id);
            }
        }

        renderPage();
        if (source.getTasksCount() !== initialTasksCount) {
            displayMessage('Completed tasks cleared!', 'success');
        }
    }
    
    const toggleCompleted = function(e) {
        let labelElement = lookUpPropagationChain(e.target, 'label');      
        let taskId = e.target.getAttribute('data-id');
        let task = source.getTaskById(taskId);
        if (task.completed) {
            task.completed = false;
            labelElement.style.textDecoration = '';
            displayMessage("Task still pending", 'warning');
        } else {
            task.completed = true;
            labelElement.style.textDecoration = 'line-through'; 
            displayMessage("Task completed", 'success');
        }

        source.updateTask(taskId, task);
    }
     
}