import React from 'react';

interface Post {
    id: number;
    type: string;
    content: string;
    attachmentUrl?: string;
    authorName: string;
    createdAt: string;
    title?: string;
    dueDate?: string;
}

interface PostListProps {
    posts: Post[];
    isTeacher?: boolean;
    classroomId?: string;
    onEditPost?: (post: Post) => void;
    onViewSubmissions?: (postId: number) => void;
    onUploadAssignment?: (postId: number) => void;
    onDeletePost?: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, isTeacher, classroomId, onEditPost, onViewSubmissions, onUploadAssignment, onDeletePost }) => {
    const getTypeColor = (type: string) => {
        switch(type) {
            case 'ANNOUNCEMENT': return 'bg-yellow-100 text-yellow-800';
            case 'MATERIAL': return 'bg-primary/20 text-primary-dark';
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
                <div key={post.id} className={`bg-white dark:bg-gray-800 border ${post.type === 'ASSIGNMENT' ? 'border-primary/50 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm'} rounded-lg p-5`}>
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
                        <div className="flex gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(post.type)}`}>
                                {post.type}
                            </span>
                            {isTeacher && onEditPost && (
                                <button onClick={() => onEditPost(post)} className="text-xs font-medium text-gray-500 hover:text-primary transition-colors px-2 py-1 border border-gray-200 rounded dark:border-gray-700">
                                    Edit
                                </button>
                            )}
                            {isTeacher && onDeletePost && (
                                <button onClick={() => onDeletePost(post.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 border border-red-200 rounded dark:border-red-800">
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {post.type === 'ASSIGNMENT' && post.title && (
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h4>
                    )}
                    
                    {post.type === 'ASSIGNMENT' && post.dueDate && (
                        <p className="text-sm font-medium text-red-500 mb-3">
                            Due: {new Date(post.dueDate).toLocaleString()}
                        </p>
                    )}
                    
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    {post.attachmentUrl && (
                        <div className="mt-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex items-center">
                            <a href={post.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span className="truncate max-w-[300px] sm:max-w-md">
                                    {post.attachmentUrl.includes('/api/files/') 
                                        ? decodeURIComponent(post.attachmentUrl.split('/api/files/')[1].substring(post.attachmentUrl.split('/api/files/')[1].indexOf('_') + 1))
                                        : (post.attachmentUrl.length > 50 ? post.attachmentUrl.substring(0, 47) + '...' : post.attachmentUrl)}
                                </span>
                            </a>
                        </div>
                    )}
                    
                    {post.type === 'ASSIGNMENT' && (
                        <div className="mt-4 flex gap-2">
                            {isTeacher ? (
                                <button onClick={() => onViewSubmissions && onViewSubmissions(post.id)} className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    View Submissions
                                </button>
                            ) : (
                                <button onClick={() => onUploadAssignment && onUploadAssignment(post.id)} className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Upload Assignment
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
export default PostList;
