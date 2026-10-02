import React, { useState, useRef } from 'react';
import { Send, Upload, Link as LinkIcon, X } from 'lucide-react';
import client from '../../api/client';

interface PostComposerProps {
    onSubmit: (post: { type: string, title?: string, content: string, dueDate?: string, attachmentUrl?: string }) => Promise<void>;
}

const PostComposer: React.FC<PostComposerProps> = ({ onSubmit }) => {
    const [type, setType] = useState('ANNOUNCEMENT');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isLinkMode, setIsLinkMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ 
                type, 
                title: type === 'ASSIGNMENT' ? title : undefined, 
                content, 
                dueDate: type === 'ASSIGNMENT' && dueDate ? new Date(dueDate).toISOString() : undefined, 
                attachmentUrl 
            });
            setContent('');
            setTitle('');
            setDueDate('');
            setAttachmentUrl('');
            setIsLinkMode(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await client.post('/teacher/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setAttachmentUrl(res.data.fileDownloadUri);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Post Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded p-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="MATERIAL">Material</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="LINK">Link</option>
                    <option value="ASSIGNMENT">Assignment</option>
                </select>
            </div>
            
            {type === 'ASSIGNMENT' && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Assignment Title"
                        className="flex-1 border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                </div>
            )}
            
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with your class..."
                className="w-full border rounded p-3 min-h-[100px] mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
            />
            
            {attachmentUrl && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
                    <div className="truncate flex-1 font-medium mr-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>
                            {attachmentUrl.includes('/api/files/') 
                                ? decodeURIComponent(attachmentUrl.split('/api/files/')[1].substring(attachmentUrl.split('/api/files/')[1].indexOf('_') + 1))
                                : (attachmentUrl.length > 50 ? attachmentUrl.substring(0, 47) + '...' : attachmentUrl)}
                        </span>
                    </div>
                    <button type="button" onClick={() => setAttachmentUrl('')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 flex gap-2 w-full">
                    {!attachmentUrl && !isLinkMode && (
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                className="hidden"
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile || isSubmitting}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded text-sm transition-colors"
                            >
                                <Upload size={16} />
                                {uploadingFile ? 'Uploading...' : 'Upload File'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsLinkMode(true)}
                                disabled={uploadingFile || isSubmitting}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded text-sm transition-colors"
                            >
                                <LinkIcon size={16} />
                                Add Link
                            </button>
                        </div>
                    )}
                    
                    {!attachmentUrl && isLinkMode && (
                        <div className="flex w-full gap-2 relative">
                            <input 
                                type="url" 
                                value={attachmentUrl} 
                                onChange={(e) => setAttachmentUrl(e.target.value)} 
                                placeholder="Paste URL here..." 
                                className="flex-1 border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            {attachmentUrl === '' && (
                                <button type="button" onClick={() => setIsLinkMode(false)} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                <button type="submit" disabled={isSubmitting || uploadingFile || !content.trim()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50 font-medium transition-colors shadow-sm">
                    <Send size={16} /> Post
                </button>
            </div>
        </form>
    );
};
export default PostComposer;
