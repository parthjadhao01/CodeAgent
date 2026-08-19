"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
    Plus,
    SlidersHorizontal,
    ArrowUp,
    X,
    FileText,
    ImageIcon,
    Video,
    Music,
    Archive,
    ChevronDown,
    Check,
    Loader2,
    AlertCircle,
    Copy,
    UploadCloud,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Types
export interface FileWithPreview {
    id: string
    file: File
    preview?: string
    type: string
    uploadStatus: "pending" | "uploading" | "complete" | "error"
    uploadProgress?: number
    abortController?: AbortController
    textContent?: string
}

export interface PastedContent {
    id: string
    content: string
    timestamp: Date
    wordCount: number
}

export interface ModelOption {
    id: string
    name: string
    description: string
    badge?: string
}

interface AIPromptBarProps {
    onSendMessage?: (
        message: string,
        files: FileWithPreview[],
        pastedContent: PastedContent[]
    ) => void
    disabled?: boolean
    placeholder?: string
    maxFiles?: number
    maxFileSize?: number // in bytes
    acceptedFileTypes?: string[]
    models?: ModelOption[]
    defaultModel?: string
    onModelChange?: (modelId: string) => void
}

// Constants
const MAX_FILES = 10
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const PASTE_THRESHOLD = 200 // characters threshold for showing as pasted content
const DEFAULT_MODELS_INTERNAL: ModelOption[] = [
    {
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        description: "Balanced model",
        badge: "Latest",
    },
    {
        id: "claude-opus-3.5",
        name: "Claude Opus 3.5",
        description: "Highest intelligence",
    },
    {
        id: "claude-haiku-3",
        name: "Claude Haiku 3",
        description: "Fastest responses",
    },
]

// File type helpers
const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
        return <ImageIcon className="h-5 w-5 text-muted-foreground" />
    if (type.startsWith("video/"))
        return <Video className="h-5 w-5 text-muted-foreground" />
    if (type.startsWith("audio/"))
        return <Music className="h-5 w-5 text-muted-foreground" />
    if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
        return <Archive className="h-5 w-5 text-muted-foreground" />
    return <FileText className="h-5 w-5 text-muted-foreground" />
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    )
}

const getFileTypeLabel = (type: string): string => {
    const parts = type.split("/")
    let label = (parts.at(-1) ?? "").toUpperCase()
    if (label.length > 7 && label.includes("-")) {
        label = label.substring(0, label.indexOf("-"))
    }
    if (label.length > 10) {
        label = label.substring(0, 10) + "..."
    }
    return label
}

const isTextualFile = (file: File): boolean => {
    const textualTypes = [
        "text/",
        "application/json",
        "application/xml",
        "application/javascript",
        "application/typescript",
    ]

    const textualExtensions = [
        "txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "htm", "css",
        "scss", "sass", "json", "xml", "yaml", "yml", "csv", "sql", "sh",
        "bash", "php", "rb", "go", "java", "c", "cpp", "h", "hpp", "cs",
        "rs", "swift", "kt", "scala", "r", "vue", "svelte", "astro",
        "config", "conf", "ini", "toml", "log", "gitignore", "dockerfile",
        "makefile", "readme",
    ]

    const isTextualMimeType = textualTypes.some((type) =>
        file.type.toLowerCase().startsWith(type)
    )

    const extension = file.name.split(".").pop()?.toLowerCase() || ""
    const isTextualExtension =
        textualExtensions.includes(extension) ||
        file.name.toLowerCase().includes("readme") ||
        file.name.toLowerCase().includes("dockerfile") ||
        file.name.toLowerCase().includes("makefile")

    return isTextualMimeType || isTextualExtension
}

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve((e.target?.result as string) || "")
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
    })
}

const getFileExtension = (filename: string): string => {
    const extension = filename.split(".").pop()?.toUpperCase() || "FILE"
    return extension.length > 8 ? extension.substring(0, 8) + "..." : extension
}

// File Preview Card
const FilePreviewCard: React.FC<{
    file: FileWithPreview
    onRemove: (id: string) => void
}> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/")
    const isTextual = isTextualFile(file.file)

    if (isTextual) {
        return <TextualFilePreviewCard file={file} onRemove={onRemove} />
    }

    return (
        <div className="group relative size-31.25 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-md">
            {isImage && file.preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob: preview URL, not an optimizable remote/static asset
                <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3">
                    {getFileIcon(file.type)}
                    <p
                        className="max-w-full truncate text-xs font-medium text-foreground"
                        title={file.file.name}
                    >
                        {file.file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.file.size)}
                    </p>
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-2">
                <span className="pointer-events-auto rounded-md border bg-background px-2 py-1 text-xs capitalize text-foreground">
                    {getFileTypeLabel(file.type)}
                </span>
                <div className="flex items-center gap-1">
                    {file.uploadStatus === "uploading" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    )}
                    {file.uploadStatus === "error" && (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                </div>
            </div>

            <Button
                size="icon"
                variant="outline"
                className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onRemove(file.id)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}

// Pasted Content Card
const PastedContentCard: React.FC<{
    content: PastedContent
    onRemove: (id: string) => void
}> = ({ content, onRemove }) => {
    const previewText = content.content.slice(0, 150)
    const needsTruncation = content.content.length > 150

    return (
        <div className="group relative size-31.25 shrink-0 overflow-hidden rounded-lg border bg-muted p-3 shadow-md">
            <div className="max-h-24 overflow-y-auto whitespace-pre-wrap wrap-break-word text-[8px] text-muted-foreground">
                {previewText}
                {needsTruncation && "..."}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-end p-2">
                <span className="pointer-events-auto rounded-md border bg-background px-2 py-1 text-xs capitalize text-foreground">
                    Pasted
                </span>
            </div>
            <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                    size="icon"
                    variant="outline"
                    className="size-6"
                    onClick={() => navigator.clipboard.writeText(content.content)}
                    title="Copy content"
                >
                    <Copy className="h-3 w-3" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="size-6"
                    onClick={() => onRemove(content.id)}
                    title="Remove content"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

// Model Selector
const ModelSelectorDropdown: React.FC<{
    models: ModelOption[]
    selectedModel: string
    onModelChange: (modelId: string) => void
}> = ({ models, selectedModel, onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedModelData = models.find((m) => m.id === selectedModel) ?? models[0]
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!selectedModelData) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="max-w-37.5 truncate sm:max-w-50">
                    {selectedModelData.name}
                </span>
                <ChevronDown
                    className={cn(
                        "ml-1 h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </Button>

            {isOpen && (
                <div className="absolute bottom-full right-0 z-20 mb-2 w-72 rounded-lg border bg-popover p-2 text-popover-foreground shadow-xl">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md p-2.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                                model.id === selectedModel && "bg-accent"
                            )}
                            onClick={() => {
                                onModelChange(model.id)
                                setIsOpen(false)
                            }}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{model.name}</span>
                                    {model.badge && (
                                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                                            {model.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {model.description}
                                </p>
                            </div>
                            {model.id === selectedModel && (
                                <Check className="h-4 w-4 shrink-0 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// Textual File Preview Card
const TextualFilePreviewCard: React.FC<{
    file: FileWithPreview
    onRemove: (id: string) => void
}> = ({ file, onRemove }) => {
    const previewText = file.textContent?.slice(0, 150) ?? ""
    const needsTruncation = (file.textContent?.length ?? 0) > 150
    const fileExtension = getFileExtension(file.file.name)

    return (
        <div className="group relative size-31.25 shrink-0 overflow-hidden rounded-lg border bg-muted p-3 shadow-md">
            <div className="max-h-24 overflow-y-auto whitespace-pre-wrap wrap-break-word text-[8px] text-muted-foreground">
                {file.textContent ? (
                    <>
                        {previewText}
                        {needsTruncation && "..."}
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-2">
                <span className="pointer-events-auto rounded-md border bg-background px-2 py-1 text-xs capitalize text-foreground">
                    {fileExtension}
                </span>
                <div className="flex items-center gap-1">
                    {file.uploadStatus === "uploading" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    )}
                    {file.uploadStatus === "error" && (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                </div>
            </div>
            <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {file.textContent && (
                    <Button
                        size="icon"
                        variant="outline"
                        className="size-6"
                        onClick={() =>
                            navigator.clipboard.writeText(file.textContent || "")
                        }
                        title="Copy content"
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="outline"
                    className="size-6"
                    onClick={() => onRemove(file.id)}
                    title="Remove file"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

// Main AIPromptBar component
function AIPromptBar({
    onSendMessage,
    disabled = false,
    placeholder = "How can I help you today?",
    maxFiles = MAX_FILES,
    maxFileSize = MAX_FILE_SIZE,
    acceptedFileTypes,
    models = DEFAULT_MODELS_INTERNAL,
    defaultModel,
    onModelChange,
}: AIPromptBarProps) {
    const [message, setMessage] = useState("")
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [pastedContent, setPastedContent] = useState<PastedContent[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [selectedModel, setSelectedModel] = useState(
        defaultModel || models[0]?.id || ""
    )

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            const maxHeight =
                Number.parseInt(getComputedStyle(textareaRef.current).maxHeight, 10) ||
                120
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                maxHeight
            )}px`
        }
    }, [message])

    const handleFileSelect = useCallback(
        (selectedFiles: FileList | null) => {
            if (!selectedFiles) return

            const currentFileCount = files.length
            if (currentFileCount >= maxFiles) {
                alert(
                    `Maximum ${maxFiles} files allowed. Please remove some files to add new ones.`
                )
                return
            }

            const availableSlots = maxFiles - currentFileCount
            const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots)

            if (selectedFiles.length > availableSlots) {
                alert(
                    `You can only add ${availableSlots} more file(s). ${
                        selectedFiles.length - availableSlots
                    } file(s) were not added.`
                )
            }

            const newFiles: FileWithPreview[] = filesToAdd
                .filter((file) => {
                    if (file.size > maxFileSize) {
                        alert(
                            `File ${file.name} (${formatFileSize(
                                file.size
                            )}) exceeds size limit of ${formatFileSize(maxFileSize)}.`
                        )
                        return false
                    }
                    if (
                        acceptedFileTypes &&
                        !acceptedFileTypes.some(
                            (type) =>
                                file.type.includes(type) || type === file.name.split(".").pop()
                        )
                    ) {
                        alert(
                            `File type for ${
                                file.name
                            } not supported. Accepted types: ${acceptedFileTypes.join(", ")}`
                        )
                        return false
                    }
                    return true
                })
                .map((file) => ({
                    id: crypto.randomUUID(),
                    file,
                    preview: file.type.startsWith("image/")
                        ? URL.createObjectURL(file)
                        : undefined,
                    type: file.type || "application/octet-stream",
                    uploadStatus: "pending" as const,
                    uploadProgress: 0,
                }))

            setFiles((prev) => [...prev, ...newFiles])

            newFiles.forEach((fileToUpload) => {
                if (isTextualFile(fileToUpload.file)) {
                    readFileAsText(fileToUpload.file)
                        .then((textContent) => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileToUpload.id ? { ...f, textContent } : f
                                )
                            )
                        })
                        .catch((error) => {
                            console.error("Error reading file content:", error)
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileToUpload.id
                                        ? { ...f, textContent: "Error reading file content" }
                                        : f
                                )
                            )
                        })
                }

                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f
                    )
                )

                let progress = 0
                const interval = setInterval(() => {
                    progress += Math.random() * 20 + 5
                    if (progress >= 100) {
                        progress = 100
                        clearInterval(interval)
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileToUpload.id
                                    ? { ...f, uploadStatus: "complete", uploadProgress: 100 }
                                    : f
                            )
                        )
                    } else {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileToUpload.id
                                    ? { ...f, uploadProgress: progress }
                                    : f
                            )
                        )
                    }
                }, 150)
            })
        },
        [files.length, maxFiles, maxFileSize, acceptedFileTypes]
    )

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === id)
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview)
            }
            return prev.filter((f) => f.id !== id)
        })
    }, [])

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const clipboardData = e.clipboardData
            const items = clipboardData.items

            const fileItems = Array.from(items).filter(
                (item) => item.kind === "file"
            )
            if (fileItems.length > 0 && files.length < maxFiles) {
                e.preventDefault()
                const pastedFiles = fileItems
                    .map((item) => item.getAsFile())
                    .filter(Boolean) as File[]
                const dataTransfer = new DataTransfer()
                pastedFiles.forEach((file) => dataTransfer.items.add(file))
                handleFileSelect(dataTransfer.files)
                return
            }

            const textData = clipboardData.getData("text")
            if (
                textData &&
                textData.length > PASTE_THRESHOLD &&
                pastedContent.length < 5
            ) {
                e.preventDefault()
                setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "...")

                const pastedItem: PastedContent = {
                    id: crypto.randomUUID(),
                    content: textData,
                    timestamp: new Date(),
                    wordCount: textData.split(/\s+/).filter(Boolean).length,
                }

                setPastedContent((prev) => [...prev, pastedItem])
            }
        },
        [handleFileSelect, files.length, maxFiles, pastedContent.length, message]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files) {
                handleFileSelect(e.dataTransfer.files)
            }
        },
        [handleFileSelect]
    )

    const handleSend = useCallback(() => {
        if (
            disabled ||
            (!message.trim() && files.length === 0 && pastedContent.length === 0)
        )
            return
        if (files.some((f) => f.uploadStatus === "uploading")) {
            alert("Please wait for all files to finish uploading.")
            return
        }

        onSendMessage?.(message, files, pastedContent)

        setMessage("")
        files.forEach((file) => {
            if (file.preview) URL.revokeObjectURL(file.preview)
        })
        setFiles([])
        setPastedContent([])
        if (textareaRef.current) textareaRef.current.style.height = "auto"
    }, [message, files, pastedContent, disabled, onSendMessage])

    const handleModelChangeInternal = useCallback(
        (modelId: string) => {
            setSelectedModel(modelId)
            onModelChange?.(modelId)
        },
        [onModelChange]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSend()
            }
        },
        [handleSend]
    )

    const hasContent =
        message.trim() || files.length > 0 || pastedContent.length > 0
    const canSend =
        hasContent &&
        !disabled &&
        !files.some((f) => f.uploadStatus === "uploading")

    return (
        <div className="border-t p-3">
            <div
                className="relative flex flex-col gap-2 rounded-2xl border bg-background p-2"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10">
                        <p className="flex items-center gap-2 text-sm text-primary">
                            <UploadCloud className="size-4" />
                            Drop files here to add to chat
                        </p>
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="max-h-30 min-h-8 resize-none border-none bg-transparent p-1 text-sm shadow-none focus-visible:ring-0"
                />

                {(files.length > 0 || pastedContent.length > 0) && (
                    <div className="flex gap-3 overflow-x-auto border-t pt-3">
                        {pastedContent.map((content) => (
                            <PastedContentCard
                                key={content.id}
                                content={content}
                                onRemove={(id) =>
                                    setPastedContent((prev) => prev.filter((c) => c.id !== id))
                                }
                            />
                        ))}
                        {files.map((file) => (
                            <FilePreviewCard key={file.id} file={file} onRemove={removeFile} />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || files.length >= maxFiles}
                            title={
                                files.length >= maxFiles
                                    ? `Max ${maxFiles} files reached`
                                    : "Attach files"
                            }
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            disabled={disabled}
                            title="Options (not implemented)"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {models.length > 0 && (
                            <ModelSelectorDropdown
                                models={models}
                                selectedModel={selectedModel}
                                onModelChange={handleModelChangeInternal}
                            />
                        )}
                        <Button
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full"
                            onClick={handleSend}
                            disabled={!canSend}
                            title="Send message"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={acceptedFileTypes?.join(",")}
                onChange={(e) => {
                    handleFileSelect(e.target.files)
                    if (e.target) e.target.value = ""
                }}
            />
        </div>
    )
}

export default AIPromptBar
