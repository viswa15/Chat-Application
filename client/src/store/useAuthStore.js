import {create} from "zustand"
import { devtools } from "zustand/middleware";
import {axiosInstance} from "../lib/axios.js";
import {toast} from "react-hot-toast"
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.VITE_BASE_URL;


export const useAuthStore = create(
    devtools((set,get) => ({
        authUser : null,
        isSigningUp : false,
        isLoggingIn : false,
        isCheckingAuth : true,
        isUpdatingProfile : false,
        onlineUsers : [],
        socket : null,


        checkAuth : async() =>{
            try{
                const res = await axiosInstance.get("/auth/check")
                set({authUser : res.data})
                get().connectSocket()
            }catch(e){
                console.log("Error in checking auth:",e);
                set({authUser : null})
            }finally{
                set({isCheckingAuth : false})
            }
        },

        signup : async(data) =>{
            set({isSigningUp : true})
            try{
              const res = await axiosInstance.post("/auth/signup",data);
              set({authUser : res.data});
              toast.success("Account created successfully");
              get().connectSocket()
            }catch(e){
                toast.error(e.response.data.message);
            }finally {
                set({isSigningUp : false})
            }
        },

        login : async(data) =>{
            set({isLoggingIn : true})
            try{
                const res = await axiosInstance.post("/auth/login",data);
                set({authUser : res.data});
                toast.success("Logged in successfull");
                get().connectSocket()
            }catch(e){
                toast.error(e.response.data.message);
            }finally {
                set({isLoggingIn : false})
            }
        },

        logout : async() =>{
            try{
                await axiosInstance.post("/auth/logout");
                set({authUser : null});
                toast.success("Logged out successfully");
                get().disconnectSocket()
            }catch(e){
                toast.error(e.response.data.message);
            }
        },

        updateProfile : async(data) =>{
            set({isUpdatingProfile : true});
            try{
                const res = await axiosInstance.put("/auth/update-profile",data);
                set({authUser : res.data});
                toast.success("Profile updated successfully");
            }catch(e){
                console.log("Error in update profile:",e);
                toast.error(e.response.data.message);
            }finally {
                set({isUpdatingProfile : false})
            }
        },

        connectSocket : () =>{
            const {authUser} = get()
            if(!authUser || get().socket?.connected) return

            const socket = io(BASE_URL,{
                query : {
                    userId : authUser._id
                }
            });
            socket.connect()
            set({socket : socket})

            socket.on("getOnlineUsers",(userIds) => set({onlineUsers : userIds}))
        },

        disconnectSocket : () =>{
            if(get().socket?.connected) get().socket.disconnect()
        }
})))

