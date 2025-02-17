import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import {getReceiverSocketId, io} from "../lib/socket.js";

export const getUsersController = async(req,res) =>{
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers)
    }catch(e){
        console.log("Error in get users controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}

export const getMessages = async(req,res) =>{
    try{
        const {id : userToChatId} = req.params;
        const myId = req.user._id

        const messages = await Message.find({
            $or : [
                {senderId: myId,receiverId : userToChatId},
                {senderId: userToChatId,receiverId : myId}
            ]
        })

        res.status(200).json(messages);
    }catch(e){
        console.log("Error in get messages controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}

export const sendMessage = async(req,res) =>{
    try{
        const {image,message} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            image : imageUrl
        });

        await newMessage.save();

        // realtime functionality comes here(socket.io)
        const receiverSocketId = getReceiverSocketId(receiverId)

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }


        res.status(201).json(newMessage);
    }catch(e){
        console.log("Error in send message controller:",e);
        res.status(500).send({
            "message" : "Internal Server error"
        })
    }
}