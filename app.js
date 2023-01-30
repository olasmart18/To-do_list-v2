const express = require("express");
const env = require("dotenv").config();
const bodyPaser = require("body-parser");
const ejs = require("ejs")
const mongoose = require("mongoose")
const _ = require("lodash")

mongoose.set('strictQuery', true)

const app = express();
app.use(bodyPaser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs")
const dbName = "todolistDB"

mongoose.connect(process.env.MONGO_URI + dbName);

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

const otherListSchema = {
    name: String,
    lists: [listSchema]
}

const otherList = mongoose.model("otherList", otherListSchema);

app.get("/", function (req, res) {
    List.find({}, function (err, foundItem) {
        if (foundItem.length === 0) {
            List.insertMany(defaultList, function (err) {
                if (!err) {
                    console.log("successfully added data to db")
                } else {
                    console.log(err)
                }
            })
            res.redirect("/");
        } else {
            res.render("pages/index", { title: "Today", list: foundItem });
        }
    })
})

app.get("/:customList", function (req, res) {
    const customList = _.capitalize(req.params.customList);
    // console.log(customList);
    otherList.findOne({ name: customList }, function (err, foundList) {
        if (foundList) {
            res.render("pages/index", { title: customList, list: foundList.lists })
        } else {
            const newList = new otherList({
                name: customList,
                lists: defaultList
            })
            newList.save();
            res.redirect("/" + customList)
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

app.post("/", function (req, res) {
    const incomingItem = req.body.newList;
    // const incomingList = req.body.list;
    // console.log(incomingItem, incomingList);

    // will write a code to dynamically post to each list

    const newItem = new List({
        name: incomingItem
    })
    newItem.save()
    res.redirect("/");
});

app.post("/delete", function (req, res) {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    console.log(listName);

    if (listName === "Today") {
        List.findByIdAndRemove(checkedItem, function (err) {
            if (!err) {
                res.redirect("/");
            } else {
                console.log(err);
            }
        })
    } else {
        otherList.findOneAndUpdate({ name: listName },
            { $pull: { lists: { _id: checkedItem } } },
            function (err, foundList) {
                if (!err) {
                    res.redirect("/" + listName);
                }
            })
    }
})

app.listen(3000, function () {
    console.log("serving on port 3000");
})