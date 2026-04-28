const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/disaster_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        first_name,
        last_name,
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).send('Invalid password');
    }

    res.status(200).send('Login successful');
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
