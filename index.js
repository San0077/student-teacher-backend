import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb';
const app = express()
app.use(express.json());
dotenv.config()
app.use(cors())

var mongoUrl = process.env.mongoUrl
async function createConnection(){
    var client = new MongoClient(mongoUrl);
    await client.connect()
    console.log("connection is ready ")
 return client
}
export var client = await createConnection()

async function passwordMatch(pass){
    var salt = await bcrypt.genSalt(4);
    var hash = await bcrypt.hash(pass,salt);
    return hash;
}


app.post("/stu-form", async function(req,res){
    let {email,password,role} = req.body
  
    let hash = await passwordMatch(password)
    let result = await client.db("teacher").collection("student").insertOne({email,"password":hash,"role":role})
    res.send(result)
    
})

  app.post("/",async function(req,res){
    let {email,password}=req.body;
    console.log(email)
    let result =await client.db("teacher").collection("student")
    .findOne({email});
    if(!result){
        res.status(401).send({msg:"invalid"})
    }else{
        var storedPassword = result.password
        var compare = await bcrypt.compare(password,storedPassword)
        if(!compare){
            res.status(401).send({msg:"invalid"})
        }else{
            const token = await jwt.sign({id:result._id},"santhosh");
              res.send(result)
        }
    }
  })


app.listen(process.env.PORT,()=>{
    console.log("server is ready")
});
