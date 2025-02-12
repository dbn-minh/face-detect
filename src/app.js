import express from 'express';
import sequelize from './config/database.js';
import router from './routes/rootRoutes.js';
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // allows us to parse incoming cookies
app.use(express.urlencoded({ extended: true }));

// Use the routes defined in the routes folder
app.use('/', router);


// Test the database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
