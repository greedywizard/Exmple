const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

// Функция для получения списка заявок
function getRequests() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Requests", [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

// Функция для добавления новой заявки
function addRequest(request) {
    const { startDate, carType, carModel, problemDescryption, requestStatus, completionDate, repairParts, masterID, clientID } = request;
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Requests (startDate, carType, carModel, problemDescryption, requestStatus, completionDate, repairParts, masterID, clientID) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [startDate, carType, carModel, problemDescryption, requestStatus, completionDate, repairParts, masterID, clientID],
            function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ requestID: this.lastID });
            }
        );
    });
}

// Функция для обновления заявки
function updateRequest(requestID, updateData) {
    const { startDate, carType, carModel, problemDescryption, requestStatus, completionDate, repairParts, masterID, clientID } = updateData;
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Requests 
             SET startDate = ?, carType = ?, carModel = ?, problemDescryption = ?, requestStatus = ?, completionDate = ?, repairParts = ?, masterID = ?, clientID = ? 
             WHERE requestID = ?`,
            [startDate, carType, carModel, problemDescryption, requestStatus, completionDate, repairParts, masterID, clientID, requestID],
            function (err) {
                if (err) {
                    return reject(new Error("Произошла ошибка при обновлении заявки"));
                }
                if (this.changes === 0) {
                    return reject(new Error("Запрос на ремонт не найден"));
                }
                resolve();
            }
        );
    });
}

// Функция для удаления заявки
function deleteRequest(requestID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM Requests WHERE requestID = ?`, [requestID], function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

// Функция для добавления комментария
function addComment(requestID, masterID, message) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Comments (message, masterID, requestID) VALUES (?, ?, ?)`,
            [message, masterID, requestID],
            function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ commentID: this.lastID });
            }
        );
    });
}

function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function calculateAverageRepairTime() {
    return new Promise((resolve, reject) => {
        db.all("SELECT startDate, completionDate FROM Requests WHERE completionDate IS NOT NULL", [], (err, rows) => {
            if (err) {
                reject(err);
            }
            let totalRepairTime = 0;
            let requestCount = rows.length;

            rows.forEach(row => {
                let startDate = new Date(row.startDate);
                let completionDate = new Date(row.completionDate);
                totalRepairTime += (completionDate - startDate);
            });

            let averageRepairTime = totalRepairTime / requestCount;
            resolve(averageRepairTime);
        });
    });
}



// Пример использования функций
async function exampleUsage() {
    try {
        let requests = await getRequests();
        console.log(requests);

        let newRequest = {
            startDate: "2024-06-01",
            carType: "Sedan",
            carModel: "Toyota Camry",
            problemDescryption: "Engine issues",
            requestStatus: "In Progress",
            completionDate: null,
            repairParts: "Engine oil, Spark plugs",
            masterID: 1,
            clientID: 2
        };
        let addedRequest = await addRequest(newRequest);
        console.log("Added request ID:", addedRequest.requestID);

        let updateData = {
            startDate: "2024-06-01",
            carType: "Sedan",
            carModel: "Toyota Camry",
            problemDescryption: "Engine issues",
            requestStatus: "Completed",
            completionDate: "2024-06-03",
            repairParts: "Engine oil, Spark plugs",
            masterID: 1,
            clientID: 2
        };
        await updateRequest(addedRequest.requestID, updateData);
        console.log("Updated request ID:", addedRequest.requestID);

        await deleteRequest(addedRequest.requestID);
        console.log("Deleted request ID:", addedRequest.requestID);

        let averageRepairTime = formatDuration(await calculateAverageRepairTime());
        console.log("Average repair time (ms):", averageRepairTime);

        let newComment = await addComment(3, 4, "что то пошло не так") 
        console.log("New comment", newComment.commentID);

        function addComment(requestID, masterID, message) {
            return new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO Comments (message, masterID, requestID) VALUES (?, ?, ?)`,
                    [message, masterID, requestID],
                    function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve({ commentID: this.lastID });
                    }
                );
            });
        }
        // пример кривой работы и ошибки
        await updateRequest(-1, updateData);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

exampleUsage();
