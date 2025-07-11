// socket 
const http = require('http');
const { Server } = require('socket.io');
const initSocket = require('./socket');
//

const express=require('express');
const morgan = require('morgan');
const colors=require('colors');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB = require('./config/db');
const app=express();

// create HTTP server
const httpServer = http.createServer(app);
// init socket
const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  initSocket(io);



//config
dotenv.config();
//DB CONNECTION 
connectDB();


//Middlewares
app.use(cors());
app.use(express.json())
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

//Routes


app.use('/api/v1/auth',require('./routes/authRoutes'));
app.use('/api/v1/user',require('./routes/userRoute'));
app.use('/api/v1/friend',require('./routes/friendRoute'));
app.use('/api/v1/book',require('./routes/bookRoutes'));
app.use('/api/v1/post',require('./routes/postRoutes'));
app.use('/api/v1/bookshelf',require('./routes/bookShelfRoutes'));
app.use('/api/v1/extra',require('./routes/extraRoutes'));
app.use('/api/v1/chat', require('./routes/chatRoutes'));


app.get('/',(req,res)=>{
    return res.status(200).send("Hi parth");
});



//
Port=process.env.PORT||8080;

//listining

// app.listen(Port,()=>{
//     return console.log(`Server Running on port ${Port} successfully `.green.bgGreen);
// })


// listening
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.green.bgGreen);
});