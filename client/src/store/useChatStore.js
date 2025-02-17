import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js";
import {toast} from "react-hot-toast";
import {devtools} from "zustand/middleware";
import {useAuthStore} from "./useAuthStore.js";


export const useChatStore = create(devtools((set,get)=>({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading : false,

    getUsers : async() =>{
        set({isUsersLoading : true})
        try{
            const res = await axiosInstance.get("/messages/users");
            // console.log("Response:",res.data);
            set({users : res.data})
        }catch(e){
            toast.error(e.response.data.message);
        }finally {
            set({isUsersLoading : false})
        }
    },

    getMessages : async(userId) =>{
        set({isMessagesLoading : true})
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages : res.data})
        }catch (e){
            toast.error(e.response.data.message);
        }finally {
            set({isMessagesLoading : false})
        }
    },

    setSelectedUser : (selectedUser) => set({selectedUser}),

    sendMessage : async(data) =>{
        const {selectedUser,messages} = get();
        try{
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,data);
            set({messages : [...messages,res.data]})
        }catch (e){
            toast.error(e.response.data.message);
        }
    },

    subscribeToMessages : () =>{
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;


        socket.on("newMessage",(newMessage)=>{
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id

            if(isMessageSentFromSelectedUser) return;
            set({messages : [...get().messages,newMessage]})
        })
    },

    unsubscribeFromMessages : () =>{
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    }
})))