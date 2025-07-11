const mongoose=require('mongoose');
const colors=require('colors')

  const connectDB=async ()=>{
      try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected To database Successfully".bgCyan);
        
      } catch (error) {
        console.log("MongoDB Connection Error",error,colors.bgRed);
        
      }
}

module.exports=connectDB



