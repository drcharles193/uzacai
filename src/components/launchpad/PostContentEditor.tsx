
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import AIPostGenerator from '../AIPostGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileImage, FileVideo } from 'lucide-react';

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
  const { toast } = useToast();

  const handleContentGenerated = (content: string) => {
    setPostContent(content);
  };

  const handleDeviceUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

  const handleExternalUpload = (source: string) => {
    toast({
      title: "External Upload",
      description: `Connect to ${source} to select media (coming soon)`
    });
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Media Removed",
      description: "Media file removed from your post"
    });
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
          {mediaPreviewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Media preview ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md border border-gray-200" 
              />
              <button 
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => removeMedia(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
      />
      
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
            <DropdownMenuItem onClick={handleDeviceUpload} className="hover:bg-[#689675]/10">
              <FileImage className="h-4 w-4 mr-2" />
              <span>My Device</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Dropbox')} className="hover:bg-[#689675]/10">
              <FileVideo className="h-4 w-4 mr-2" />
              <span>Dropbox</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Google Drive')} className="hover:bg-[#689675]/10">
              <FileImage className="h-4 w-4 mr-2" />
              <span>Google Drive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Box')} className="hover:bg-[#689675]/10">
              <FileVideo className="h-4 w-4 mr-2" />
              <span>Box</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AIPostGenerator onContentGenerated={handleContentGenerated} />
      </div>
    </div>
  );
};

export default PostContentEditor;
