require('dotenv').config();

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');


const Blog = require('./models/blog');

const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

const { checkForAuthenticationCookie } = require('./middlewares/authentications');


const app = express()
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000 ;

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")))
app.use('/public', express.static(path.resolve("./public")));





mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// middleware
app.set('view engine', 'ejs')
app.set("views",path.resolve("./views"))

app.get('/', async(req, res)=>{
    console.log(req.user);
    const allBlogs = await Blog.find().sort({createdAt : -1});
    res.render('home',{
        user : req.user,
        blogs : allBlogs,
    })
})

app.use('/user', userRouter);
app.use('/blog', blogRouter);


app.listen(PORT, ()=> console.log(`listeing to the server http://localhost:${PORT}`));
