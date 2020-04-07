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