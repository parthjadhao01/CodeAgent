import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    _id : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
    },
    conversationId : [{
        type : String,
        ref : "Conversation"
    }],
    githubCredentialId : [{
         type : String,
         ref : "GitHubCredential"
    }]
})

const ConversationSchema = new Schema({
    _id : {
        type : String,
        required : true
    },
    name : {
        type : String,
        default : "New Session",
    },
    sandboxId : {
        type : String,
    },
    active : {
        type : Boolean,
        required : true
    },
    isFavorite : {
        type : Boolean,
        default : false
    },
    chatResponse : [{
        type : String,
        ref : "ChatResponse"
    }],
    repoUrl : {
        type : String,
        required : true
    },
    userId : {
        type : String,
        ref : "GitHubCredential"
    }
},{
    timestamps : true
})

const GitHubCredentialSchema = new Schema({
    _id : {
        type : String,
        required : true
    },
    installationId : {
        type : String,
        required : true
    },
    accountLogin : {
        type : String,
        required : true
    },
    connectedAt : {
        type : String,
    },
    userId : {
        type : String,
    }
})

const toolcallSchema = new Schema({
    name : {
        type : String
    },
    input : {
        type : String
    },
    output : {
        type : String
    },
    status : {
        type : String,
        enum : ["inProgress","Successful","Failed"]
    }
})

const promptSchema = new Schema({
    _id : {
        type : String
    },
    prompt : {
        type : String
    }
})

const responseSchema = new Schema({
    _id : {
        type : String
    },
    response : {
        type : String
    },
    toolCalls : [toolcallSchema]
})

const ClientAIConversationSchema = new Schema({
    prompt : [promptSchema],
    response : [responseSchema]
})

const ChatResponseSchema = new Schema({
    _id : {
        type : String,
        required : true
    },
    conversationId : {
        type : String,
        ref : "Conversation"
    },
    conversation : ClientAIConversationSchema
    
})

export const UserModel = mongoose.model("User",UserSchema)
export const ConversationModel = mongoose.model("Conversation",ConversationSchema)
export const GitHubCredentialModel = mongoose.model("GitHubCredential",GitHubCredentialSchema)
export const ChatResponse = mongoose.model("ChatResponse",ChatResponseSchema)