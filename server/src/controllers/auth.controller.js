import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const registerController = async(req,res) =>{
    const {email,fullName,password} = req.body;
    try{
        //validate fields
        if(!email){
            return res.status(400).json({message:"Email is required"});
        }
        if(!fullName){
            return res.status(400).json({message:"Full name  is required"});
        }if(!password){
            return res.status(400).json({message:"Password is required"});
        }
        //validate password length
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }

        //check if user already exists
        const user = await User.findOne({email});
        if(user){
           return res.status(400).json({message:"User already exists"});
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            email,
            fullName,
            password:hashedPassword
        });
        await newUser.save();

        console.log("userID:",newUser._id)

        //generate token
        generateToken(newUser._id,res);

        //send success response
        res.status(201).json(newUser)

    }catch(e){
        console.log("Error in signup controller:",e);
        res.status(500).json({
            message : "Internal Server error"
        })
    }
}

export const loginController = async(req,res) =>{
    const {email,password} = req.body;
    try{
        if(!email){
            return res.status(400).json({message:"Email is required"});
        }
        if(!password){
            return res.status(400).json({message:"Password is required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }

        //generate token
        generateToken(user._id,res);

        //send success response
        res.status(200).json(user);
    }catch(e){
        console.log("Error in login controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}

export const logoutController = async(req,res) =>{
    try{
        res.cookie("jwt",null,{maxAge : 0});
        res.status(200).json({
            message : "Logged out successfully"
        })
    }catch (e){
        console.log("Error in logout controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}

export const updateProfileController = async(req,res)=>{
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"});
        }

        const uploadedResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic: uploadedResponse.secure_url},{new:true});

        res.status(200).json(updatedUser);
    }catch(e){
        console.log(e)
        res.status(500).json({
            message : "Internal Server error"
        })
    }
}

export const checkAuth = async(req,res) =>{
    try{
        res.status(200).json(req.user);
    }catch(e){
        console.log("Error in checkAuth controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}