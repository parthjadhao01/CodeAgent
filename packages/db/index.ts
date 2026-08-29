// Pinned to mongoose 8 on purpose. Mongoose 9 pulls bson 7, which calls
// `v8.isBuildingSnapshot()` at import time — not implemented in Bun 1.3.x, so
// merely importing mongoose 9 crashes the process. Revisit when Bun ships it.
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Registers a model once per mongoose instance.
 *
 * `mongoose.model()` throws OverwriteModelError if the same name is registered
 * twice, which happens on every hot reload under `bun run --watch` because the
 * module is re-evaluated. Reusing the already-registered model is the fix.
 */
function defineModel<S extends Schema>(name: string, schema: S) {
    return (mongoose.models[name] as Model<InferSchemaType<S>> | undefined)
        ?? mongoose.model<InferSchemaType<S>>(name, schema)
}

const UserSchema = new Schema({
    // No `unique: true` here — _id is already the primary key, and MongoDB
    // rejects a unique option on the _id index outright (error 197).
    _id : {
        type : String,
        required : true,
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

// One row per GitHub installation: re-running the install callback must update
// the existing row, not add a second one.
GitHubCredentialSchema.index({ installationId : 1 },{ unique : true })
GitHubCredentialSchema.index({ userId : 1 })

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

export const RUN_STATUSES = ["active","completed","failed","cancelled"] as const

const RunSchema = new Schema({
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
    userId : {
        type : String,
        ref : "User",
        required : true
    },
    // The VM this run is pinned to. Signed into the run token at dispatch, so
    // the MCP path never has to look it up; also what the reaper kills.
    sandboxId : {
        type : String,
    },
    status : {
        type : String,
        enum : RUN_STATUSES,
        default : "active",
        required : true
    },
    branchName : {
        type : String,
    },
    attemptCount : {
        type : Number,
        default : 0
    },
    startedAt : {
        type : Date,
        default : () => new Date()
    },
    endedAt : {
        type : Date,
    },
    error : {
        type : String,
    }
},{
    timestamps : true
})

// The run lock. Partial filter is load-bearing: a plain unique index on
// { conversationId, status } would also forbid a second *completed* run on the
// same conversation. Scoped to status "active", it means exactly "at most one
// run in flight per conversation" and leaves terminal rows unconstrained.
RunSchema.index(
    { conversationId : 1 },
    { unique : true, partialFilterExpression : { status : "active" } }
)

export const UserModel = defineModel("User",UserSchema)
export const ConversationModel = defineModel("Conversation",ConversationSchema)
export const GitHubCredentialModel = defineModel("GitHubCredential",GitHubCredentialSchema)
export const ChatResponseModel = defineModel("ChatResponse",ChatResponseSchema)
export const RunModel = defineModel("Run",RunSchema)

export async function connect(uri : string) : Promise<void> {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri)
    }
    await Promise.all([
        UserModel.init(),
        ConversationModel.init(),
        GitHubCredentialModel.init(),
        ChatResponseModel.init(),
        RunModel.init(),
    ])
}

export async function disconnect() : Promise<void> {
    await mongoose.disconnect()
}
