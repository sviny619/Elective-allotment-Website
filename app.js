
const express = require('express');
const fs = require('fs');

const csv = require('csv-parser');
const multer = require('multer');
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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html")
})

// app.post('/upload', upload.single('csvFile'), (req, res) => {

//     // 'file' is the name attribute of the file input field in the HTML form
  
//     // The uploaded file is available in req.file
//     console.log(req.file);
  
//     // Handle the file as needed, e.g., read its contents
//     // Here's an example of reading the contents as a string
//     const filePath = req.file.path;
//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     const results = [];
//     // console.log(fileContent);
  
//     // Send a response back to the client
//     res.send('File uploaded successfully');
//   });
app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
  
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        // Process the parsed CSV data (results) as JavaScript objects
        // console.log(results);
        let ans=[]
  results.forEach(function(ele){
    const roll_no='Roll no'
    const rollno=ele.Timestamp
    ans.push(rollno)



  })
console.log(ans)

  
        // Send a response back to the client
        res.send('CSV file uploaded and parsed successfully');
      });
  });
  
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

