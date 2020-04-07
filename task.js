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