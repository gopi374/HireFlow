const mongoose = require('mongoose');
const connectdb = async()=>{
    try{
        const uri = process.env.MONGO_URI;
        if(!uri){
            console.log("MONGO_URI Not Found !!");
            return;
        }
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connect :`,conn.connection.host);
    }
    catch(err){
        console.log("❌ Error in DB connection :" ,err);
    }
}

module.exports = connectdb;