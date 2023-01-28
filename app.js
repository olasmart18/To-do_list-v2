const express = require("express");
const env = require("dotenv").config();
const bodyPaser = require("body-parser");
const ejs = require("ejs")
const mongoose = require("mongoose")

mongoose.set('strictQuery', true)

const app = express();
app.use(bodyPaser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs")
const dbName = "todolistDB"

mongoose.connect(process.env.MONGO_URI  + dbName);

const listSchema = {
    name: String
}

const List = mongoose.model("List", listSchema);

const list1 = new List({
    name: "welcome to todo list"
})

const list2 = new List({
    name: "write your list"
})

const defaultList = [list1, list2];

app.get("/", function (req, res) {
    List.find({}, function(err, foundItem) {
        if (foundItem.length === 0) {
            List.insertMany(defaultList, function (err) {
                if (!err) {
                    console.log("successfully added data to db")
                } else {
                    console.log(err)
                }
            })
            res.redirect("/");
        }else{
            res.render("pages/index", { title: "Today", list: foundItem});
        }
    })   
})

/**
 * create a post request to handle from client side
 * use mongodb method insertMany to append new item to database
 * redirect to the home route to render the newly added items to the list
 * @incomingItem - variable holds the item enter by user
 * @newItem - a new schema to hold incomingItem variable
 */

app.post("/", function(req, res){
    var incomingItem = req.body.newList;
    const newItem = new List({
        name : incomingItem
    })
    List.insertMany(newItem, function(err){
        if(!err){
            res.redirect("/");
        }else{
            throw new err("can not insert to the document")
        }
    })
})

app.listen(3000, function () {
    console.log("serving on port 3000");
})