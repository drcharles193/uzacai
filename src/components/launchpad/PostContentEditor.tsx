
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Image, FileImage, FileVideo, PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import AIPostGenerator from '../AIPostGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    <div className="max-w-3xl mx-auto p-6">
      <div className="font-medium text-lg mb-4 text-gray-800">Create Your Post</div>
      
      <div className="relative mt-2 mb-4">
        <textarea 
          className="w-full min-h-[300px] p-5 rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#689675]/30 focus:border-[#689675] shadow-sm transition-all" 
          placeholder="Start writing your post caption here..." 
          value={postContent} 
          onChange={e => setPostContent(e.target.value)} 
        />
      </div>
      
      {mediaPreviewUrls.length > 0 && (
        <div className="mt-6 mb-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Media Files ({mediaPreviewUrls.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {mediaPreviewUrls.map((url, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Media preview ${index + 1}`} 
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm" 
                />
                <button 
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" 
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
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
      
      <div className="flex justify-between mt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 hover:text-[#689675] hover:border-[#689675] border-gray-200 shadow-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white border border-gray-200 shadow-md rounded-md">
            <DropdownMenuItem onClick={handleDeviceUpload} className="hover:bg-gray-50 cursor-pointer">
              <FileImage className="h-4 w-4 mr-2 text-blue-500" />
              <span>My Device</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Dropbox')} className="hover:bg-gray-50 cursor-pointer">
              <FileVideo className="h-4 w-4 mr-2 text-blue-600" />
              <span>Dropbox</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Google Drive')} className="hover:bg-gray-50 cursor-pointer">
              <FileImage className="h-4 w-4 mr-2 text-green-500" />
              <span>Google Drive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExternalUpload('Box')} className="hover:bg-gray-50 cursor-pointer">
              <FileVideo className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Box</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AIPostGenerator onContentGenerated={handleContentGenerated} />
      </div>
      
      {selectedAccounts.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <strong>Tip:</strong> Select one or more accounts from the "Accounts" tab to publish this post.
        </div>
      )}
    </div>
  );
};

export default PostContentEditor;
