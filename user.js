var DButilsAzure = require('./DButils');

const jwt = require("jsonwebtoken");

async function Cheak_values(body)
{
   if(body.Username == undefined ||  body.Password == undefined ||body.FirstName == undefined || body.LastName == undefined || body.City == undefined || body.Country == undefined || body.Email == undefined || body.QA == undefined)
      return 400;

   for( i = 0 ; i<body.QA.length ; i++)
   {
      if(body.QA[i].a == undefined || body.QA[i].q  == undefined)
         return 400;
   }
   return 200;
}
module.exports.Cheak_values = Cheak_values;


async function returnError(res, flag){
   if(flag == 400){
      res.status(400).send( {err: "Please try again! The parameters in the body request is not valid!"});
      return false;
   }
   return true;
}


async function LogIn(req, res)
{
   try
   {   
      var secret = "thisIsASecret";
      if(req.body.Username == undefined ||  req.body.Password == undefined ){
         res.status(400).send( {err: "Please send again! the parameters in the body request is bad!"})
         return;
      }
      var sqlRes = await DButilsAzure.execQuery("SELECT * FROM Users WHERE Username = '" + req.body.Username + "'  AND Password = '" + req.body.Password + "'")
      if(sqlRes.length == 0)
         res.status(400).send( {err: "The Username or Password is false, try again"})
      else
      {
         payload = {username: req.body.Username };
         options = { expiresIn: "1d" };
         const token = jwt.sign(payload, secret, options);
         res.status(200).send(token);
      }
   }
   catch(err)
   {
      res.status(400).send(err)
   }
}
module.exports.LogIn = LogIn;



async function signUp(req, res)
{
   try
   {
      var flag = await Cheak_values(req.body)
      if(! await returnError(res, flag)){
         return;
      }
      var sqlRes = await DButilsAzure.execQuery("SELECT * FROM Country WHERE Country = '" + req.body.Country + "'" )
      if(sqlRes.length == 0)
         flag= 400;
      else
         flag= 200;

      if(await returnError(res, flag)==false){
         return;
      }
      sqlRes = await DButilsAzure.execQuery("INSERT INTO Users (Username, Password, FirstName, LastName, City, Country, Email) VALUES ('" + req.body.Username + "','" + req.body.Password + "','" + req.body.FirstName + "','" + req.body.LastName + "','" + req.body.City + "','" + req.body.Country + "','"+ req.body.Email + "')" )
      for(i = 0 ; i<req.body.QA.length ; i++)
      {
		 console.log("INSERT INTO QA (Username, Question, Answer) VALUES ('" + req.body.Username + "','" + req.body.QA[i].q + "','" + req.body.QA[i].a+ "')");
         sqlRes = await DButilsAzure.execQuery("INSERT INTO QA (Username, Question, Answer) VALUES ('" + req.body.Username + "','" + req.body.QA[i].q + "','" + req.body.QA[i].a+ "')" )
      }
      for(i = 0 ; i<req.body.Categories.length ; i++)
      {
         sqlRes = await DButilsAzure.execQuery("INSERT INTO Usercategories (Username, Category) VALUES ('" + req.body.Username + "','" + req.body.Categories[i] + "')" );
      }
      res.status(200).send({err: "The Username is added!"})
   }
   catch(err)
   {
      if(err.number == 2627)
      {
            res.status(400).send({err: "The Username is already exsit , please change your Username!"})
            return;
      }
         res.status(400).send(err)
   }
}
module.exports.signUp = signUp;


async function restorePassword(req, res){
   try{
      if(req.body.Username == undefined ||   req.body.Q == undefined || req.body.A == undefined)
      {
         res.status(400).send( {err: "Please send again! The parameters in the body request are wrong!"});
         return;
      }
      var sqlRes = await DButilsAzure.execQuery("SELECT * FROM QA WHERE Username = '" + req.body.Username + "'  AND Question = '" + req.body.Q +  "'  AND Answer = '" + req.body.A + "'")
      if(sqlRes.length == 0)
      {
         res.status(400).send( {err: " One of the parameters is incorrect, please try again!"});
         return;
      }
      else
      {
         sqlRes = await DButilsAzure.execQuery("SELECT Password FROM Users WHERE Username = '" + sqlRes[0].Username + "'")
         res.status(200).send(sqlRes)
      }
   }
   catch(err){
        res.status(400).send(err)
   }
}
module.exports.restorePassword = restorePassword;


async function getAllCategories(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("SELECT * FROM Categories" )
        res.status(200).send(a);
        
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});

    }
}
module.exports.getAllCategories = getAllCategories;




















