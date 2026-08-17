import React from 'react';

interface Post {
    id: number;
    type: string;
    content: string;
    attachmentUrl?: string;
    authorName: string;
    createdAt: string;
}

const PostList: React.FC<{ posts: Post[] }> = ({ posts }) => {
    const getTypeColor = (type: string) => {
        switch(type) {
            case 'ANNOUNCEMENT': return 'bg-yellow-100 text-yellow-800';
            case 'MATERIAL': return 'bg-blue-100 text-blue-800';
            case 'DOCUMENT': return 'bg-red-100 text-red-800';
            case 'LINK': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (posts.length === 0) {
        return <div className="text-center py-10 text-gray-500">No posts yet.</div>;
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                {post.authorName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{post.authorName}</p>
                                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(post.type)}`}>
                            {post.type}
                        </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    {post.attachmentUrl && (
                        <div className="mt-4 p-3 border rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                📎 {post.attachmentUrl}
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
export default PostList;
