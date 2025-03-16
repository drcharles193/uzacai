
import React from 'react';

interface PostPreviewTabProps {
  postContent: string;
  mediaPreviewUrls: string[];
}

const PostPreviewTab: React.FC<PostPreviewTabProps> = ({ postContent, mediaPreviewUrls }) => {
  return (
    <div className="flex flex-col items-center justify-start p-4 border rounded-md h-[500px] overflow-y-auto">
      {postContent ? (
        <>
          <div className="text-gray-700 whitespace-pre-wrap mb-4">{postContent}</div>
          {mediaPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 w-full">
              {mediaPreviewUrls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Media ${index + 1}`} 
                  className="w-full h-auto rounded-md" 
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500 flex items-center justify-center h-full">
          Post preview will appear here
        </div>
      )}
    </div>
  );
};

export default PostPreviewTab;
