
const express = require('express');
const fs = require('fs');
const Papa = require('papaparse');
const csv = require('csv-parser');
const multer = require('multer');
const e1 = 0
const e2 = 0
const e3 = 0
const e4 = 0
const alloted = {}
const roll_alloted = {};

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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
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

            results.forEach(function (ele) {
                const roll = ele['Roll no']

                ans[roll] = [ele['Elective 2 [Preference 1]'], ele['Elective 2 [Preference 2]'], ele['Elective 2 [Preference 3]'], ele['Elective 2 [Preference 4]']]
            })
            const dic = {};

            // Iterate through the data and its arrays
            for (const key in ans) {
                const items = ans[key];
                for (const item of items) {
                    dic[item] = 0;
                }
            }

            // Assuming 'data' is defined somewhere in your code
            for (const i in ans) {
                for (const j of ans[i]) {
                    if (dic[j] < 50) {
                        roll_alloted[i] = j;
                        dic[j]++;
                        break;
                    }
                }
            }


            // console.log(dic)
            // console.log(roll_alloted)


            // Convert the array into a CSV string



            // Send a response back to the client
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

