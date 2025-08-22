// src/components/LocationUpload.tsx - Enhanced version
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus, Image as ImageIcon } from "lucide-react";
import { apiClient } from "@/lib/api";

interface LocationUploadProps {
  onLocationAdded: () => void;
}

interface ImageWithCaption {
  file: File;
  preview: string;
  caption: string;
}

const LocationUpload = ({ onLocationAdded }: LocationUploadProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageWithCaption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageWithCaption[] = [];
    const remainingSlots = 5 - images.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          caption: ""
        });
      }
    }

    if (newImages.length + images.length > 5) {
      toast({
        title: "Warning",
        description: "Maximum 5 images allowed per location",
        variant: "destructive"
      });
      return;
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title",
        variant: "destructive"
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description.trim()) {
        formData.append('description', description);
      }

      // Add images
      images.forEach((img, index) => {
        formData.append('images', img.file);
      });

      // Add captions (only non-empty ones)
      const captions = images.map(img => img.caption || '');
      captions.forEach((caption, index) => {
        formData.append('captions', caption);
      });

      await apiClient.createLocation(formData);

      toast({
        title: "Success",
        description: "Location added successfully!"
      });

      // Reset form
      setTitle("");
      setDescription("");
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setShowForm(false);
      onLocationAdded();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload location: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="mb-6">
        <Button 
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Location
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Add New Location</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false);
              setTitle("");
              setDescription("");
              images.forEach(img => URL.revokeObjectURL(img.preview));
              setImages([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Location Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Maasai Mara National Reserve"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this location..."
              rows={3}
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <Label>Photos (1-5 images) *</Label>
            
            {/* Upload Button */}
            {images.length < 5 && (
              <div className="mt-2 mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageAdd}
                  className="hidden"
                  id="imageUpload"
                />
                <Label 
                  htmlFor="imageUpload"
                  className="inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Add Photos ({images.length}/5)
                </Label>
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative border rounded-lg p-3">
                    <div className="relative aspect-video mb-2">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Photo {index + 1}</span>
                        <div className="flex gap-1">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveImage(index, index - 1)}
                              className="h-6 w-6 p-0"
                            >
                              ←
                            </Button>
                          )}
                          {index < images.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveImage(index, index + 1)}
                              className="h-6 w-6 p-0"
                            >
                              →
                            </Button>
                          )}
                        </div>
                      </div>
                      <Input
                        placeholder="Caption (optional)"
                        value={image.caption}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading || images.length === 0}>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Location
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LocationUpload;
