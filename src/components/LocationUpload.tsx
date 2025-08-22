
// src/components/LocationUpload.tsx - Type fixes
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { apiClient } from "@/lib/api";

interface LocationUploadProps {
  onLocationAdded: () => void;
}

const LocationUpload = ({ onLocationAdded }: LocationUploadProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !image) {
      toast({
        title: "Error",
        description: "Please provide a title and select an image",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      formData.append('image', image);

      await apiClient.createLocation(formData);

      toast({
        title: "Success",
        description: "Location added successfully!"
      });

      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);
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

  // Rest of component remains the same...
  return (
    <>
      {/* Component JSX remains the same */}
    </>
  );
};

export default LocationUpload;
