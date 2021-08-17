const express = require("express")
const app = express()
app.use(express.json())
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const pathFile = path.join(__dirname,"todoApplication.db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const addDays = require("date-fns/addDays")
let db = null
const connectingDatabase = async()=>{
    try{
        db = await open({
            filename:pathFile,
            driver:sqlite3.Database
        })
    }catch(e){
        console.log(e.message)
        process.exit(1)
    }
    app.listen(3000,()=>{
        console.log("this server is connected to http://localhost:3000")
    })
}
connectingDatabase()
const convertingStatus = (data)=>{
    return{
        id:data.id,
        todo:data.todo,
        priority:data.priority,
        status:data.status,
        category:data.category,
        dueDate:data.due_date
    }
}
const statusQuery = (data)=>{
    return data.status !== undefined
}
const priorityQuery = (data)=>{
    return(data.priority !== undefined)
}
const both = (data)=>{
    return(data.status !== undefined && data.priority !== undefined)
}
const searchQuery = (data)=>{
    return (data.search_q !== undefined)
}
const categoryAndStatus = (data)=>{
    return(data.status !== undefined && data.category !== undefined)
}
const onlyCategory = (data)=>{
    return (data.category !== undefined)
}
const categoryAndPriority = (data)=>{
     return(data.category !== undefined && data.priority !== undefined)
}
app.get("/todos/",async(request,response)=>{
    let {
         status,
         priority,
         search_q = "",
         category
     } = request.query
     let query = ""
     let string
    // const query = `select * from todo where priority = '${priority}'`
    // const result = await db.all(query)
    // response.send(result.map((each)=>
    // convertingStatus(each)))
     switch (true) {
         case both(request.query):
            string = status.replace("%20"," ")
            query = `select * from todo where status = '${string}' and 
            priority = '${priority}'`
            break;
         case statusQuery(request.query):    
            string = status.replace("%20"," ")                  
            query = `select * from todo where status = '${string}'`
             break;
         case priorityQuery(request.query):
             query = `select * from todo where priority = '${priority}'`
             break
         case searchQuery(request.query):
             query = `select * from todo where todo like '%${search_q}%'`
             break
         case categoryAndStatus(request.query):               
             query = `select * from todo where status = '${status}' and 
            category = '${category}'`
         case onlyCategory(request.query):
             query = `select * from todo where category = '${category}'`
             break
         case categoryAndPriority(request.query):
             query = `select * from todo where category = '${category}'
             and priority = '${priority}'`
             break
     }      
     const result = await db.all(query)
    response.send(result.map((each)=>
    convertingStatus(each)))
})
app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId} = request.params;
    const query = `select * from todo where id = ${todoId}`
    const result = await db.get(query)
    response.send(convertingStatus(result))
})
app.get("/agenda/",async(request,response)=>{
    const {date} = request.query
    const query = `select * from todo where due_date = '${date}'`
    const result = await db.all(query)
    response.send(convertingStatus(result))
})
app.post("/todos/",async(request,response)=>{
    const {
        id,
        todo,
        priority,
        status,
        category,
        dueDate
        } = request.body
    const query = `insert into todo(id,todo,priority,status,category,due_date)
    values(
        '${id}',
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
    )`
    await db.run(query)
    response.send("Todo Successfully Added")
})
const statusPut = (body)=>{
    return (body.status !== undefined)
}
const priorityPut = (body)=>{
    return (body.priority !== undefined)
}
const todoPut = (body)=>{
    return(body.todo !== undefined)
}
const categoryPut = (body)=>{
    return(body.category !== undefined)
}
const dueDatePut = (body)=>{
    return(body.dueDate !== undefined)
}
app.put("/todos/:todoId/",async(request,response)=>{
    const {todoId} = request.params
    const {
        todo,
        priority,
        status,
        category,
        dueDate
    } = request.body
    let query = ""
    switch (true){
        case statusPut(request.body):
            query = `update todo set status = '${status}' where id = '${todoId}'`
            await db.run(query)
            response.send("Status Updated")
            break;
        case priorityPut(request.body):
            query = `update todo set priority = '${priority}' where id = '${todoId}'`
            await db.run(query)
            response.send("Priority Updated")
            break;
        case todoPut(request.body):
            query = `update todo set todo = '${todo}' where id = '${todoId}'`
            await db.run(query)
            response.send("Todo Updated")
            break;
        case categoryPut(request.body):
            query = `update todo set category = '${category}' where id = '${todoId}'`
            await db.run(query)
            response.send("category Updated")
            break;
        case dueDatePut(request.body):
            query = `update todo set due_date = '${dueDate}' where id = '${todoId}'`
            await db.run(query)
            response.send("Due Date Updated")
            break;         
    }
})
app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId} = request.params
    const query = `delete from todo where id = '${todoId}'`
    await db.run(query)
    response.send("Todo Deleted")
})
module.exports = app