import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    _id : {
        type : String,
        required : true,
        unique : true,
        default : () => crypto.randomUUID()
    },
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
    }
})

const ConversationSchema = new Schema({
    _id : {
        type : String,
        required : true,
        default : () => crypto.randomUUID()
    },
    userId : {
        type : String,
        ref : "User",
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
        default : false
    },
    isFavorite : {
        type : Boolean,
        default : false
    },
    repoUrl : {
        type : String,
        required : true
    },
    prUrl : {
        type : String,
    },
    prNumber : {
        type : String,
    }
},{
    timestamps : true
})

const GitHubCredentialSchema = new Schema({
    _id : {
        type : String,
        required : true,
        default : () => crypto.randomUUID()
    },
    userId : {
        type : String,
        ref : "User",
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
        default : () => new Date().toISOString()
    }
})

const toolCallSchema = new Schema({
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

const ChatResponseSchema = new Schema({
    _id : {
        type : String,
        required : true,
        default : () => crypto.randomUUID()
    },
    conversationId : {
        type : String,
        ref : "Conversation",
        required : true
    },
    prompt : {
        type : String,
        required : true
    },
    response : {
        type : String,
        required : true
    },
    toolCalls : [toolCallSchema]
},{
    timestamps : true
})

export const UserModel = mongoose.model("User",UserSchema)
export const ConversationModel = mongoose.model("Conversation",ConversationSchema)
export const GitHubCredentialModel = mongoose.model("GitHubCredential",GitHubCredentialSchema)
export const ChatResponseModel = mongoose.model("ChatResponse",ChatResponseSchema)
