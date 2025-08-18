import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera } from "lucide-react";

const ToursSection = () => {
  const destinations = [
    {
      id: 1,
      title: "Maasai Mara National Reserve",
      description: "Witness the Great Migration and the Big Five in Kenya's most famous wildlife reserve.",
      location: "Narok County, Kenya",
      image: "masai-mara"
    },
    {
      id: 2,
      title: "Mount Kenya", 
      description: "Africa's second-highest peak offering breathtaking alpine scenery and diverse ecosystems.",
      location: "Central Kenya",
      image: "mount-kenya"
    },
    {
      id: 3,
      title: "Diani Beach",
      description: "Pristine white sand beaches and crystal-clear waters on Kenya's stunning coast.",
      location: "Kwale County, Kenya",
      image: "diani-beach"
    },
    {
      id: 4,
      title: "Amboseli National Park",
      description: "Famous for its large elephant herds with magnificent views of Mount Kilimanjaro.",
      location: "Kajiado County, Kenya",
      image: "amboseli"
    },
    {
      id: 5,
      title: "Lake Nakuru",
      description: "Spectacular flamingo populations and diverse wildlife in the Great Rift Valley.",
      location: "Nakuru County, Kenya",
      image: "lake-nakuru"
    },
    {
      id: 6,
      title: "Tsavo National Parks",
      description: "Kenya's largest national parks known for red elephants and diverse landscapes.",
      location: "Coast Province, Kenya",
      image: "tsavo"
    }
  ];

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
            Discover the breathtaking destinations Richard has explored across Kenya. 
            From wildlife safaris to mountain adventures and coastal escapes.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-safari-earth to-safari-green relative overflow-hidden">
                {/* Image placeholder - replace with actual destination images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-bold text-lg mb-1">{destination.title}</h3>
                    <div className="flex items-center text-sm opacity-90">
                      <MapPin className="h-4 w-4 mr-1" />
                      {destination.location}
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {destination.description}
                </p>
              </CardContent>
            </Card>
          ))}
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
          >
            Request Custom Tour
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ToursSection;