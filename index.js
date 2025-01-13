const express = require('express');
const jwt = require('jsonwebtoken');
const secret = "random123";
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


const users = [];
const todos = [];


app.post('/signup', (req,res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        res.json({
            message: "Username or password fields can not be left empty"
        })
    }

    if(username.length < 6 ){
        res.json({
            message: "username should be more than 6 characters"
        })
    }

    if(users.find(u => u.username === username)){
        res.json({
            message: "Username with this name, already exists"
        })
    }

    users.push({
        username: username,
        password: password
    })

    res.status(200).json({
        message: "User has signed up successfully"
    })
})

app.post('/signin', (req,res)=>{
    const {username,password} = req.body;
    const foundUser = users.find(u=> u.username === username && u.password === password);

    if(!username || !password){
        res.json({
            message: "Username or password fields can not be left empty"
        })
    }


    if(foundUser){
        const token = jwt.sign({
            username
        },secret);
    
        foundUser.token = token;
        res.json({
            message: "User has signed in sucessfully",
            token: token    
        })
        console.log(users);
    }else{
        res.status(403).json({
            message: "Invalid username or password"
        })
    }
})

function auth(req,res,next){
    const token = req.headers.authorization;
    if(!token){
        res.status(400).json({
            message: "Token is missing, please signin again"
        })
    }

    try {
        const verifiedData = jwt.verify(token,secret);
        req.username = verifiedData.username;
        next();
    } catch (error) {
        res.json({message:  "Invalid token"})
    }
}

app.post('/addTodo',auth, (req,res)=>{
    const {title} = req.body;
    if(!title){
        res.status(400).json({
            message: "title field can not be left empty"
        })
    }
    const currentUser = req.username;
    const newTodo = {
        id: todos.length+1,
        user: currentUser,
        title: title,
        done: false
    }
    todos.push(newTodo);
    res.json({ message: "todo added successfully"})
    console.log(todos);
})

app.get('/todos',auth, (req,res)=>{
    const username = req.username;

    const userTodos = todos.filter(todo=> todo.user === username);
    res.json(userTodos);
})

app.put('/todo/:id',auth, (req,res)=>{
    const {id} = req.params;
    const user = req.username;
    const todo = todos.find(todo=> todo.id === parseInt(id) && todo.user === user);
    if(!todo){
        res.json({ message: 'todo does not exist '})
    }

    const {title} = req.body;
    if(!title){
        res.status(400).json({
            message: "title field can not be left empty"
        })
    }

    todo.title = title;
    res.json( { message: "Todo updated successfully", todo});
})

app.delete('/todo/:id',auth, (req,res)=>{
    const {id} = req.params;
    const user = req.username;

    const todoIndex = todos.findIndex(todo=> todo.id === parseInt(id) && todo.user === user);
    if(todoIndex === -1){
        res.json({ message: "Todo does not exist"});
    }
    let todo = todos[todoIndex];
    todos.splice(todoIndex,1);
    res.json({ message: "Todo deleted successfully", todo: todo})
})

app.put('/todo/done/:id',auth,(req,res)=>{
    const {id} = req.params;
    const user = req.username;
    const todo = todos.find(todo=> todo.id === parseInt(id) && todo.user === user);
    if(!todo){
        res.json({message: "Todo does not exist"});
    }
    todo.done = !todo.done;
    res.json({ message: `todo marked as ${todo.done ? "done" : "undone"}.`,todo});
})

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server started on Port ${PORT}`);
})
