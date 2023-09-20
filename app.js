const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const Papa = require('papaparse');
const csv = require('csv-parser');
const multer = require('multer');
const alloted = {}
const roll_alloted = {};
const max_students_elec = {}
const preferencesByRollNo = {};
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        // Check if the file has the CSV file extension
        if (file.originalname.endsWith('.csv')) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Invalid file type. Only CSV files are allowed.'), false); // Reject the file
        }
    }
});
const results = [];
let ans = {}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})
app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/home.html")
})

app.post('/submit', function (req, res) {
    const electiveEntries = [];

    // Loop through the posted form data
    for (let i = 1; i <= Object.keys(req.body).length / 2; i++) {
        const electiveName = req.body[`elective${i}`];
        const maxStudents = req.body[`maxStudents${i}`];

        // Create an object for each elective entry
        const electiveEntry = {
            electiveName,
            maxStudents: parseInt(maxStudents), // Convert to a number
        };

        electiveEntries.push(electiveEntry);
        const formattedKey = electiveName.toLowerCase().replace(/\s/g, ''); // Remove spaces and make lowercase
        max_students_elec[formattedKey] = parseInt(maxStudents);

    }

    // Now you can work with electiveEntries as an array of objects on the server side
    // For demonstration, let's console.log the received data
    console.log(max_students_elec);

    // You can also return a response to the client if needed.

    // For demonstration, let's send a success response
    res.redirect('/')


})
app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
    if (filePath === null) {
        res.send("the file doesnt exist")
    }

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            // Process the parsed CSV data (results) as JavaScript objects
            // console.log(results);
            const preferencesByRollNo = {};

            // Iterate through the data and extract preferences starting from the 5th index
            results.forEach(entry => {
                const rollNo = entry['Roll no'].trim(); // Remove extra spaces
                const preferences = [];

                // Iterate through the object properties starting from the 5th index
                for (let i = 4; i <= Object.keys(entry).length; i++) {
                    const preferenceKey = Object.keys(entry)[i];
                    const preferenceValue = entry[preferenceKey];
                    
                    if (preferenceValue) {
                        const formattedPreference = preferenceValue.toLowerCase().replace(/\s/g, '');
                        preferences.push(formattedPreference);
                    }
                }

                preferencesByRollNo[rollNo] = preferences;
            });
            console.log(preferencesByRollNo);





            // Iterate through the data and its arrays
            

            // Assuming 'data' is defined somewhere in your code
            for (const i in preferencesByRollNo) {
                for (const j of preferencesByRollNo[i]) {
                    if (max_students_elec[j] >0) {
                        roll_alloted[i] = j;
                        max_students_elec[j]--;
                        break;
                    }
                }
            }


            // console.log(dic)
            // console.log(roll_alloted)


            // Convert the array into a CSV string



            // Send a response back to the client
            // res.send(<p>success</p>);
            res.redirect('/download-csv');
        });
});
app.get('/download-csv', (req, res) => {
    // Convert 'ans' to CSV format using PapaParse
    const csv = Papa.unparse(Object.entries(roll_alloted));

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

    // Send the CSV data to the client
    res.send(csv);
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

