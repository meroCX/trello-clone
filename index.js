const express = require("express");
const jwt = require ("jsonwebtoken");
const { authMiddleware } = require("./middlewares");
const {userModel , organisationModel,boardModel,issueModel } =require("./model");

const app = express();


app.use(express.json());
// normal crud application 

//c - post requests

app.post("/signup",async (req,res)=>{

    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username : username,
        password : password
    });

    if(userExists){
        return res.status(411).json({
            message : "Username already exists"
        });
    }

    const newUser = await userModel.create({
        username : username ,
        password : password
    });


    res.json({
        id : newUser._id ,
        message : "User created"
    });
})

app.post("/signin",async (req,res)=>{
    const username = req.body.username ;
    const password = req.body.password;
    
    const userExists = await userModel.findOne({
        username : username,
        password : password 
    });

    if(!userExists){
        return res.status(403).json({
            message:"invalid credentials"
        });
    }

    const token = jwt.sign({
        user_id : userExists._id
    },"key-pair");

    res.json({
        token : token
    })
})


//authenticated endpoint
app.post("/organisation",authMiddleware, async (req,res)=>{
    const user_id = req.u_id;

    const newOrg = await organisationModel.create({
        org_name : req.body.org_name,
        description : req.body.desc,
        admin : user_id,
        members :[]
    })

     res.json({
        message:"Org created", 
        org_id : newOrg._id
     });
})

app.post("/members-to-org",authMiddleware, async(req,res)=>{
    const user_id = req.u_id;
    const org_id = req.body.org_id;
    const mem_username = req.body.mem_username;
    
    const org_exists = await organisationModel.findOne({
        _id :org_id
    });

    if(!org_exists || org_exists.admin !== user_id){
        res.status(422).json({
            message: "either org does not exist or you aint admin"
        });
        return
    }

    const mem_userexists = await userModel.findOne({
        username : mem_username
    });

    if(!mem_userexists){
        res.status(411).json({
            message : "No user exists with similar username"
        })
        return 
    };

    org_exists.members.push(mem_userexists._id)
    await org_exists.save()
    

    res.json({
        message : "Member added"
    });
})

app.post("/board",authMiddleware,async (req,res)=>{

    const org_id = req.body.org_id;
    const title = req.body.title;

    const org_exists = await organisationModel.findOne({
        _id : org_id
    })
    if(!org_exists){
        res.status(422).json({
            message: "org does not exist "
        });
        return;
    }

    const newBoard = await boardModel.create({
        org_id : org_id,
        title : title
    });


    res.json({
        message : "Board Created",
        board_ID : newBoard._id
    });

})

app.post("/issue",authMiddleware,async (req,res)=>{
    const board_id = req.body.board_id;
    const description = req.body.description;

    const newIssue = await issueModel.create({
        board_id : board_id,
        description : description,
        state : "To-do"
    });

    res.json({
        message : "Issue created",
        issue_ID : newIssue._id
    });
})

// r - get requests 

app.get("/board",authMiddleware,async (req,res)=>{
    const org_id = req.query.org_id; 

    const board_org = await boardModel.find({
        org_id : org_id
    })


    res.json({
        total_boards : board_org.length,
        boards : board_org
    });


})

app.get("/issue",async (req,res)=>{
    const board_id  = req.query.board_id;

    const boardIssue = await issueModel.find({
        board_id 
    })


    res.json ({
        total_issues : boardIssue.length ,
        issues : boardIssue
    });
})

app.get("/members",authMiddleware,async (req,res)=>{
    const user_id  = req.u_id;
    const org_id = req.query.org_id;

    const org_exists = await organisationModel.findOne({
        _id : org_id
    });

    if(!org_exists || org_exists.admin !== user_id){
        res.json ({
            message : "org does not exist or you aint admin"
        });
        return;
    }

    const memberDetails = org_exists.members.map(
        u=> ({
            user_id: u.user_id,
            username :u.username
        })
    );

res.json({
    total_members: memberDetails.length,
    members: memberDetails
});
})

app.get("/organisations",authMiddleware,async (req,res)=>{
    const user_id = req.u_id;

    const org_exists = await organisationModel.find({
    admin : user_id
    })

    if (!org_exists ){
        res.status(411).json({
            message : "no Org exists"
        })
        return ; 
     }

    res.json({
        organizations : org_exists
    });
})


 // u - put requests 

 app.put("/issues",authMiddleware,async (req,res)=>{
    const issue_id = req.body.issue_id;
    
    const issue_exists = await issueModel.findOne({
        _id : issue_id
    });

    if(!issue_exists){
        res.status(403).json({
            message : "issue does not exists"
        });
        return;
    }
     function newstate(state){
         if (state == "to_do"){
         return state = "in_progress";
        }
        else if (state == "in_progress"){
            return state = "done" ;
        }
     }

    issue_exists.state = newstate(issue_exists.state);


    res.json({
        message : "Updated state of issue",
        status : issue_exists.state
    });
 })

 //d - delete requests

 app.delete("/members",authMiddleware,async (req,res)=>{
    const user_id = req.u_id;
    const org_id = req.body.org_id;
    const mem_username = req.body.mem_username;
    
    const org_exists = await organisationModel.findOne({
        _id : org_id
    })
    
    if(!org_exists || org_exists.admin !== user_id){
        res.status(422).json({
            message: "either org does not exist or you aint admin"
        });
        return
    }

    const mem_userexists = await userModel.findOne({
        username : mem_username
    });

    if(!mem_userexists){
        res.status(411).json({
            message : "No user exists with similar username"
        })
        return
    };

    await organisationModel.updateOne({
        _id : org_exists._id
    },{
        "$pullAll": {
             members : mem_userexists._id
        }
    });

    res.json({
        message : "Member deleted"
    });

 })


app.listen(3001)