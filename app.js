const express = require('express');
const bodyparser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");

const app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

//Connecting to database
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

//Defining schema
const itemsSchema = {
    name: String
};

//Model for collection
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome!!"
})

const item2 = new Item({
    name: "Click Add to insert more"
});

const item3 = new Item({
    name: "Click to delete!"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model('List', listSchema);
   

app.get("/", (req, res)=>{
//    let day = date();
    
   Item.find({}, function(err, foundItems){
        if(foundItems.length == 0){
            Item.insertMany(defaultItems, function(err){
                if(err)
                    console.log(err);
                else
                    console.log("Successfully saved the new item to items collection.");
            }); 
            res.redirect("/");
        }else{
            res.render("list", {listName: "Today", tasks: foundItems});
        }
   });
});

app.get("/:listType", (req, res)=>{
    // let day = date();

    const listType = req.params.listType.toLowerCase();
    List.findOne({name:listType}, function(err, foundList){
        
        if(!err){
            if(!foundList){
                const newList = new List({
                    name: listType,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + listType);
            }
            else{
                res.render("list", {listName: foundList.name.toUpperCase(), tasks: foundList.items});
            }
        }
        
    });

});

app.post("/", (req, res)=>{
    
    const listName = req.body.list.toLowerCase();
    console.log("listName");
    const newItem = new Item({
        name: req.body.newTask
    });

    if(listName == "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", (req, res)=>{

    const listName = req.body.list.toLowerCase();
    const checkedId = req.body.checkbox
    if(listName == "Today"){
        Item.deleteOne({id: checkedId}, function(err){
            if(err) 
            console.log("Error cannot delete item.");
            else{ console.log("Item successfully deleted."); }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }   
});

app.listen(3000, ()=>{
    console.log("Server is running on port 3000...");
});

// app.post("/", (req, res)=>{
//     res.send("hello");
// });