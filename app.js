const API_URL = 'http://localhost:3500'

const list = document.querySelector('.todo_list')
const formBtn = document.querySelector('.form_btn')
const formInput = document.querySelector('.form_inp')

//! State

let todoList = []
let formText = ''
let editMode = false
const BTN_EDIT = {
    CREATE: 'add',
    EDIT: 'Edit'
}

//! Events

formInput.addEventListener('input', ( { target: {value} } ) => {
    formText = value
})

formBtn.addEventListener('click', (event) => {
    event.preventDefault()

    if(!editMode) {
        const newTodo = {
            task: formText,
            isCompleted: false
        }

        createTodo(newTodo)
        return
    }
})

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete_btn')) {
        const targetId = +event.target.id
        deleteTodo(targetId)
    }
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit_btn')) {
        const todoId = +event.target.id;
        const newTask = prompt('Введите новое название задачи');
        if (newTask) {
            editTodoList(todoId, newTask);
        }
    }
});

//! Request Fn

getTodos()

async function getTodos() {
    const url = `${API_URL}/todos`
    const todos = await makeRequest(url)
    todoList = todos
    render()
}

async function createTodo(todo) {
    const url = `${API_URL}/todos`
    const addedTodo = await makeRequest(url, 'POST', todo)
    todoList = [...todoList, addedTodo]
    render()
    clearForm()
}

async function deleteTodo(todoId) {
    const url = `${API_URL}/todos/${todoId}`
    await makeRequest(
        url,
        'DELETE',
        null, 
        {
            message : 'Задача успешно удалена',
            type: 'success'
        }
    )
    todoList = todoList.filter(todo => todo.id !== +todoId)
    render()
}

async function completeTodo(todo) {
    const url = `${API_URL}/todos/${todo.id}`
    const changedTodo = await makeRequest(url, 'PATCH', { isCompleted: !todo.isCompleted })
}

async function editTodo (todoId, { task, isCompleted }) {
    const url = `${API_URL}/todos/${todoId}`
    const changedTodo = {
        id: todoId,
        task,
        isCompleted
    }

    const editedTodo = await makeRequest(url, 'PUT', changedTodo)
}

//* Crud FN


// Render
async function render() {

    if(!todoList.length) {
        list.innerHTML = 'Задач нету.'
        return
    }

    list.innerHTML = ''

    todoList.forEach(todo => {

        const li = document.createElement('li')
        li.classList.add('todo_list_item')

        if(todo.isCompleted) {
            li.classList.add('is_completed')
        }

        li.innerHTML = `
            <input id="${todo.id}" class="checkbox" type="checkbox" ${todo.isCompleted ? 'checked' : ''}/>
            <span>${todo.task}</span>
            <div class="actions_wrap">
                <button class="edit_btn" id="${todo.id}">Изменить</button>
                <button class="delete_btn" id="${todo.id}">Удалить</button>
            </div>
        `

        list.append(li)
    })
}

async function editTodoList(todoId, newTask) {
    const todo = todoList.find(todo => todo.id === todoId);
    
    const editedTodo = {
        id: todoId,
        task: newTask,
        isCompleted: todo.isCompleted
    };

    await editTodo(todoId, editedTodo);
    todoList = todoList.map(todo => (todo.id === todoId ? editedTodo : todo));
    render();
    clearForm();
}


//? Helpers

async function makeRequest(url, method = 'GET', data=null, toastData = null) {
    try{
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : null
        })
        if(toastData) {
            showToast(toastData?.message, toastData?.type) 
        }
        return await response.json()
    } catch(error) {
        showToast('Произошла внутренняя ошибка', 'error')
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('#toast_container')

    const toast = document.createElement('div')
    toast.classList.add('toast', type)
    toast.innerText = message

    toastContainer.append(toast)

    setTimeout(() => {
        toast.remove
    }, 3000)
}

function clearForm() {
    formText = ''
    formInput.value = ''
}