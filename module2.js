const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

let db = new sqlite3.Database('repair_requests.db');


    


//Выполнение запросов к базе данных

const getAllRequests = () => {
  db.serialize(() => {
    db.all(`
      SELECT 
        r.requestID, 
        r.startDate, 
        r.carType, 
        r.carModel, 
        r.problemDescryption, 
        r.requestStatus, 
        r.completionDate, 
        r.repairParts, 
        u1.fio AS masterName, 
        u2.fio AS clientName
      FROM 
        Requests r
      JOIN 
        Users u1 ON r.masterID = u1.userID
      JOIN 
        Users u2 ON r.clientID = u2.userID;
    `, (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
    });
  });
};

const getAllComments = () => {
  db.serialize(() => {
    db.all(`
      SELECT 
        c.commentID, 
        c.message, 
        u.fio AS masterName, 
        r.requestID
      FROM 
        Comments c
      JOIN 
        Users u ON c.masterID = u.userID
      JOIN 
        Requests r ON c.requestID = r.requestID;
    `, (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
    });
  });
};

getAllRequests();
getAllComments();


db.close();