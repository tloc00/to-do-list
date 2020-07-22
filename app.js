//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ntl:tanloc0413@blog-buhzk.mongodb.net/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemSchema);
const item1 = new Item({
  name: "num1"
});
const item2 = new Item({
  name: "num2"
});
const item3 = new Item({
  name: "num3"
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  list: [itemSchema]
}
const List = mongoose.model("list", listSchema);
const items = [];

//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
  Item.find(function(err, listItems){
    if(listItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err)
          console.log(err);
        else
          console.log("ok");
      });
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: listItems});
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.list.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  console.log(req.body);
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(req.body.checkbox, function(err){
      res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {list: {_id: req.body.checkbox}}}, function(err) {
      res.redirect("/" + listName);
    });
  }

});

app.get("/:customListName", function(req, res) {
  const name = _.capitalize(req.params.customListName);
  List.findOne({name: name}, function(err, foundName){
    if(!err)
    {
      if(!foundName)
      {
        const list = new List({
          name: name,
          list: defaultItems
        });
        list.save();
        res.redirect("/" + name);
        console.log("not exist");
      }
      else {
        res.render("list", {listTitle: name, newListItems: foundName.list});
        console.log("exist");
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
