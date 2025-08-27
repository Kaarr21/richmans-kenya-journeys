// src/pages/Gallery.tsx - Enhanced with multi-image viewer
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { apiClient, LocationResponse } from "@/lib/api";

const Gallery = () => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationResponse | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await apiClient.getLocations();
      setLocations(response.results || []);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openImageViewer = (location: LocationResponse, imageIndex: number = 0) => {
    setSelectedLocation(location);
    setCurrentImageIndex(imageIndex);
  };

  const nextImage = () => {
    if (selectedLocation && selectedLocation.images) {
      setCurrentImageIndex((prev) => 
        prev < selectedLocation.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const previousImage = () => {
    if (selectedLocation && selectedLocation.images) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : selectedLocation.images.length - 1
      );
    }
  };

  const getCurrentImage = () => {
    if (!selectedLocation || !selectedLocation.images || !selectedLocation.images[currentImageIndex]) {
      return null;
    }
    return selectedLocation.images[currentImageIndex];
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Safari Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience safe and reliable taxi services in Kenya with a trusted local driver. 
From airport transfers to city tours and cross-country trips, we provide 
comfortable transportation with a personal touch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : locations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No photos uploaded yet. Check back soon!</p>
              </div>
            ) : (
              locations.map((location) => (
                <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative" onClick={() => openImageViewer(location, 0)}>
                      <img
                        src={location.image_url || location.primary_image_url}
                        alt={location.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/400/300';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Image count badge */}
                      {location.images && location.images.length > 1 && (
                        <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {location.images.length}
                        </Badge>
                      )}
                      
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-semibold">{location.title}</h3>
                        {location.description && (
                          <p className="text-sm opacity-90 line-clamp-2">{location.description}</p>
                        )}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View {location.images?.length || 1} Image{location.images?.length !== 1 ? 's' : ''}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Image Viewer Modal */}
          <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0">
              {selectedLocation && (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedLocation.title}</h2>
                      {selectedLocation.images && selectedLocation.images.length > 1 && (
                        <p className="text-sm text-muted-foreground">
                          {currentImageIndex + 1} of {selectedLocation.images.length}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLocation(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Display */}
                  <div className="flex-1 relative bg-black/5 flex items-center justify-center">
                    {getCurrentImage() && (
                      <>
                        <img
                          src={getCurrentImage()?.image_url}
                          alt={getCurrentImage()?.caption || selectedLocation.title}
                          className="max-w-full max-h-[60vh] object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/800/600';
                          }}
                        />
                        
                        {/* Navigation buttons for multiple images */}
                        {selectedLocation.images && selectedLocation.images.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute left-4 top-1/2 transform -translate-y-1/2"
                              onClick={previousImage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Image info and thumbnails */}
                  <div className="p-4 border-t">
                    {getCurrentImage()?.caption && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {getCurrentImage()?.caption}
                      </p>
                    )}
                    
                    {selectedLocation.description && (
                      <p className="text-sm mb-4">{selectedLocation.description}</p>
                    )}

                    {/* Thumbnail strip for multiple images */}
                    {selectedLocation.images && selectedLocation.images.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {selectedLocation.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                              index === currentImageIndex ? 'border-primary' : 'border-border'
                            }`}
                          >
                            <img
                              src={image.image_url}
                              alt={image.caption || `Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
