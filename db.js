const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect( process.env.MONGODB_URI , {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB connected')
    } catch(e){
        console.error('MongoDB connection error', e.message )
        process.exit(1)
    }
}

module.exports = connectDB;