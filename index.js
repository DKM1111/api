const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
const Docs = require('./docs.json');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(morgan('combined'));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// GET API
app.get('/', (req, res) => {
    res.send('<div style=color: "blue"; text-align: center;>Welcome To My CRUD API.<div>');
});

// GET ALL USER
app.get('/users', (req, res) => {
    if (Docs.length === 0) {
        const html = `
        <html>
        <body style="text-align: center; padding-top: 40px;">
            <span style="color: blue; display: block;">No Data, Please Add Some User</span>
            <img src="https://assets-v2.lottiefiles.com/a/0e30b444-117c-11ee-9b0d-0fd3804d46cd/BkQxD7wtnZ.gif" style="max-width: 20%; height: auto;" alt="No Users found">
        </body>
        </html>`;
        return res.send(html);
    } else {
        return res.send(Docs);
    }
});

// GET USER WITH ID
app.get('/users/:id', (req, res) => {
    let result = Docs.find(Element => Element.id == req.params.id);
    if (result) {
        res.send(result);
    } else {
        res.send(`No user found with id: ${req.params.id}.`);
    }
});

// GET USER WITH NAME
app.get('/users/name/:name', (req, res) => {
    let result = Docs.find(Element => Element.name == req.params.name);
    if (result) {
        res.send(result);
    } else {
        res.send(`No user found with name: ${req.params.name}.`);
    }
});

// POST NEW USER
app.post('/users', (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        return res.status(400).send("Name, email, and age are required.");
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        age
    };
    Docs.push(newUser);

    fs.writeFile(path.join(__dirname, 'docs.json'), JSON.stringify(Docs), (err) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.send(`User added successfully`);
        }
    });
});

// UPDATE USER WITH ID
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, age } = req.body;
    const userToUpdate = Docs.find(user => user.id === userId);

    if (!userToUpdate) {
        return res.status(404).send('User not found.');
    }

    if (name !== undefined) {
        userToUpdate.name = name;
    }
    if (email !== undefined) {
        userToUpdate.email = email;
    }
    if (age !== undefined) {
        userToUpdate.age = age;
    }

    fs.writeFile(path.join(__dirname, 'docs.json'), JSON.stringify(Docs), (err) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.send(`User ${name} updated successfully`);
        }
    });
});

// DELETE USER WITH ID
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const userIndex = Docs.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).send('User not found.');
    }

    Docs.splice(userIndex, 1);

    fs.writeFile(path.join(__dirname, 'docs.json'), JSON.stringify(Docs), (err) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.send('User Deleted.');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
