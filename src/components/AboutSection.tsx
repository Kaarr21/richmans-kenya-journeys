import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Users, Heart } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: <Star className="h-6 w-6" />,
      title: "Local Expertise",
      description: "Born and raised in Kenya, I know every hidden gem and cultural secret."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certified Guide",
      description: "Licensed tour guide with 15+ years of professional experience."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personal Touch",
      description: "Small groups, personalized itineraries, and genuine local connections."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Passion for Kenya",
      description: "Dedicated to showcasing the true beauty and culture of my homeland."
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Travel with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">
                Richard?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              As a native Kenyan with over 15 years of guiding experience, I don't just show you 
              Kenya – I help you experience it authentically. From the Big Five in Maasai Mara 
              to the vibrant culture of local communities, every journey is crafted with passion 
              and deep local knowledge.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-primary mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
            >
              Meet Richard
            </Button>
          </div>

          {/* Image placeholder - you can replace with actual Richard's photo */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-safari-earth to-safari-green rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-white text-center">
                <Users className="h-24 w-24 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Richard's Photo</p>
                <p className="text-sm opacity-75">Your Trusted Guide</p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-safari-sunset/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;