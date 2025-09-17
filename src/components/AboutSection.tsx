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
    <section className="py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Ride with {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">
                Richard?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              As a native Kenyan with over 15 years of driving experience, I don't just get you 
from A to B – I provide safe, reliable transportation with local expertise. 
From airport pickups to city tours and cross-country trips, every journey is 
handled with professionalism and deep local knowledge.
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

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;