tasks = [];
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterField = document.getElementById('filter-field');
const addField = document.getElementById('add-field');
const tasksRemaining = document.getElementById('tasks-remaining');
const addButton = document.getElementById("add-button");
const clearAll = document.getElementById('clear-all-button');
const clearCompleted = document.getElementById('clear-completed-button');
const container = document.querySelector('.jumbotron');

(function LoadEventListeners()
{
addButton.addEventListener('click', addTask);
taskList.addEventListener('click', removeTask);
clearAll.addEventListener('click', clearAllTasks);
filterField.addEventListener('keyup', filterTasks);
})();

(function LoadUI()
{
    if(localStorage.getItem('tasks') === null)
    {
        tasks = [];
    } 
    else 
    {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }

    tasks.forEach(function(task){
        renderItem(task);
      });

    tasksRemaining.textContent = `${tasks.length} tasks remaining`;
})();


function addTask (e)
{
    if(addField.value === '')
        {
            displayMessage('Add a task name!', 'danger');
            e.preventDefault();
        }
    else
    {
        let newTask = addField.value;
        tasks.push(newTask);
        saveToLocalStorage(newTask);
        renderItem(newTask);
        addField.value = '';
        displayMessage('Task added!', 'success');
        e.preventDefault();
    }
    tasksRemaining.textContent = `${tasks.length} tasks remaining`
}

function saveToLocalStorage (newTask)
{
    if(localStorage.getItem('tasks') === null)
    {
        tasks = [];
    } 
    else 
    {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTask (e) {
    if(e.target.parentElement.classList.contains('delete-icon')) 
    {
        e.target.parentElement.parentElement.parentElement.remove();
        let removedTask = e.target.parentElement.previousElementSibling.textContent;
        //e.stopPropagation();
        e.preventDefault();
        removeFromLocalStorage(removedTask);
        tasksRemaining.textContent = `${tasks.length} tasks remaining`;
        displayMessage('Task Removed', 'success');
    }
}

function removeFromLocalStorage (task)
{
    if(localStorage.getItem('tasks') === null)
    {
        tasks = [];
    } 
    else 
    {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }

    tasks.forEach(function(taskItem, index)
    {
        if(task === taskItem)
            {
                tasks.splice(index, 1);
                //break;
            }

        localStorage.setItem('tasks', JSON.stringify(tasks));
    });
}

function clearAllTasks (e)
{
    taskList.innerHTML = '';
    tasks.splice(0, tasks.length);
    clearLocalStorage();
    displayMessage('All tasks cleared!', 'success');
    e.preventDefault();
}

function clearLocalStorage ()
{
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function displayMessage (message, color)
{
    const card = document.createElement('div');
    card.className = `card bg-${color} mb-2`;
    const cardBody = document.createElement('div');
    cardBody.className = `card-body`;
    cardBody.textContent = message;
    card.appendChild(cardBody);
    container.insertBefore(card, container.childNodes[0]);
    setTimeout(function ()
    { 
        card.remove(); 
    }, 2500);
}

function filterTasks (e)
{
    let input = e.target.value;
    taskList.innerHTML = '';
    tasks.forEach(function (task)
    {
        if (task.toLowerCase().includes(input.toLowerCase()))
        {
            renderItem(task);
        }
    });
}

function renderItem (item)
{
    const li = document.createElement('li');
    li.className = 'list-group-item';
    const div = document.createElement('div');
    div.className = 'form-check';
    const label = document.createElement('label');
    div.className = 'form-check-label';
    const checkBox = document.createElement('input');
    checkBox.className = 'mr-1';
    checkBox.type = 'checkbox';
    const link = document.createElement('a');
    link.className = 'float-right delete-icon';
    link.href = '';
    const icon = document.createElement('i');
    icon.className = 'fa fa-remove';

    link.appendChild(icon);
    label.appendChild(checkBox);
    label.appendChild(document.createTextNode(item));
    div.appendChild(label);
    div.appendChild(link);
    li.appendChild(div);
    taskList.appendChild(li);
}


