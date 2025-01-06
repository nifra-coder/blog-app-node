require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cluster = require('cluster');
const os = require('os');

const Blog = require('./models/blog');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const { checkForAuthenticationCookie } = require('./middlewares/authentications');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;

// Check if the current process is the master
if (cluster.isMaster) {
    const numCPUs = os.cpus().length; // Get the number of CPU cores
    console.log(`Master ${process.pid} is running`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart a worker if it exits
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    // Worker processes
    const app = express();

    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(checkForAuthenticationCookie("token"));
    app.use(express.static(path.resolve("./public")));
    app.use('/public', express.static(path.resolve("./public")));

    mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log("MongoDB connected successfully"))
        .catch(err => console.error("MongoDB connection error:", err));

    // Middleware
    app.set('view engine', 'ejs');
    app.set("views", path.resolve("./views"));

    app.get('/', async (req, res) => {
        console.log(req.user);
        const allBlogs = await Blog.find().sort({ createdAt: -1 });
        res.render('home', {
            user: req.user,
            blogs: allBlogs,
        });
    });

    app.use('/user', userRouter);
    app.use('/blog', blogRouter);

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on http://localhost:${PORT}`);
    });
}
