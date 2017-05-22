// Setup basic express server
var mongoOp     =   require("./models/mongo");
var quizzesOp     =   require("./models/quizzes");
var bodyParser  =   require("body-parser");
var topics     =   require("./models/topics");
var Player     =   require("./models/player");
var dbFiller = require('./libs/database-filler.js');
var Games     =   require("./models/games");
var OnlineUsers   =   require("./models/onlineusers");
var GameRequests   =   require("./models/gamerequests");
var GamesAccepted   =   require("./models/gamesaccepted");
var Friend    =   require("./models/friend");
var mongoose    =   require("mongoose");
var express = require('express');
var morgan      =   require('morgan')
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
//var port = process.env.PORT || 3100;
var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
var mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
var mongoURL = 'mongodb://' +mongoHost +':27017/swot';


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3100;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
var nodemailer = require('nodemailer');
var router      =   express.Router();
//mongoose.connect('mongodb://localhost:27017/swot');
mongoose.connect(mongoURL);

// Configure app to use validation system with our config (custom rules)
var expressValidator = require('express-validator');
var evConfig         = require('./libs/express-validator-config.js');
app.use(expressValidator(evConfig));

//Logging
app.use(function(req, res, next) {
res.header('Access-Control-Allow-Credentials', true);
res.header('Access-Control-Allow-Origin', req.headers.origin);
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
if ('OPTIONS' == req.method) {
     res.send(200);
 } else {
     next();
 }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));
app.use(morgan('combined'))
app.use(express.static(__dirname));

//Passport

passport.use(new LocalStrategy(function(username, password, done) {
    Player.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());
app.use('/',router);
//************************************** OZAN 0 BİTİŞ ****************************** 

server.listen(port, function () {
  console.log('Server HIHIHIH listening at port %d', port);
});

var theRoom = { 
             roomId:'heleholo',
             numUsers:0
};

var availableRoomArray;
var availableRoomArray_575e798ca02edd940875a65a = [];
var availableRoomArray_575e79a8a02edd940875a65b = [];
var availableRoomArray_575fe940a02edd940875db89 = [];
var availableRoomArray_5762564aa02edd940876305d = [];

var availableRoomArray_5763f85ca02edd9408766a27 = [];
var availableRoomArray_57678127a02edd940876ec0f = [];
var availableRoomArray_5767b67da02edd940877394e = [];
var availableRoomArray_5768f629a02edd9408774101 = [];
var availableRoomArray_576edfde1a46fbcd0719e0fa = [];
var availableRoomArray_576f8de91a46fbcd071a0b2a = [];
var availableRoomArray_576fface1a46fbcd071a9dff = [];
var availableRoomArray_5770dc681a46fbcd071b5617 = [];

var allRoomsArray = [];
var scoresArray = [];

var x = new Array(10);
for (var i = 0; i < 10; i++) {
      x[i] = new Array(10);
}

//var name = window['a'];

var defaultNsps = '/';

var questions;
var scoresArray;

var selected_products = new Array();

function createScoresArray(){
         scoresArray = [[]];
}
            
var index = 0;

function emptyavailableRoomArray(availableRoomArray){

    if(availableRoomArray[0].numUsers == 3){
        console.log("emptyavailableRoomArray IF İÇİ num of users = " + availableRoomArray[0].numUsers);
        availableRoomArray = [];
        console.log("emptyavailableRoomArray IF İÇİ num of users = " + availableRoomArray.length);
    }
    console.log("emptyavailableRoomArray IF DIŞI num of users = " + availableRoomArray.length);

    return availableRoomArray;
}

function getQuestionsByCategory(categoryId,qnumber, callback){
    console.log("In the getQuestionsByCategory");
    quizzesOp.find({'topic' : categoryId}, function(err, questions) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, questions[0]);
        }
    });
};

function getCategoryByUser(callback)
{
    var userid = "575c214aa02edd940875a3c4";//semih
    topics.find({'createdBy' : userid}, function(err, name) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, name);
        }
    });
};

function isGameExistWusername(username, gamename, categoryid , callback)
{
    Games.find({'username' : username , 'gamename' : gamename , 'categoryid' : categoryid}, function(err, game) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, game);
        }
    });

}

function isGameExist(gamename, categoryid , callback)
{
    Games.find({'gamename' : gamename , 'categoryid' : categoryid}, function(err, game) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, game);
        }
    });

}

function findAllGamesWUsername(username, callback)
{
    Games.find({'username' : username }, function(err, games) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, games);
        }
    });

}

function getUserInfoByName(username, callback)
{
    Player.find({'username' : username}, function(err, userInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, userInfo[0]);
        }
    });
};

function getUserInfoByNameOnlineUserList(username, callback)
{
    OnlineUsers.find({'username' : username}, function(err, userInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, userInfo[0]);
        }
    });
};

function insertOnlineUserList(username , userid , mysocketid)
{
    var newUser = OnlineUsers({
        socketid : mysocketid,
        _id : userid,
        username: username
    });

    newUser.save(function(err)
    {
        if (err) throw err;

        console.log('User ' + username+ ' is created wtih socket id ' + mysocketid);
    });

}

function deleteOnlineUserList(mysocketid)
{
    OnlineUsers.find({ 'socketid':mysocketid }).remove().exec();
    console.log('Socket number ' + mysocketid + ' is removed from list');
}

function insertGameRequest(myinvitingusername , myinvitedusername , mycategoryid, mycategoryname)
{
    var curTimeInSeconds = Math.round(new Date().getTime()/1000);
    var timeoutValue = 3600;

    var newGameRequest = GameRequests({
        invitingusername : myinvitingusername,
        invitedusername : myinvitedusername,
        categoryid: mycategoryid , 
        categoryname : mycategoryname,
        currentTime : curTimeInSeconds,
        timeoutTime : curTimeInSeconds + timeoutValue 
    });

    newGameRequest.save(function(err)
    {
        if (err) throw err;

        console.log('Game request with Inviting User ' + myinvitingusername + ' Invited user ' + myinvitedusername + ' is created for category ' + mycategoryid);
    });

}

function getCategoryInfoByCategoryId(myinvitingusername , myinvitedusername ,mycategoryid, callback)
{
    topics.find({'_id' : mycategoryid}, function(err, categoryInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, categoryInfo[0]);
        }
    });
};

function insertGamesAccepted(myinvitingusername , myinvitedusername , mycategoryid, mycategoryname , questiondata, gamecontentarray)
{

    var newGameRequest = GamesAccepted({
        invitingusername : myinvitingusername,
        invitedusername : myinvitedusername,
        categoryid: mycategoryid,
        categoryname :  mycategoryname,
        questions : questiondata,
        gameContent : gamecontentarray
    });

    newGameRequest.save(function(err)
    {
        if (err) throw err;

        console.log('Accepted Game with Inviting User ' + myinvitingusername + ' Invited user ' + myinvitedusername + ' is created for category ' + mycategoryid);
    });

};


function insertGamesFromGameRequests(iscompleted , mycategoryname ,mycategoryid, myinvitingusername, myinvitedusername ,  mygamecontent, mytimeout)
{

    var newGame = Games({
        completed : iscompleted,
        categoryname :  mycategoryname,
        categoryid: mycategoryid,
        gamename : myinvitingusername,
        username : myinvitingusername,
        gameContent : mygamecontent,
        timeoutTime : mytimeout
    });

    newGame.save(function(err)
    {
        if (err) throw err;

        console.log('New Game inserted');
    });

};




function getGameRequestInfo(myinvitingusername , myinvitedusername , mycategoryid, callback)
{
    GameRequests.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function(err, gamerequestInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, gamerequestInfo[0]);
        }
    });
};

function getGamesAcceptedInfo(myinvitingusername , myinvitedusername , mycategoryid, callback)
{
    GamesAccepted.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function(err, gamerequestInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, gamerequestInfo[0]);
        }
    });
};

function getGameRequestListForUsername(myinvitedusername , callback)
{
    GameRequests.find({'invitedusername' : myinvitedusername}, function(err, requestListForUsername) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, requestListForUsername[0]);
        }
    });
};

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};




function updateQuestıonsGameRequestInfo(myinvitingusername , myinvitedusername , mycategoryid, questiondata)
{
    console.log("updateQuestıonsGameRequestInfo ---- invitingusername ---> " + myinvitingusername + "  invitedusername ---> " + myinvitedusername + "  categoryid ---> " + mycategoryid);
     var ObjectId = require('mongoose').Types.ObjectId;

     myinvitingusername = myinvitingusername.replace(/\s+/g, '');
     myinvitedusername = myinvitedusername.replace(/\s+/g, '');
     

    GameRequests.findOne({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid.toObjectId()},   function (err, myrecord){
        console.log("myrecord " + JSON.stringify(myrecord));
	if (err) 
        {
	    return console.log("error: " + err);
	}

	if(myrecord === null || myrecord === undefined)
	{
	    console.log("The record doesnt exists or I couldn't find it......");
	}
	else
	{
		
		console.log("UPDATEQUESTIONSGAMEONFOOOOO **********  " + JSON.stringify(questiondata));
		myrecord.questions = questiondata;
		myrecord.save();
		console.log("Server.js updateQuestıonsGameRequestInfo questions are updated....");
	}


    });


};

function updateAcceptedGameScoreInfo(myinvitingusername , myinvitedusername , mycategoryid, myupdateusername, score)
{
    GamesAccepted.findOne({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function (err, doc){
        console.log("updateAcceptedGameScoreInfo **********  ");

        for(i = 0 ; i < doc.gameContent.length ; i++)
        {
            if(doc.gameContent[i].usernameInfo === myupdateusername)
            {
                doc.gameContent[i].scoreInfo = score;
                doc.save();
                break;
            }
        }

        console.log("Score is updated....");
    });
};

function getAcceptedGameScoreInfoByUsername(myinvitingusername , myinvitedusername , mycategoryid, myupdateusername, callback)
{
    GamesAccepted.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data[0]);
        }
    });
};

function deleteGameRequestInfo(myinvitingusername , myinvitedusername , mycategoryid, questiondata)
{
    GameRequests.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}).remove().exec();
    console.log('Requested GameRequestInfo is removed from list');
};

function deleteTimeoutGames(mycurrenttimeinseconds)
{
    Games.find({'timeoutTime' : { $lte : mycurrenttimeinseconds , $ne: null}}).remove().exec();
    console.log('Requested GameRequestInfo is removed from list');
};

// Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }
    return newArray;
}

/* Creates an array of random integers between the range specified
 len = length of the array you want to generate
 min = min value you require
 max = max value you require
 unique = whether you want unique or not (assume 'true' for this answer)
 */
function _arrayRandom(len, min, max, unique) {
    var len = (len) ? len : 10,
        min = (min !== undefined) ? min : 1,
        max = (max !== undefined) ? max : 100,
        unique = (unique) ? unique : false,
        toReturn = [], tempObj = {}, i = 0;

    if(unique === true) {
        for(; i < len; i++) {
            var randomInt = Math.floor(Math.random() * ((max - min) + min));
            if(tempObj['key_'+ randomInt] === undefined) {
                tempObj['key_'+ randomInt] = randomInt;
                toReturn.push(randomInt);
            } else {
                i--;
            }
        }
    } else {
        for(; i < len; i++) {
            toReturn.push(Math.floor(Math.random() * ((max - min) + min)));
        }invitedusername
    }
   return toReturn;
}

function getRoomId(availableRoomArray){
    return availableRoomArray[0].roomId;
}

function getQuestions()
{
    // Return a random number between 1 and 2:
    var res = Math.floor((Math.random() * 2) + 1);
    console.log("getCurrentQuestions içi res = " + res);

    if(res==1)
      return jsonObj;
    else
      return jsonObj2;  
}


function sortScoresArray(arrToSort){

//      arrayToClient = sortScoresArray(scoresArray[i]);


    console.log("Array to be sorted 0 = " + arrToSort);
    //arrayToSort = arrToSort.shift(); // arrayin ilk elemanını siliyoruz.

   // console.log("Array to be sorted 1 = " + arrToSort[0].scoreInfo + " " + arrToSort[1].scoreInfo + " " + arrToSort[2].scoreInfo);

    // sort by value
  /*  arrToSort.sort(function (a, b) {
        if ((a).scoreInfo > (b).scoreInfo) {        
            console.log("Sort İÇİ İF İÇİ a.scoreInfo = " + a.scoreInfo + " b.scoreInfo = " + b.scoreInfo);           
            return -1;
        }
        if ((a).scoreInfo < (b).scoreInfo) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });  */
    
    arrToSort.sort(function (b, a) {
        var n = a.scoreInfo - b.scoreInfo;
        console.log("sortScoresArray Function içi n = " +n);
        if (n !== 0) {
            return n;
        }
        console.log("sortScoresArray Function içi b.finalTime - a.finalTime = " + (b.finalTime - a.finalTime));
        
        return b.finalTime - a.finalTime;
        });    
   
    for ( i = 1; i < arrToSort.length; i++ ){ 
        console.log( 'value number score = ' + arrToSort[i].scoreInfo + " finalTime = " +
         arrToSort[i].finalTime );
    }
  //  console.log("Sorted Array = " + arrToSort[0].scoreInfo + " " + arrToSort[1].scoreInfo + " " + arrToSort[2].scoreInfo);

    return arrToSort;

}

function handleScoreOnQuestions(socket, socketEntity, categoryId){
      console.log("HANDLESCORE İÇİ socketEntity.username = " + socketEntity.username + " categoryId = " + categoryId);
     
       if(categoryId == '575e798ca02edd940875a65a')
             availableRoomArray = availableRoomArray_575e798ca02edd940875a65a;
       else if(categoryId == '575e79a8a02edd940875a65b')
             availableRoomArray = availableRoomArray_575e79a8a02edd940875a65b;  
       else if(categoryId == '575fe940a02edd940875db89')
             availableRoomArray = availableRoomArray_575fe940a02edd940875db89;             
        else if(categoryId == '5762564aa02edd940876305d')
             availableRoomArray = availableRoomArray_5762564aa02edd940876305d;                                    
       else if(categoryId == '5763f85ca02edd9408766a27')
             availableRoomArray = availableRoomArray_5763f85ca02edd9408766a27;
       else if(categoryId == '57678127a02edd940876ec0f')
             availableRoomArray = availableRoomArray_57678127a02edd940876ec0f;        
       else if(categoryId == '5767b67da02edd940877394e')
             availableRoomArray = availableRoomArray_5767b67da02edd940877394e;
       else if(categoryId == '5768f629a02edd9408774101')
             availableRoomArray = availableRoomArray_5768f629a02edd9408774101;
       else if(categoryId == '576edfde1a46fbcd0719e0fa')
             availableRoomArray = availableRoomArray_576edfde1a46fbcd0719e0fa;
       else if(categoryId == '576f8de91a46fbcd071a0b2a')
             availableRoomArray = availableRoomArray_576f8de91a46fbcd071a0b2a;
       else if(categoryId == '576fface1a46fbcd071a9dff')
             availableRoomArray = availableRoomArray_576fface1a46fbcd071a9dff;
       else if(categoryId == '5770dc681a46fbcd071b5617')
             availableRoomArray = availableRoomArray_5770dc681a46fbcd071b5617;  

        console.log("HANDLESCORE İÇİ availableRoomArray.length  = " + availableRoomArray.length);
        console.log("HANDLESCORE İÇİ availableRoomArray.length  = " + availableRoomArray[0] +
        " " + availableRoomArray[1]);
                        
        if(availableRoomArray.length == 0 ){ // There is NOT any availble room so yeni room yarat

            console.log("There is NOT any availble room " + socketEntity.username);
            
            var theRoom = { 
                roomId:socketEntity.username, // Burdaki roomid sadece username olmamalı çünkü aynı user birden fazla yarışma açabilir.
                                         // Dolayısıyla roomid nin unique olması için client tarafından username yanında o andaki time ile gelmeli.
                numUsers:0
            }
             socket.join(theRoom.roomId);
             theRoom.numUsers++;
             connectionIndx = theRoom.numUsers;

             availableRoomArray.push(theRoom);

           // console.log("socket.on(QUESTIONS) içi 0 " + " scoresArray.length = " +scoresArray.length + " index = " + index);
             
             scoresArray[index][0] = theRoom.roomId;   // ilk kolonu yani roomId kolonunu oluşturyoruz
             index++;
             scoresArray.push([]);

           // console.log("socket.on(QUESTIONS) içi 1" + " " +scoresArray[0][0]);

            var categoryNumber = socketEntity.categoryId;
            console.log("CATEGORY ID   ********** " + categoryNumber );
            var qNumber = 5;
            var response = {};
            getQuestionsByCategory(categoryNumber, qNumber, function(err, data) {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any record"};
            }
            else if(data != null && (qNumber > 0))
            {
                var allQuestions = (data._doc).questions;
                var numQuestions = (data._doc.questions).length;
                var rndquestnumbers = new Array(qNumber);
                var questionData = new Array(qNumber);
                rndquestnumbers = _arrayRandom(qNumber, 0, numQuestions, true);
                for (var i = 0; i < qNumber; i++)
                {
                    if(allQuestions != null && (qNumber <= numQuestions))
                    {
                        questionData[i] = allQuestions[rndquestnumbers[i]]._doc;
                        response = {"error" : false,"message" : questionData};
                    }
                    else
                    {
                        response = {"error" : true,"message" : "Opps some parameter is wrong"};
                    }
                }
            }
            else
            {
                response = {"error" : true,"message" : "There is not any response"};
            }
                console.log(response);
				console.log("questions emitten once");
				console.log("***********************SORULAR**********************");
				console.log(questionData);
                console.log("***********************ROOM ID**********************");
				console.log(socketEntity);
                console.log("***********************CONNECTION INDEX**********************");
				console.log(connectionIndx);
	
                questionsToSent = questionData;
                availableRoomArray[1] = (questionsToSent);	
                  io.to(theRoom.roomId).emit(categoryId, {
                      questions: questionData,
                      theRoomId: socketEntity.username,
                      connectionIndex: connectionIndx 
                });          
        });             
              function getCurrentQuestions(){
                    return questionsToSent;
              }

            console.log("theRoom.roomId = " + theRoom.roomId  );
            console.log("Num of Users = " + theRoom.numUsers );
         }
        
        else {   // socketEntity.username !== theRoom.roomId ---> Kullanıcının kendi açtığı odaya 2. kere girmesini önlemek için               
        
          console.log("CATEGORY ID  ELSE !!!++ ********** " + categoryId );
          
          console.log("There is availble room " + socketEntity);

          roomId = getRoomId(availableRoomArray);
          socket.join(roomId);
          console.log("There is availble room, room id is = " + roomId);

          availableRoomArray[0].numUsers++;
          connectionIndx = availableRoomArray[0].numUsers;
          
            console.log("Shows all the rooms " + io.sockets.adapter.rooms);
            console.log("Num of Users 2 = " + availableRoomArray[0].numUsers);
            console.log("theRoom.roomId 2 = " + availableRoomArray[0].roomId);

        //  var currentQuestions = getCurrentQuestions();
          currentQuestions = availableRoomArray[1];
          console.log("ELSE CURRENT QUESTIONS = " + availableRoomArray[1]);

          io.to(roomId).emit(categoryId, {
                 questions: currentQuestions,
                 theRoomId: roomId,
                 connectionIndex: connectionIndx 
          });   
          
         if(availableRoomArray[0].numUsers == 3){
                availableRoomArray.pop();
                availableRoomArray.pop();

            }

         // availableRoomArray = emptyavailableRoomArray(availableRoomArray);
          console.log("There is availble room  = " + availableRoomArray.length);
            
        }
}

//*************************************** OZAN 1 START ***********************************

//Register
router.route("/user/register")
    .post(function (req, res) {
        var user = new Player({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
		
		console.log("USERNAME  ---> "  +  req.body.username);

        user.save(function (err) {
            if (err) {
                if (err.errmsg.match(/username_1/)) {
                    return res.json({ err_code: 1, message: "username already exists" });
                }
                if (err.errmsg.match(/email_1/)) {
                    return res.json({ err_code: 2, message: "email already registered" });
                }
                return res.json({ err_code: err.code, message: err.errmsg });
            } else {
                req.logIn(user, function (err) {
                    res.json({ err_code: 0, message: "signup success" });
                });
            }
        });
      })

//Login
router.route("/user/login")
    .post(function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) return next(err)
            if (!user) {
                return res.json({ err_code: 1, message: "wrong password or username" })
            }
            req.logIn(user, function (err) {
                if (err) return next(err);
				console.log("SUCCES LOGIN");
                return res.json({ err_code: 0, message: "login success" });
            });
        })(req, res, next);
    })

//Logout
router.route("/user/logout")
    .post(function (req, res) {
        req.logout();
        res.json({ err_code: 0, message: "logout success" });
    })

router.route("/friendship/create")
    .post(function (req, res) {
  // Validation rules
  req.checkBody('uid1', 'param required').notEmpty();
  req.checkBody('uid2', 'param required').notEmpty();
  //req.checkBody('uid1', 'uid1 has to be a non-negative Integer').isUID();
  //req.checkBody('uid2', 'uid2 has to be a non-negative Integer').isUID();
  req.checkBody('uid1', 'uid1 cannot be equal to uid2').notEqual(req.body.uid2);
  
  // Validate
  const errors = req.validationErrors();

  if(errors){
    // Send "422: Unprocessable Entity" with errors
    res.status(422).json(errors);
  }else{
    Friend.addFriendship(req.body.uid1, req.body.uid2, req.body.username1, req.body.username2, (r) => {
      if(r){
        // Send "204: No Content"
        res.status(200).send({"error" : false,"message" : "FriendshipCreated"});
      }else{
        // Send "500: Internal Server Error"
        res.status(500).send("Internal Server Error");
      }
    });
  }
})

router.route("/friendship/delete/:id/:username/:friendname")
    .delete(function (req, res) {
  // Validation rules
  req.checkParams('id', 'Id must be formated as: UID1 + "-" + UID2').isProperDeleteId();
  
  // Validate
  const errors = req.validationErrors();

  if(errors){
    // Send "422: Unprocessable Entity" with errors
    res.status(422).json(errors);
  }else{
    // Get user id's from :id param
    const UIDs = req.params.id.split('-');
    const friendname = req.params.friendname;
	const username = req.params.username;
    Friend.deleteFriendship(UIDs[0], UIDs[1], username, friendname, (r) => {
      if(r.result){
        // Send "204: No Content"
        res.status(204).send();
      }else{
        // Send "500: Internal Server Error"
        res.status(500).send();
      }
    });
  }
})

router.route("/friendlist/:id")
    .get(function (req, res) {
  // Validation rules
  //req.checkParams('id', 'Id must be a non-negative Integer').isUID();

  // Validate
  //const errors = req.validationErrors();

  //if(errors){
    // Send "422: Unprocessable Entity" with errors
  //  res.status(422).json(errors);
  //}else{
    // Find user in DB
    Friend.findById(req.params.id, (response) => {
      let friendlist = [];

      if(response.user !== null){
        friendlist = response.user.friendlist;
      }

      // Send "200: OK" with friendlist in JSON format
      res.status(200).json(friendlist);
    });
 // }
})

router.route("/friendlist/search/:id")
    .get(function (req, res) {
  // Validation rules
  //req.checkParams('id', 'Id must be a non-negative Integer').isUID();

  // Validate
  //const errors = req.validationErrors();
  var friendUsername = req.params.id;
  //if(errors){
    // Send "422: Unprocessable Entity" with errors
    //res.status(422).json(errors);
  //}else{

    // Find user in DB
	Player.find({'username': friendUsername }, function (err, data) {  
	    if (err) 
            {
		res.status(500).send(err)
	    } 
            else 
            {
		res.send(data);
	    }
	});

  //}
})

router.route("/friendlist/getlist/:id")
    .get(function (req, res) {

  var friendUserId = req.params.id;

    // Find user in DB
	Friend.findFriends(friendUserId, (response) => {
      var friendlist = {};

      if(response.user !== null){
        friendlist = response.user;
      }

      // Send "200: OK" with friendlist in JSON format
      res.status(200).json(friendlist);
    });

})

router.route("/testing/fillDB/sample")
    .get(function (req, res) {
  dbFiller.clearCollection(() => {
    dbFiller.sampleData(() => {
      res.status(200).json({
        users: 5,
        connections: 2,
      });
    });
  });
})


router.route("/gamerequest/accept/:invitingusr/:invitedusr/:categoryid")
    .get(function (req, res) {

  var invitingusername = req.params.invitingusr;
  var invitedusername = req.params.invitedusr;
  var gamereqcategoryid = req.params.categoryid;
   var gameContentArray = [];
    var infoForRankings1 = { socketInfo: invitingusername,
                            scoreInfo: 0,
                            usernameInfo: invitingusername,
                            connectionIndex: 99}

    var infoForRankings2 = { socketInfo: invitingusername,
                            scoreInfo: 0,
                            usernameInfo: invitedusername,
                            connectionIndex: 100} 

     gameContentArray.push(infoForRankings1); 
     gameContentArray.push(infoForRankings2);                                             

    getGameRequestInfo(invitingusername , invitedusername, gamereqcategoryid, function(err, data) 
    {
        if (err)
        {
            console.log(err);
            response = {"error" : true,"message" : "There is not any gamerequest record"};
        }
        else if(data != null)
        {

            console.log('/gamerequest/accept/:invitingusr/:invitedusr/:categoryid');
            deleteGameRequestInfo(invitingusername , invitedusername, gamereqcategoryid);
            insertGamesAccepted(invitingusername , invitedusername, gamereqcategoryid, data.categoryname , data.questions , gameContentArray);
            insertGamesFromGameRequests(0 , data.categoryname ,gamereqcategoryid, invitingusername, invitedusername ,  gameContentArray , data.timeoutTime)
            
             res.status(200).json(data.questions);
        }
        else if(data == null)
        {
            console.log('No game request exists.... ');
            res.status(500).json("NULL DATA...");
        }

    });

})


router.route("/game/updatescore/:invitingusr/:invitedusr/:categoryid/:usernameupdated/:score")
    .get(function (req, res) {

        var invitingusername = req.params.invitingusr;
        var invitedusername = req.params.invitedusr;
        var gamereqcategoryid = req.params.categoryid;
        var usernameupdated = req.params.usernameupdated;
        var score = req.params.score;

        console.log("Updating Score");

       updateAcceptedGameScoreInfo(invitingusername , invitedusername, gamereqcategoryid, usernameupdated , score);


})

router.route("/game/getscore/:invitingusr/:invitedusr/:categoryid/:usernameupdated")
    .get(function (req, res) {

        var invitingusername = req.params.invitingusr;
        var invitedusername = req.params.invitedusr;
        var gamereqcategoryid = req.params.categoryid;
        var usernameupdated = req.params.usernameupdated;
        var getscore = 0;

        console.log("Getting Requested Score");

        getAcceptedGameScoreInfoByUsername(invitingusername , invitedusername , gamereqcategoryid, usernameupdated, function(err, data) 
        {
                for(i = 0 ; i < data.gameContent.length ; i++)
                {
                    if(data.gameContent[i].usernameInfo === usernameupdated)
                    {
                        getscore = data.gameContent[i].scoreInfo;
                        res.status(200).json(getscore);
                        break;
                    }
                }
        });


})




 
router.route("/gamerequest/decline/:invitingusr/:invitedusr/:categoryid")
    .get(function (req, res) {

  var invitingusername = req.params.invitingusr;
  var invitedusername = req.params.invitedusr;
  var gamereqcategoryid = req.params.categoryid;

  deleteGameRequestInfo(invitingusername , invitedusername, gamereqcategoryid);
  res.status(200).json({"error" : false,"message" : "Succesfully Removed"});
})

router.route("/gamerequest/list/:invitedusr")
    .get(function (req, res) {

        var invitedusername = req.params.invitedusr;
        getGameRequestListForUsername(invitedusername , function(err, data)
        {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data != null)
            {

                console.log('/gamerequest/list/:invitedusr');
                res.status(200).json(data);
            }
            else if(data == null)
            {
                console.log('No game request exists.... ');
                res.status(500).json({"error" : true,"message" : "There is not any gamerequest record"});
            }

        });

    })


io.on('connection', function (socket) {

    console.log('a user connected with socket id ' + socket.id);

    if(scoresArray.length==0)
      createScoresArray();

    var addedUser = false;

    socket.on('disconnect', function(mysocket)
    {
        deleteOnlineUserList(socket.id);
        console.log(socket.id + ' is Disconnected');

        
    });

    socket.on('updateOnlineUserList', function(mysocket)
    {
        console.log('updateOnlineUserList INSERTING USER TO THE ONLINE USER LIST WITH USERNAME ' + mysocket.username);
        getUserInfoByName(mysocket.username, function(err, data) {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any record"};
            }
            else if(data != null)
            {

                console.log('insertOnlineUserList Username: ' + data.username + ' Id: ' + data._id);
                insertOnlineUserList(data.username , data._id , socket.id);
            }

    });
    });

     socket.on('findUserOnlineUserlist', function(mysocket)
     {
         console.log('INVITED USERNAME IS ' + mysocket.invitedusername);

         getUserInfoByNameOnlineUserList(mysocket.invitedusername, function(err, data) {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any record"};
            }
            else if(data != null)
            {

                console.log('findUserOnlineUserlist ');
                io.emit('findUserOnlineUserlist', {
                      onlineuserinfo: data
                });
            }

    });

     });

    socket.on('get1to1challengeinvitinguserquestion', function(mysocket)
     {
         console.log('get1to1challengeinvitinguserquestion function is entered');
         getGamesAcceptedInfo(mysocket.invitingusername , mysocket.invitedusername , mysocket.categoryid , function(err, data)
         {
             console.log('get1to1challengeinvitinguserquestion QUESTIONS to sent --->' + JSON.stringify(data.questions));
             socket.emit('1to1challengesendquestions', data.questions);
         });


 
     });

    socket.on('inviteGame', function(mysocket)
     {
         console.log('inviteGame function is entered');

          //io.sockets.connected[mysocket.invitedsocketid].emit("showinvitebox" , {'invitedusername': mysocket.invitingusername , 'invitedsocketid': data.onlineuserinfo.invitingsocketid});
 
     });

    socket.on('gamerequest', function(mysocket)
    {
        console.log('Server.js  gamerequest function is entered with parameters ' + mysocket.invitingusername + '  ' + mysocket.invitedusername +  '  ' + mysocket.categoryid);

        getGameRequestInfo(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid, function(err, data) {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data == null)
            {
                getCategoryInfoByCategoryId(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid, function(err, data) {

                        console.log('insertGameRequest ');
                        console.log('Category name ---> ' + data.name);
                        insertGameRequest(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid, data.name);

                });

            }
            else if(data != null)
            {
                console.log('There is an existing invitation ');
            }

        });

        console.log("After inserting game request info");
        var qNumber = 10;
        getQuestionsByCategory(mysocket.categoryid, qNumber, function(err, data) {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any record"};
            }
            else if(data != null && (qNumber > 0))
            {
                console.log("****************** GETTING QUESTIONS ********************")
                var allQuestions = (data._doc).questions;
                var numQuestions = (data._doc.questions).length;
                var rndquestnumbers = new Array(qNumber);
                var questionData = new Array(qNumber);
                rndquestnumbers = _arrayRandom(qNumber, 0, numQuestions, true);
                for (var i = 0; i < qNumber; i++)
                {
                    if(allQuestions != null && (qNumber <= numQuestions))
                    {
                        questionData[i] = allQuestions[rndquestnumbers[i]]._doc;
                        response = {"error" : false,"message" : questionData};

                    }
                    else
                    {
                        response = {"error" : true,"message" : "Opps some parameter is wrong"};
                    }
                }

                console.log("BEFORE ENTERING updateQuestıonsGameRequestInfo QUESTIONS ARE ************* " + JSON.stringify(questionData) );

                //console.log("Waiting 3 seconds");
		//var waitTill = new Date(new Date().getTime() + 3 * 1000);
		//while(waitTill > new Date()){}

                updateQuestıonsGameRequestInfo(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid , questionData);
                

            }
            else
            {
                console.log("Data is null")
            }


         });
    });

     socket.on('allCategories', function(mysocket)
     {
         //console.log('SERVER PART USERNAME ' + mysocket.username);
          getCategoryByUser(function(err, data) 
          {
              console.log(JSON.stringify(data));
              io.emit('allCategories', {
                      allCategories: data,
                      image : "https://snap-photos.s3.amazonaws.com/img-thumbs/280h/GFIZG3CMEB.jpg"
              });
          });
     });

//*********************************************************************************************************************

    socket.on('575e798ca02edd940875a65a', function(socketEntity){
        handleScoreOnQuestions(socket, socketEntity,'575e798ca02edd940875a65a');
    });
    socket.on('575e79a8a02edd940875a65b', function(socketEntity){
        handleScoreOnQuestions(socket, socketEntity,'575e79a8a02edd940875a65b');
    });
    socket.on('575fe940a02edd940875db89', function(socketEntity){
        handleScoreOnQuestions(socket, socketEntity,'575fe940a02edd940875db89');    
    });
    socket.on('5762564aa02edd940876305d', function(socketEntity){
        handleScoreOnQuestions(socket, socketEntity,'5762564aa02edd940876305d');    
    });
    socket.on('5763f85ca02edd9408766a27', function(socketEntity){
        handleScoreOnQuestions(socket, socketEntity,'5763f85ca02edd9408766a27');    
    });
    socket.on('57678127a02edd940876ec0f', function(socketEntity){         
        handleScoreOnQuestions(socket, socketEntity,'57678127a02edd940876ec0f');        
    });
    socket.on('5767b67da02edd940877394e', function(socketEntity){       
        handleScoreOnQuestions(socket, socketEntity,'5767b67da02edd940877394e');
    });
    socket.on('5768f629a02edd9408774101', function(socketEntity){       
        handleScoreOnQuestions(socket, socketEntity,'5768f629a02edd9408774101');       
    });
    socket.on('576edfde1a46fbcd0719e0fa', function(socketEntity){       
        handleScoreOnQuestions(socket, socketEntity,'576edfde1a46fbcd0719e0fa');        
    });
    socket.on('576f8de91a46fbcd071a0b2a', function(socketEntity){        
        handleScoreOnQuestions(socket, socketEntity,'576f8de91a46fbcd071a0b2a');
    });
    socket.on('576fface1a46fbcd071a9dff', function(socketEntity){       
        handleScoreOnQuestions(socket, socketEntity,'576fface1a46fbcd071a9dff');    
    });       
    socket.on('5770dc681a46fbcd071b5617', function(socketEntity){        
        handleScoreOnQuestions(socket, socketEntity,'5770dc681a46fbcd071b5617');   
    });



//*********************************************************************************************************************
//*********************************************************************************************************************
//*********************************************************************************************************************
//*********************************************************************************************************************
//*********************************************************************************************************************


    socket.on('score', function(info){

        //    if(scoresArray.length==0 || scoresArray[99][99]!== 'undefined'){
            if(scoresArray.length == 100){
          
                console.log(" socket.on(score) içi -2 " + scoresArray.length + " " + scoresArray[99][99]);
                createScoresArray();
            }             
            var infoForRankings = { socketInfo: info.socketConnectedTo,
                                      scoreInfo: info.score,
                                      usernameInfo: info.username,
                                      categoryname: info.categoryname,
                                      connectionIndex: info.connectionIndex,
                                      categoryId: info.categoryId,
                                      finalTime: info.finalTime }

            console.log("socket.on(score) içi -1 " + " length = " + scoresArray.length + 
            " info.socketConnectedTo = " + info.socketConnectedTo);

          console.log("CATEGORY ID SERVER ---->>>> " + info.categoryid );
          console.log("CATEGORY NAME SERVER ----->>>>> " + info.categoryname );

            for( var i = 0, len = scoresArray.length; i < len; i++ ) {

                  if( scoresArray[i][0] === info.socketConnectedTo ) {
                     
                      console.log("for içi IF İÇİ infoForRankings.connectionIndex 0 = " 
                      + infoForRankings.connectionIndex); 
                      
                      console.log("for içi IF İÇİ scoresArray[i].length 1 = " 
                                    + scoresArray[i].length + " *** İ = " + i 
                                    + " scoresArray[i] BEFORE push = " + scoresArray[i]);

                 //     scoresArray[i][infoForRankings.connectionIndex] = (infoForRankings);
                      scoresArray[i].push(infoForRankings);

                     console.log("scoresArray[i] AFTER push = " + scoresArray[i]);
                     console.log("scoresArray[i] AFTER shift = " + scoresArray[i].shift);
                     
                     arrayToClient = sortScoresArray(scoresArray[i]);
                          
                      var scoresArrayJson = JSON.stringify(arrayToClient);


///////////////////////////////////////////////// OZAN 2 START /////////////////////////////////////////////////
                      
                      console.log("UNCOMPLETED GAME");
                      console.log("***********************UNCOMPLETED GAME SCORES ARRAY JSON **************************");
                      console.log(scoresArrayJson);
                      console.log("***********************UNCOMPLETED GAME NORMAL SCORES ARRAY **************************");
                      console.log(scoresArray[0][1]);
                      console.log("***********************UNCOMPLETED GAME NORMAL SCORES ARRAY FINISH **************************");

                      var newGame = new Games();
                      var gameContentArray = [];
                      var tmpgameContentArray = [];

                      isGameExistWusername(info.username , info.socketConnectedTo , info.categoryid , function(err , game)
                      {
                          console.log("info.username ---> " + info.username );
                          console.log("info.socketConnectedTo ---> " + info.socketConnectedTo);
                          console.log("info.categoryid ----> " + info.categoryid);
                          console.log("info.categoryNAME ----> " + info.categoryname);
                          

                          if(game.length === 0)
                          {
                              console.log("GAME DOES NOT EXIST");

                              for(var ind = 0 ; ind < (scoresArray[i].length - 1) ; ind++)
                              {
                                  console.log("ARRAY LENGTH " + ind);
                                  console.log("scoresArray[i][ind + 1]" + JSON.stringify(scoresArray[i][ind + 1]));
                                  if((info.categoryid) === (scoresArray[i][ind + 1].categoryid))
                                  {
                                      tmpgameContentArray[ind] = scoresArray[i][ind + 1];
                                  }

                              }
                            //  gameContentArray = cleanArray(tmpgameContentArray);
                              gameContentArray = tmpgameContentArray;

            
                          console.log("tmpgameContentArray  --->" + JSON.stringify(tmpgameContentArray));
                              console.log("gameContentArray  --->" + JSON.stringify(gameContentArray));

                              //newGame.gameId = i;
                              newGame.username = info.username;
                              newGame.gamename = info.socketConnectedTo;
                              newGame.categoryid = info.categoryid;
                              newGame.categoryname = info.categoryname;
                              if(scoresArray[i].length == 4)
                              {
                                  newGame.completed = 1;
                              }
                              else
                              {
                                  newGame.completed = 0;
                              }

                              newGame.gameContent = gameContentArray;
//////OZAN 11032017
                            var curTimeInSeconds = Math.round(new Date().getTime()/1000);
                            var timeoutValue = 3600;

                             newGame.timeoutTime = curTimeInSeconds + timeoutValue;


////////OZAN 11032017



                              console.log("newGame START"); 
                              console.log(newGame);
                              console.log("newGame END");
                              // save the user
                              newGame.save(function(err) {
                                  if (err)
                                  {
                                      console.log(err);
                                      throw err;
                                  }

                                  console.log('Score Array INSERTED');
                              });

                              isGameExist(info.socketConnectedTo , info.categoryid , function(err, tmpgame){

                                  console.log("GAME NAME  ---> " + info.socketConnectedTo);
                                  console.log("CATEGORY  ----> " + info.categoryid);

                                  if(tmpgame.length > 0)
                                  {
                                      console.log("Other Users exist ---> " + tmpgame.length);
                                      for(var tmpindex = 0 ; tmpindex < tmpgame.length ; tmpindex++)
                                      {
                                          tmpgame[tmpindex].gameContent = gameContentArray;
                                          tmpgame[tmpindex].save();
                                      }
                                  }
                                  else
                                  {
                                      console.log("Other Users DOESNT EXIST ---> " + tmpgame.length);
                                  }

                              });
                          }
                          else
                          {
                              console.log("GAME  EXISTS");

/*
                              for(var ind = 0 ; ind < (scoresArray[i].length - 1) ; ind++)
                              {
                                  console.log("ARRAY LENGTH " + ind);
                                  console.log("scoresArray[i][ind + 1]" + JSON.stringify(scoresArray[i][ind + 1]));
                                  if((info.categoryid) === (scoresArray[i][ind + 1].categoryid))
                                  {
                                      tmpgameContentArray[ind] = scoresArray[i][ind + 1];
                                  }

                              }
                              gameContentArray = cleanArray(tmpgameContentArray);

                              game[0].gameContent = gameContentArray;
                              game[0].save();

                              console.log('Record Updated...');
*/

                          }
                      });

/*

                      isGameExist(info.socketConnectedTo , info.categoryid , function(err , game)
                      {
                          console.log("info.username ---> " + info.username );
                          console.log("info.socketConnectedTo ---> " + info.socketConnectedTo);
                          console.log("info.categoryid ----> " + info.categoryid);

                          if(game.length === 0)
                          {
                              console.log("GAME DOES NOT EXIST");

                              for(var ind = 0 ; ind < (scoresArray[i].length - 1) ; ind++)
                              {
                                  console.log("ARRAY LENGTH " + ind);
                                  console.log("scoresArray[i][ind + 1]" + JSON.stringify(scoresArray[i][ind + 1]));
                                  if((info.categoryid) === (scoresArray[i][ind + 1].categoryid))
                                  {
                                      tmpgameContentArray[ind] = scoresArray[i][ind + 1];
                                  }

                              }
                              gameContentArray = cleanArray(tmpgameContentArray);

/!*                              if(scoresArray[i].length === 2)
                              {
                                  console.log("ARRAY LENGTH 2");
                                  gameContentArray=  [scoresArray[i][1]];
                              }
                              else if(scoresArray[i].length === 3)
                              {
                                  console.log("ARRAY LENGTH 3");
                                  gameContentArray=  [scoresArray[i][1], scoresArray[i][2]];
                              }*!/

                              console.log("tmpgameContentArray  --->" + JSON.stringify(tmpgameContentArray));
                              console.log("gameContentArray  --->" + JSON.stringify(gameContentArray));

                              //newGame.gameId = i;
                              //newGame.username = info.username;
                              newGame.gamename = info.socketConnectedTo;
                              newGame.categoryid = info.categoryid;
                              newGame.categoryname = info.categoryname;
                              newGame.gameContent = gameContentArray;
                              console.log("newGame START");
                              console.log(newGame);
                              console.log("newGame END");
                              // save the user
                              newGame.save(function(err) {
                                  if (err)
                                  {
                                      console.log(err);
                                      throw err;
                                  }

                                  console.log('Score Array INSERTED');
                              });
                          }
                          else
                          {
                              console.log("GAME  EXISTS");

                              for(var ind = 0 ; ind < (scoresArray[i].length - 1) ; ind++)
                              {
                                  console.log("ARRAY LENGTH " + ind);
                                  console.log("scoresArray[i][ind + 1]" + JSON.stringify(scoresArray[i][ind + 1]));
                                  if((info.categoryid) === (scoresArray[i][ind + 1].cattmpgame.lengthegoryid))
                                  {
                                      tmpgameContentArray[ind] = scoresArray[i][ind + 1];
                                  }

                              }
                              gameContentArray = cleanArray(tmpgameContentArray);

                              game[0].gameContent = gameContentArray;
                              game[0].save();

                                  console.log('Record Updated...');

                          }

                      });

*/
/*
                      if(scoresArray[i].length === 2)
                      {
                          console.log("ARRAY LENGTH 2");
                          gameContentArray=  [scoresArray[i][1]];
                      }
                      else if(scoresArray[i].length === 3)
                      {
                          console.log("ARRAY LENGTH 3");
                          gameContentArray=  [scoresArray[i][1], scoresArray[i][2]];
                      }

                      //newGame.gameId = i;
                      newGame.username = info.username;
                      newGame.gamename = info.socketConnectedTo;
                      newGame.categoryid = info.categoryid;
                      newGame.categoryname = info.categoryname;
                      newGame.gameContent = gameContentArray;
                      console.log("newGame START");
                      console.log(newGame);
                      console.log("newGame END");
                      // save the user
                      newGame.save(function(err) {
                          if (err)
                          {
                              console.log(err);
                              throw err;
                          }

                          console.log('Score Array INSERTED');
                      });
*/


                      /////////////////////////////OZan//////////////


                      io.to(infoForRankings.socketInfo).emit('score', {
                                scoresArray: scoresArrayJson
                      });

                      console.log("for içi IF İÇİ scoresArray[i].length 2 = " 
                      + scoresArray[i].length + " *** İ = " + i);
                      

                      if(scoresArray[i].length == 4){ // 4 olmasının nedeni 
                          // başta(scoresArray[0]) bi de username olması. Buraya bi de || koyup yarışmanın zaman sınırı doldugunda emit et de

                         console.log("for içi IF İÇİ infoForRankings.socketInfo = " 
                         + infoForRankings.socketInfo);

                          arrayToClient = sortScoresArray(scoresArray[i]);
                          
                          var scoresArrayJson = JSON.stringify(arrayToClient);

///////////////////////////////////////////////// OZAN 3 START /////////////////////////////////////////////////

                          isGameExist(info.socketConnectedTo , info.categoryid , function(err, tmpgame){

                              console.log("COMPLETED GAME NAME  ---> " + info.socketConnectedTo);
                              console.log("COMPLETED CATEGORY  ----> " + info.categoryid);

                              if(tmpgame.length > 0)
                              {
                                  console.log("Other Users exist ---> " + tmpgame.length);
                                  for(var tmpindex = 0 ; tmpindex < tmpgame.length ; tmpindex++)
                                  {
                                      tmpgame[tmpindex].completed = 1;
                                      tmpgame[tmpindex].save();
                                  }
                              }
                              else
                              {
                                  console.log("Other Users DOESNT EXIST ---> " + tmpgame.length);
                              }

                          });

///////////////////////////////////////////////// OZAN 3 END /////////////////////////////////////////////////
                       
                        /////////////////////////////OZan//////////////

                          io.to(infoForRankings.socketInfo).emit('score', {
                                scoresArray: scoresArrayJson
                          });
                     
                         console.log("for içi IF İÇİ EMIT Sonrası" + scoresArrayJson);
                          
                      }
                      
                      console.log("for içi IF İÇİ scoresArray[i] = " + scoresArray[i]);
                      break;
                  }
              }                                  

              function findRoomObject(socketos) { 
                  return socketos.roomId === info.socketConnectedTo;
              }
              scoresArray.find(findRoomObject);

        /*

              console.log("socket.on(score) içi 0 " + " length = " + scoresArray.length);
              console.log("socket.on(score) içi 1 " + infoForRankings.socketInfo + " " + infoForRankings.scoreInfo + " " + infoForRankings.usernameInfo);
              
              console.log("socket.on(score) içi 3 " + allRoomsArray.find(findRoomObject) + " " + info.username); // { name: 'cherries', quantity: 5 }
                */

    });


socket.on('gameHistory', function(params){

        var curreTimeInSeconds = Math.round(new Date().getTime()/1000);
        deleteTimeoutGames(curreTimeInSeconds);
        findAllGamesWUsername(params.username , function(err , games) {
        console.log("socket.on gameHistory içi GAMES = " + games +" USERNAME = " + params.username
        + "  length = " + games.length );                          

            if(games.length > 0)
                {
                    io.emit('gameHistory', {gamesHistory: games});
                       /* io.to(infoForRankings.socketInfo).emit('gamesHistory', {
                                gamesHistory: games
                      });*/
                }
        console.log("EMIT GERCEKLESTİ ****** ");    
        })
   });
});
