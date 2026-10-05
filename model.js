const mongoose = require("mongoose");
mongoose.connect("")

 const userSchema = mongoose.Schema({
    username : String,
    password : String
 })

 const organisationSchema = mongoose.Schema({
    org_name : String ,
    description : String ,
    admin : mongoose.Types.ObjectId,
    members : [mongoose.Types.ObjectId]
 })

 
 const boardSchema = mongoose.Schema({
    org_id : mongoose.Types.ObjectId,
    title : String ,
   })
   
   const issueSchema = mongoose.Schema({
      board_id : mongoose.Types.ObjectId,
      description : String,
      state : String 
   })
   
   const organisationModel = mongoose.model("organisation",organisationSchema);
   const userModel = mongoose.model("user",userSchema);
   const boardModel = mongoose.model("board",boardSchema);
   const issueModel = mongoose.model("issue",issueSchema);


   module.exports ={
      organisationModel,
      userModel,
      boardModel,
      issueModel
 }