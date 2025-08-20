import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Upload image to storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `locations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('locations')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('locations')
        .getPublicUrl(filePath);

      // Save location to database
      const { error: dbError } = await supabase
        .from('locations')
        .insert([{
          title,
          description,
          image_url: publicUrl,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (dbError) throw dbError;

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

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!showForm) {
    return (
      <Card>
        <CardContent className="p-6">
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Add New Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add New Location</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowForm(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Location Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunset at Maasai Mara"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the story behind this amazing location..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image">Photo</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {image && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {image.name}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? "Uploading..." : "Add Location"}
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