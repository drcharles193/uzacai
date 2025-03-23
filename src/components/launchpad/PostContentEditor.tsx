
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Link, Upload, Video, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import AIPostGenerator from '../AIPostGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface PostContentEditorProps {
  postContent: string;
  setPostContent: React.Dispatch<React.SetStateAction<string>>;
  mediaFiles: File[];
  setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  mediaPreviewUrls: string[];
  setMediaPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAccounts: string[];
}

const PostContentEditor: React.FC<PostContentEditorProps> = ({
  postContent,
  setPostContent,
  mediaFiles,
  setMediaFiles,
  mediaPreviewUrls,
  setMediaPreviewUrls,
  selectedAccounts
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  const handleContentGenerated = (content: string) => {
    setPostContent(content);
  };

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setMediaPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    toast({
      title: "Media Added",
      description: `Added ${newFiles.length} media files to your post`
    });
  };

  const handleAddMediaUrl = () => {
    if (!mediaUrl.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    // Add the URL to preview urls
    setMediaPreviewUrls(prev => [...prev, mediaUrl]);
    
    toast({
      title: "Media URL Added",
      description: "External media URL has been added to your post"
    });
    
    // Reset the URL input
    setMediaUrl('');
    setShowUrlInput(false);
  };

  const removeMedia = (index: number) => {
    // Revoke object URL if it's a blob URL to prevent memory leaks
    if (mediaPreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreviewUrls[index]);
    }
    
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Media Removed",
      description: "Media has been removed from your post"
    });
  };

  const renderMediaPreview = (url: string, index: number) => {
    // Check if the URL is for a video (either by file extension or mime type)
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || 
                   (mediaFiles[index]?.type && mediaFiles[index].type.startsWith('video/'));
    
    return (
      <div key={index} className="relative group">
        {isVideo ? (
          <video 
            src={url} 
            className="w-full h-24 object-cover rounded-md border border-gray-200"
            controls={false}
          />
        ) : (
          <img 
            src={url} 
            alt={`Media preview ${index + 1}`} 
            className="w-full h-24 object-cover rounded-md border border-gray-200" 
          />
        )}
        <button 
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={() => removeMedia(index)}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div className="font-medium text-lg">Original Draft</div>
      <div className="relative mt-2">
        <textarea 
          className="w-full min-h-[300px] p-4 rounded-md border border-border resize-none focus:outline-none focus:ring-1 focus:ring-[#689675]" 
          placeholder="Start writing post caption or..." 
          value={postContent} 
          onChange={e => setPostContent(e.target.value)} 
        />
      </div>
      
      {mediaPreviewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {mediaPreviewUrls.map((url, index) => renderMediaPreview(url, index))}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />
      
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={handleFileChange} 
        accept="video/*" 
        multiple 
        className="hidden" 
      />
      
      {showUrlInput && (
        <div className="mt-4 flex gap-2">
          <Input
            type="url"
            placeholder="Enter media URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddMediaUrl}>Add</Button>
          <Button size="sm" variant="outline" onClick={() => setShowUrlInput(false)}>Cancel</Button>
        </div>
      )}
      
      <div className="flex justify-end mt-2 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-500 hover:text-[#689675] hover:border-[#689675] tooltip-wrapper"
            >
              <Upload className="h-4 w-4 mr-1" />
              Add Media
              <span className="tooltip absolute bg-black text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none group-hover:opacity-100">
                Add Media
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-[#689675]/20">
            <DropdownMenuItem onClick={handlePhotoUpload} className="hover:bg-[#689675]/10">
              <Image className="h-4 w-4 mr-2" />
              <span>Photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleVideoUpload} className="hover:bg-[#689675]/10">
              <Video className="h-4 w-4 mr-2" />
              <span>Video</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowUrlInput(true)} className="hover:bg-[#689675]/10">
              <Link className="h-4 w-4 mr-2" />
              <span>URL</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AIPostGenerator onContentGenerated={handleContentGenerated} />
      </div>
    </div>
  );
};

export default PostContentEditor;
