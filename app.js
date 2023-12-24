const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5100; 

// MySQL Database Connection

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '',
    database: 'hotwax_commerce',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Welcome to Hotwax API");
});

app.get('/test', (req, res) => {
    res.send('Server is working fine!');
});

function generateUniquePartyId() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Adjust the padding as needed
    return `CUST${timestamp}${random}`;
}

app.post('/api/person', (req, res) => {
    const { firstName, middleName, lastName, gender, maritalStatusEnumId, birthDate, employmentStatusEnumId, occupation } = req.body;

    const query = 'INSERT INTO person (PARTY_ID, SALUTATION, FIRST_NAME, MIDDLE_NAME, LAST_NAME, GENDER, BIRTH_DATE, MARITAL_STATUS_ENUM_ID, EMPLOYMENT_STATUS_ENUM_ID, OCCUPATION) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const partyId = generateUniquePartyId();
    const salutation = 'Mr/Ms';

    db.query(query, [partyId, salutation, firstName, middleName, lastName, gender, birthDate, maritalStatusEnumId, employmentStatusEnumId, occupation], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Person created successfully:', { partyId });
            res.status(201).json({ message: 'Person created successfully', partyId });
        }
    });
});
app.put('/api/person/:partyId', (req, res) => {
    const partyId = req.params.partyId;
    const { firstName, middleName, lastName, gender, maritalStatusEnumId, birthDate, employmentStatusEnumId, occupation } = req.body;

    const query = 'UPDATE person SET FIRST_NAME=?, MIDDLE_NAME=?, LAST_NAME=?, GENDER=?, BIRTH_DATE=?, MARITAL_STATUS_ENUM_ID=?, EMPLOYMENT_STATUS_ENUM_ID=?, OCCUPATION=? WHERE PARTY_ID=?';

    db.query(query, [firstName, middleName, lastName, gender, birthDate, maritalStatusEnumId, employmentStatusEnumId, occupation, partyId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Person updated successfully:', { partyId });
            res.status(200).json({ message: 'Person updated successfully', partyId });
        }
    });
});






app.post('/api/order_header', (req, res) => {
    const { orderId, orderName, placedDate, approvedDate, statusId, currencyUomId, productStoreId, salesChannelEnumId, grandTotal, completedValue } = req.body;

    const query = 'INSERT INTO order_header (ORDER_ID, ORDER_NAME, PLACED_DATE, APPROVED_DATE, STATUS_ID, CURRENCY_UOM_ID, PRODUCT_STORE_ID, SALES_CHANNEL_ENUM_ID, GRAND_TOTAL, COMPLETED_DATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [orderId, orderName, placedDate, approvedDate, statusId, currencyUomId, productStoreId, salesChannelEnumId, grandTotal, completedValue], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Order created successfully:', { orderId: result.insertId });
            res.status(201).json({ message: 'Order created successfully', orderId: result.insertId });
        }
    });
});


app.post('/api/order_item', (req, res) => {
    const { orderId, orderItemSeqId, orderPartSeqId, productId, itemDescription, quantity, unitAmount, itemTypeEnumId, parentItemSeqId } = req.body;

    const query = 'INSERT INTO order_item(ORDER_ID, ORDER_ITEM_SEQ_ID, ORDER_PART_SEQ_ID, PRODUCT_ID, ITEM_DESCRIPTION, QUANTITY, UNIT_AMOUNT, ITEM_TYPE_ENUM_ID, PARENT_ITEM_SEQ_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [orderId, orderItemSeqId, orderPartSeqId, productId, itemDescription, quantity, unitAmount, itemTypeEnumId, parentItemSeqId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const orderPartSeqId = result.insertId;

    
            const itemQuery = 'INSERT INTO order_item (ORDER_ID, ORDER_PART_SEQ_ID, PRODUCT_ID, ITEM_DESCRIPTION, QUANTITY, UNIT_AMOUNT) VALUES (?, ?, ?, ?, ?)';
            itemDetails.forEach((item) => {
                db.query(itemQuery, [orderId, orderItemSeqId, orderPartSeqId, productId, itemDescription, quantity, unitAmount, itemTypeEnumId, parentItemSeqId], (itemErr) => {
                    if (itemErr) {
                        console.error(itemErr);
                        // Handle the error as needed
                    }
                });
            });

            console.log('Order items added successfully:', { orderId, orderPartSeqId });
            res.status(201).json({ message: 'Order items added successfully', orderId, orderPartSeqId });
        }
    });
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
