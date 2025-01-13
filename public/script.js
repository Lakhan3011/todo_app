function moveToSignUp(){
    document.getElementById('signup-container').style.display="block";
    document.getElementById('signin-container').style.display="none";
    document.getElementById('todo-container').style.display="none";
}

function moveToSignIn(){
    document.getElementById('signup-container').style.display="none";
    document.getElementById('signin-container').style.display="block";
    document.getElementById('todo-container').style.display="none";
}

function showTodoApp(){
    document.getElementById('signup-container').style.display="none";
    document.getElementById('signin-container').style.display="none";
    document.getElementById('todo-container').style.display="block";

    getTodos(); 
}

async function signup(){
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await axios.post('http://localhost:3000/signup',{
            username:username,
            password: password
        });

        alert(response.data.message);

        if(response.data.message === "User has signed up successfully"){
            moveToSignIn();
        }
    } catch (error) {
        console.error("Error while signing up:", error);
    }
}

async function signin() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    try {
        const response = await axios.post('http://localhost:3000/signin',{
            username,
            password
        })

        if(response.data.token){
            localStorage.setItem("token", response.data.token);
            alert(response.data.message);
            showTodoApp();
        }
    } catch (error) {
        console.error("Erorr while Signing In:", error);
    }
}

async function logout() {
    localStorage.removeItem('token');
    alert("You have logout successfully");
    moveToSignIn();
}

async function getTodos() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:3000/todos',{
            headers: {
                authorization: token
            }
        })

        const todosList = document.getElementById('todos-list');
        todosList.innerHTML='';
        if(response.data.length){
            response.data.forEach((todo) => {
                const todoElement = createTodoElement(todo);
                todosList.appendChild(todoElement);
            });
        }
    } catch (error) {
        console.log('Error while getting you todos:', error);
    }
}

async function addTodo() {
   const inputEle = document.getElementById('input');
   const title = inputEle.value;

    if(title.trim() === ''){
        alert("Title field cannot be left empty");
    }

    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/addTodo',
            {title: title},
            {
                headers: { authorization: token}
            }
        )
        inputEle.value ="";
        getTodos();
    } catch (error) {
        console.log('Error while adding the todo:', error);
    }
}

async function updateTodo(id,newTitle) {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/todo/${id}`,
            {title: newTitle},
            {
                headers: { authorization: token}
            }
        )
        alert('To-do updated successfully');
        getTodos();
    } catch (error) {
        console.log('Error while updating todos:', error);
    }
}

async function deleteTodo(id) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/todo/${id}`,
            {
                headers: { authorization: token}
            }
        )
        alert("To-Do deleted successfully");
        getTodos();
    } catch (error) {
        console.log('Error while deleting todo:', error);
    }
}

function createTodoElement(todo){
    const todoDiv = document.createElement('div');
    const inputElement = createInputElement(todo.title);
    inputElement.readOnly = true;

    const updateBtn = createUpdateButton(inputElement,todo.id);
    const deleteBtn = createDeleteButton(todo.id);
    const doneCheckbox = createDoneCheckbox(todo.done,todo.id, inputElement);

    todoDiv.appendChild(inputElement);
    todoDiv.appendChild(updateBtn);
    todoDiv.appendChild(deleteBtn);
    todoDiv.appendChild(doneCheckbox);

    return todoDiv;
}

function createInputElement(value){
    const inputElement = document.createElement('input');
    inputElement.type = "text";
    inputElement.value = value;
    inputElement.readyOnly = true;

    return inputElement;
}

function createUpdateButton(inputElement, id){
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Edit'

    updateBtn.onclick = function(){
        if(inputElement.readOnly){
            inputElement.readOnly = false;
            updateBtn.textContent = 'Save';
            inputElement.focus();
            inputElement.style.outline = "1px solid #007BFF";
        }
        else{
            inputElement.readOnly = true;
            updateBtn.textContent = "Edit";
            inputElement.style.outline = "none";

            updateTodo(id, inputElement.value);
        }
    }

    return updateBtn;
}

function createDeleteButton(id){
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    deleteBtn.onclick = function(){
        deleteTodo(id);
    }
    return deleteBtn;
}

async function toggleDone(id,done) {
    const token = localStorage.getItem('token');

    try {
        await axios.put(`http://localhost:3000/todo/done/${id}`,{
            done: !done
        },{
            headers: { Authorization: token }
        })
    } catch (error) {
        console.log("Error while toggling the todo:", error);
    }
}

function createDoneCheckbox(done,id,inputElement){
    const doneCheckbox = document.createElement('input');
    doneCheckbox.type = "checkbox";
    doneCheckbox.checked = done;

    inputElement.style.textDecoration = done ? "line-through": "none";

    doneCheckbox.onclick = function(){
        toggleDone(id,done);
        inputElement.style.textDecoration = doneCheckbox.checked ? "line-through": "none";
    }

    return doneCheckbox;
}