const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
//mongoose.connect("mongodb+srv://sriya:sriyaatlas@cluster0.jj9bhpx.mongodb.net/");
const _ =require("lodash");//required in order to use the capitalize method
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));//in order to use the static files in dynamic webpages
const uri="mongodb+srv://20bq1a05o3vvit:sriyatodolist@cluster0.jajp9oy.mongodb.net/ToDoListDB";
/*const connectionParams={
  useNewUrlParser:true,
  useUnifiedTopology:true,
};
mongoose.connect(uri,connectionParams).then(()=>{
  console.log("connected to the DB");
}).catch((e)=>{
  console.log("error",e);
})*/
const connectDB=async(uri)=>{
  await mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
  });
  console.log("connected to DB successfully");
}
//mongoose.connect("mongodb+srv://saisriya:sriyaatlas2003@cluster0.zlztzav.mongodb.net/?retryWrites=true&w=majority");
const itemSchema = mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item",itemSchema);
const itemsarray = [
  {
    name:"Welcome to your ToDoList"
  },
  {
    name:"Hit the + button to add new item"
  },
  {
    name:"<-- Hit this to delete the item"
  }
]
//making sure that the items in the list are not inserted more than once
app.get("/", function (req, res) {
  Item.find({}).then(result => {
    //if there are no items in the list then the default items that is(itemsarray) gets inserted
    if (result.length == 0) {
      Item.insertMany(itemsarray).then(result => {
        console.log("Saved the items Successfully!");
      });
      res.redirect("/");
    }

    else {
      res.render("list", {listTitle:"Today" , newListItems: result})
    }

  });

});
//creating the custom list names
const listSchema = mongoose.Schema({
  name: String,//title
  items: [itemSchema]//list items that follow the items schema
});
const list = mongoose.model("List", listSchema);

app.get("/:customListName", (req, res) => {
  const customListName =_.capitalize(req.params.customListName);
  list.findOne({name:customListName}).then(result=>{
    if(!result){
      //create a new list
      const list1 = new list({
        name: customListName,
        items: itemsarray
    });
    list1.save();
    res.redirect("/"+customListName);
    }else{
      //show an existing list
      res.render("list",{listTitle:customListName , newListItems: result.items});
    }
  });
  });
//adding the items to default page(today) and also to custom list pages
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }else{
    list.findOne({name:listName}).then(result=>{
      result.items.push(item);
      result.save();
      res.redirect("/"+listName);
    })
  }

});
//deleting the items from default page(today) and also from custom list pages
app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName=req.body.listname;
  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItem).then((result) => {
      console.log("Item deleted Successfully");
    });
    res.redirect("/");
  }else{
    //inorder to delete the items from the array..instead of using for loop we can use $pull.
    //$pull is used to remove all the instances of an array with specified value or values
    //mongoose method findOneAndUpdate({condition},{update}
    //in update we can use{$pull:{field:{query}}}
    list.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}}).then(result=>{
      console.log("Item had succesfully deleted from the list");
    });
    res.redirect("/"+listName);
  }
});
//closing the connection
//mongoose.connection.close();

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
