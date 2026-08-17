import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface PostComposerProps {
    onSubmit: (post: { type: string, content: string, attachmentUrl?: string }) => Promise<void>;
}

const PostComposer: React.FC<PostComposerProps> = ({ onSubmit }) => {
    const [type, setType] = useState('ANNOUNCEMENT');
    const [content, setContent] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ type, content, attachmentUrl });
            setContent('');
            setAttachmentUrl('');
        } finally {
            setIsSubmitting(false);
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
                </select>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with your class..."
                className="w-full border rounded p-3 min-h-[100px] mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                required
            />
            <div className="flex items-center gap-4">
                <input 
                    type="url" 
                    value={attachmentUrl} 
                    onChange={(e) => setAttachmentUrl(e.target.value)} 
                    placeholder="Attachment URL (optional)" 
                    className="flex-1 border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button type="submit" disabled={isSubmitting || !content.trim()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                    <Send size={16} /> Post
                </button>
            </div>
        </form>
    );
};
export default PostComposer;
