import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/data_pharmacy");

        console.log("Lien ket CSDL thanh cong");

    } catch (error) {
        console.error("Loi khi ket noi CSDL", error);
        process.exit(1); // dong cong trinh khi ket noi CSDL that bai   
    }
}        