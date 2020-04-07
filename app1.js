(function App () {
    var controller = new Controller();
    controller.init();
})();


function Datasource() {
    var tasks = [];
    var nextId = 0;
    
    this.getTasks = function() {
        if (localStorage.getItem('tasks') === null) {
            tasks = [];
        } else {
            tasks = JSON.parse(localStorage.getItem('tasks'));
        }
        return tasks;
    }

    this.getId = function(){
        if (localStorage.getItem('nextId') === null) {
            nextId = 0;
        } else {
            nextId = JSON.parse(localStorage.getItem('nextId'));
        }
        return nextId;
    }

    this.getNextId = function() {
        nextId ++;
        return nextId;
    }

    this.saveTask = function(newTask)
    {
        tasks.push(newTask);
        saveToLocalStorage();
    }

    this.removeTask = function(id) {
        tasks = tasks.filter(task => task.id != id);
        saveToLocalStorage();
    }

    this.updateTask = function(id, taskUpdated) {
        let index = tasks.findIndex(task => task.id == id);
        tasks[index] = taskUpdated;
        saveToLocalStorage();
    }

    this.clearAllTasks = function() {
        tasks.splice(0, tasks.length);
        saveToLocalStorage();
    }
    
    const saveToLocalStorage = function()
    {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('nextId', JSON.stringify(nextId));
    }
    
    this.taskExists = function(taskName) {
        return tasks.some(task => task.name === taskName);
    }

    this.getTaskById = function(id) {
        let task = tasks.find(task => task.id == id);
        return task;
    }

    this.getTasksCount = function(){
        return tasks.length;
    }
}

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
        loadEventListeners();
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
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.setAttribute('data-id', item.id);
        const div = document.createElement('div');
        div.className = 'form-check';
        const label = document.createElement('label');
        label.className = 'label';
        if (item.completed === true) {
            label.style.textDecoration = 'line-through';
        }
        div.className = 'form-check-label';
        const checkBox = document.createElement('input');
        checkBox.className = 'mr-3';
        checkBox.type = 'checkbox';
        checkBox.setAttribute('data-id', item.id);
        checkBox.addEventListener('click', toggleCompleted);
        if (item.completed === true) {
            checkBox.checked = true;
        }
        const linkDelete = document.createElement('a');
        linkDelete.className = 'float-right delete-icon';
        linkDelete.href = '';
        linkDelete.setAttribute('data-id', item.id);
        linkDelete.addEventListener('click', removeTask);
        const iconDelete = document.createElement('i');
        iconDelete.className = 'fa fa-remove';

        const linkEdit = document.createElement('a');
        linkEdit.className = 'float-right edit-icon mr-2';
        linkEdit.href = '';
        linkEdit.setAttribute('data-id', item.id);
        linkEdit.addEventListener('click', editTask);
        const iconEdit = document.createElement('i');
        iconEdit.className = 'fa fa-pencil';
    
        linkEdit.appendChild(iconEdit);
        linkDelete.appendChild(iconDelete);
        label.appendChild(checkBox);
        label.appendChild(document.createTextNode(item.name));
        div.appendChild(label);
        div.appendChild(linkDelete);
        div.appendChild(linkEdit);
        li.appendChild(div);
        taskList.appendChild(li);
    }
    
    const loadEventListeners = function() {
        addButton.addEventListener('click', addTask);
        clearAllButton.addEventListener('click', clearAllTasks);
        clearCompletedButton.addEventListener('click', clearCompletedTask);
        saveButton.addEventListener('click', saveChanges);
        discardButton.addEventListener('click', discardChanges);
        filterField.addEventListener('keyup', filterTasks);
    }

    const displayMessage = function(message, color)
    {
        const card = document.createElement('div');
        card.className = `card bg-${color} mb-2`;
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
        const editedTaskName = editedLi.textContent;
        changeModeToEdit(editedTaskName);
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
                const arrayListItems = Array.from(listItems);
                const editedLi = arrayListItems.find(listItem => listItem.classList.contains('to-be-edited'));
                editedLi.textContent = input;
                const editedTaskId = editedLi.getAttribute('data-id');
                const updatedTask = source.getTaskById(editedTaskId);
                updatedTask.name = input;
                source.updateTask(editedTaskId, updatedTask);
                renderPage();
                changeModeToRegular();
            }
        }
    }

    const discardChanges = function(e) {
        changeModeToRegular();
        e.preventDefault();
    }

    const changeModeToEdit  = function(editedTaskName) {
        addField.value = editedTaskName;
        addButton.style.display = 'none';
        regularStateButtonSection.style.display = 'none';
        editStateButtonSection.style.display = '';
    }

    const changeModeToRegular = function()
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

function Task(name, id) {
    var id = id;
    var name = name;
    var completed = false;

    return {
        id,
        name,
        completed
    }
}






// //function useTemplate(item) {
//     var template = $('#task-item').html();
//     var html = Handlebars.compile(template)(item);
//     taskList.insertAdjacentHTML('beforeend', html);
// // }




