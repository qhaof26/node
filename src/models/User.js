import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 50,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15,
        unique: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["active", "inactive", "banned"],
        default: "active",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    admin: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});  

userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const User = mongoose.model("User", userSchema);
export default User;