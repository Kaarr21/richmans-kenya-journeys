import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, MapPin } from "lucide-react";

const ToursSection = () => {
  const tours = [
    {
      id: 1,
      title: "Maasai Mara Big Five Safari",
      description: "Experience Kenya's most famous wildlife reserve with the Big Five and the Great Migration.",
      duration: "3-5 Days",
      groupSize: "2-8 People",
      price: "$450/day",
      rating: 4.9,
      features: ["Game Drives", "Maasai Culture", "Hot Air Balloon", "Luxury Camps"],
      image: "safari-1"
    },
    {
      id: 2,
      title: "Mount Kenya Hiking Adventure", 
      description: "Conquer Africa's second-highest peak with breathtaking views and diverse ecosystems.",
      duration: "4-7 Days",
      groupSize: "2-6 People", 
      price: "$320/day",
      rating: 4.8,
      features: ["Mountain Climbing", "Alpine Lakes", "Wildlife Spotting", "Local Guides"],
      image: "mountain-1"
    },
    {
      id: 3,
      title: "Coastal Culture & Beaches",
      description: "Discover the Swahili culture, pristine beaches, and historic sites of the Kenyan coast.",
      duration: "2-4 Days",
      groupSize: "2-10 People",
      price: "$280/day", 
      rating: 4.7,
      features: ["Beach Relaxation", "Cultural Sites", "Snorkeling", "Local Cuisine"],
      image: "coast-1"
    },
    {
      id: 4,
      title: "Nairobi City & National Park",
      description: "Urban safari experience with city highlights and unique wildlife encounters near the capital.",
      duration: "1-2 Days", 
      groupSize: "2-12 People",
      price: "$180/day",
      rating: 4.6,
      features: ["City Tour", "Urban Wildlife", "Cultural Centers", "Local Markets"],
      image: "city-1"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Popular{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">
              Safari Tours
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Carefully crafted experiences that showcase the best of Kenya's wildlife, 
            culture, and natural beauty. Each tour is customizable to your preferences.
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {tours.map((tour) => (
            <Card key={tour.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-safari-earth to-safari-green relative overflow-hidden">
                {/* Image placeholder - replace with actual tour images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-6">
                  <MapPin className="h-12 w-12 text-white/70" />
                </div>
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  Best Seller
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {tour.title}
                  </CardTitle>
                  <div className="flex items-center space-x-1 text-safari-gold">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{tour.rating}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {tour.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {tour.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{tour.groupSize}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {tour.price}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button variant="outline" className="flex-1">
                    Learn More
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90">
                    Book Now
                  </Button>
                </div>
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