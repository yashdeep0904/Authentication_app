import mongoose from "mongoose"


const getConnection = async()=>{
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log("MongoDB connected !!")
    } catch (error) {
        console.error("MongoDB connecton error",process.exit(1))
    };
}

export default getConnection