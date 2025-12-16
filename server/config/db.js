const mongoose=require('mongoose');
const URI=process.env.mongo_URI;


const connectDB=async()=>{
    try{
    const conn=await mongoose.connect(URI);
    console.log(`database connected successfully  ${conn.connection.host}` )
    }catch(err){
        console.error(`error connecting to the database ${err.message}`)
        process.exit(1)
    }
}
module.exports = connectDB;