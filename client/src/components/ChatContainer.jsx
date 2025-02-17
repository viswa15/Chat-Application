import React, {useEffect, useRef} from 'react'

import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import ChatHeader from "./ChatHeader.jsx";

import {formatMessageTime} from "../lib/utils.js";
import {useChatStore} from "../store/useChatStore.js";
import {useAuthStore} from "../store/useAuthStore.js";

const ChatContainer = () => {
    const {authUser} = useAuthStore();
    const {getMessages,messages,isMessagesLoading,selectedUser,subscribeToMessages,unsubscribeFromMessages} = useChatStore();

    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id)

        subscribeToMessages();

        //for performance reasons
        return () => unsubscribeFromMessages()
    }, [getMessages,selectedUser._id,subscribeToMessages,unsubscribeFromMessages]);

    useEffect(()=>{
        if(messageEndRef.current && messages){
            messageEndRef.current?.scrollIntoView({behavior : "smooth"})
        }
    },[messages])

    if(isMessagesLoading){
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? authUser.profilePic || "/avatar.png"
                                            : selectedUser.profilePic || "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.message && <p>{message.message}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <MessageInput />
        </div>
    );
}
export default ChatContainer
