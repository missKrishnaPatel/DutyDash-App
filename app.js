const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
 require('dotenv').config();


// const date = require(__dirname + '/data.js');


// const items = [];
// const workList = [];


const app = express();

app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');






//------------------------------------------------------------------------------------------
// mongoose.connect('mongodb://127.0.0.1:27017/todolist1');
   mongoose.connect(process.env.todolist1);
const itemsSchema = new mongoose.Schema({
    name:String
});
const Item =new mongoose.model("Item",itemsSchema);


const listSchema =new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const List =new mongoose.model("List",listSchema);
//------------------------------------------------------------------------------------------
const insertItems =async function(){
    try{
        const first = new Item({
            name:"Welcome to your todolist"
       });
       const second=new Item({
           name:"hit + button to add new items"
       });
       const third = new Item({
           name:"<-- hit this to delete an item"
       });
       
       const defaultItems =[ first,second,third];
       
       const result =await Item.insertMany(defaultItems);
           console.log(result);
        }
        catch(err){
            console.log(err);
            }
            }
            // insertItems();

 //---------------------------------------------------------------------------------

            app.get("/",function(req,res){
  
                //find:
                const findItem = async () =>{
                    try{
                    const result = await Item.find({});
                    if(result.length===0){
                        insertItems();
                        res.redirect("/");
                    }
                    
                    res.render("lists",{listTitle:"today",newItems:result});
                    }catch(err){
                        console.log(err);
                    }
                };
                findItem();
            });
//-------------------------------------------------------------------------------------


// app.get('/', function(req, res){
//     const day = date.setDate();
//     res.render('lists', { listTitle: "Today", addItems: items})
// });


app.post('/', function(req, res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

if(listName ==='today'){
    try{
    item.save();
    res.redirect("/");
    }catch(err){
        console.log(err);
    }
}else{
    const findList = async () => {
        try {
            const list = await List.findOne({ name: listName });

            if (list) {
                list.items.push(item);
                 list.save();
                res.redirect("/" + listName);
            } else {
                // Handle the case when the list doesn't exist
                console.log("Custom list not found.");
            }
        } catch (err) {
            console.log(err);
        }
    }
    findList();
}
    //     item.save();
    // if (req.body.list === 'Work List'){
    //     workList.push(item);
    //     res.redirect('/work')
    // }else{
    //     items.push(item);

    //     res.redirect('/');
    // }
});
//----------------------------------------------------------------------------------------




app.post("/delete", async function(req,res){
   
    const checkeditem =req.body.itemId;
    const listName = req.body.listName;
    

   if(listName=== "today"){
    try{

       await Item.findByIdAndDelete(checkeditem);
       console.log("Successfully deleted checked item.");
   res.redirect("/");
    }catch(err){
       console.log(err);
    }
   }
   else{
       try{
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkeditem}}});
          
             res.redirect("/" + listName);
      
   }catch(err){
       console.log(err);
    }
   }
});
//-----------------------------------------------------------------------------------------------




app.get("/:customList", async function (req, res) {
    const customListName = _.capitalize(req.params.customList);
    
    try {
        const foundList = await List.findOne({ name: customListName });
        
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: []
            });

            await list.save();
            res.redirect("/" +customListName);
            // res.render("list", { listTitle: customListName, newItems: list.items });
        } else {
            res.render("lists", { listTitle: foundList.name, newItems: foundList.items });
       }
    } catch (err) {
        console.log(err);
    }
});
//-------------------------------------------------------------------------------------------------

// app.get('/work', function(req, res){
//     res.render('lists', { listTitle: "Work List", addItems: workList});
// });


// app.get('/about', function(req, res){
//     res.render('about');
// });




// app.listen(process.env.PORT || 3000, function(){
//     console.log('App is running on port 3000.');
// });
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`App is running on port ${PORT}.`);
});


