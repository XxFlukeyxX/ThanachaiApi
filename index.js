const express = require('express');
const mysql = require('mysql2'); // ใช้ mysql2 แทน mysql
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // ใช้ multer สำหรับการอัปโหลดไฟล์
const path = require('path');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // สำหรับการเสิร์ฟไฟล์อัปโหลด

// สร้างการเชื่อมต่อกับ MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'computer_inventory'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // บันทึกไฟล์ลงในโฟลเดอร์ 'uploads' บนเซิร์ฟเวอร์
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ให้เป็นชื่อที่ไม่ซ้ำกัน (เช่น การใช้ timestamp)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API สำหรับบันทึกข้อมูลคอมพิวเตอร์
app.post('/computers', upload.single('image'), (req, res) => {
  const {
    brand_name,
    model_name,
    serial_number,
    stock_quantity,
    price,
    cpu_speed,
    memory_size,
    hard_disk_size
  } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = 'INSERT INTO computers (brand_name, model_name, serial_number, stock_quantity, price, cpu_speed, memory_size, hard_disk_size, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [brand_name, model_name, serial_number, stock_quantity, price, cpu_speed, memory_size, hard_disk_size, image_url];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({ message: 'Computer added successfully', id: result.insertId });
  });
});

// API สำหรับดึงข้อมูลคอมพิวเตอร์ทั้งหมด
app.get('/computers', (req, res) => {
  let sql = 'SELECT * FROM computers';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
