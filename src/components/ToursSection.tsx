import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, LocationResponse } from "@/lib/api";

const ToursSection = () => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const displayLocations = locations;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">
              Kenya's Destinations
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience safe and reliable taxi services in Nairobi with a trusted local driver. 
From airport transfers to city tours and cross-country trips, we provide 
comfortable transportation with a personal touch.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : displayLocations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No destinations uploaded yet. Check back soon for amazing locations!</p>
            </div>
          ) : (
            displayLocations.map((location) => (
              <Card key={location.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {location.image_url ? (
                    <img 
                      src={location.image_url} 
                      alt={location.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-safari-earth to-safari-green" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">{location.title}</h3>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {location.description || "Discover this amazing destination with Richard!"}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Don't see exactly what you're looking for? I create custom itineraries for every adventure.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/book-tour')}
          >
            Request Custom Tour
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ToursSection;
