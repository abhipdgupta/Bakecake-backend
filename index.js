const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

app.use((req,res)=>{
  res.setHeader("Access-Control-Allow-Origin","*")
  res.setHeader("Access-Control-Allow-Methods","*")
  res.setHeader("Access-Control-Allow-Headers","*")
})
app.use(cors());
app.use(express.json());


let db = mysql.createConnection({
  user: process.env.DB_USER,
  port:process.env.DB_PORT,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Connected to database");
});

app.get("/banner", (req, res) => {
  // const x=Math.floor(Math.random()*3+1)

  db.query(`SELECT * FROM banner`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/category", (req, res) => {
  // const x=Math.floor(Math.random()*3+1)

  db.query(`SELECT * FROM category`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ category: result });
    }
  });
});
app.get("/products", (req, res) => {
  // const x=Math.floor(Math.random()*3+1)

  db.query(`SELECT * FROM products`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ products: result });
    }
  });
});
app.post("/orders", (req, res) => {
  console.log(req.body[0]);
  const idorder = (Date.now() % 100000) + Math.floor(Date.now() / 100000);

  let username = req.body[1].username;
  let phoneno = req.body[1].phoneno;
  let address = req.body[1].address;
  let comment = req.body[1].comment;

  let d = new Date();
  let date =
    d.getFullYear() +
    "-" +
    d.getMonth() +
    "-" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();

  let email = req.body[1].email;

  db.query(
    `INSERT INTO customers(username,phone_no,address,comment,order_id,date_of_order,email)values(?,?,?,?,?,?,?)`,
    [username, phoneno, address, comment, idorder, date, email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        AddItems();
      }
    }
  );

  const AddItems = () => {
    for (let i = 0; i < req.body[0].length; i++) {
      let product_id = req.body[0][i].id;
      let product_name = req.body[0][i].pname;
      let product_price = req.body[0][i].pprice;
      let quantity = req.body[0][i].pquantity;
      let size = req.body[0][i].psize;

      db.query(
        `INSERT INTO orders(order_id,product_id,product_price,quantity,product_name,size)values(?,?,?,?,?,?)`,
        [idorder, product_id, product_price, quantity, product_name, size],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }
      );
    }
  };

  res.send(`${idorder}`);
});

app.post("/login/admin", (req, res) => {
  let user = process.env.ADMIN_USER;
  let pass = process.env.ADMIN_PASS;
 
  if (req.body.user === user && req.body.pass === pass) {
    res.send({ validation: true });
  } else {
    res.send({ validation: false });
  }
});

///////////////////////////////////////////////////////////////

app.get("/customers", (req, res) => {
  db.query(
    `SELECT * FROM customers ORDER BY date_of_order DESC`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ customers: result });
      }
    }
  );
});
app.get("/orders", (req, res) => {
  db.query(
    ` select o.*,c.date_of_order,c.username from orders as o,customers as c where c.order_id=o.order_id order by c.date_of_order; `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ orders: result });
      }
    }
  );
});

app.get("/orders/:order_id", (req, res) => {
  db.query(
    `SELECT * FROM orders where order_id=${req.params.order_id}  `,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ orders: result });
      }
    }
  );
});

var port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server is up and running");
});
