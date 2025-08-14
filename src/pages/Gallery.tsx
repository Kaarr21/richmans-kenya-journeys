import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      title: "Maasai Mara Wildlife",
      category: "Safari",
      description: "Witness the Great Migration in Maasai Mara",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "Mount Kenya Climbing",
      category: "Adventure",
      description: "Conquer Africa's second highest peak",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Amboseli Elephants",
      category: "Wildlife",
      description: "Close encounters with elephant herds",
      image: "/placeholder.svg",
    },
    {
      id: 4,
      title: "Lake Nakuru Flamingos",
      category: "Bird Watching",
      description: "Pink flamingo paradise",
      image: "/placeholder.svg",
    },
    {
      id: 5,
      title: "Coastal Beach Resort",
      category: "Beach",
      description: "Relax at pristine Kenyan coastline",
      image: "/placeholder.svg",
    },
    {
      id: 6,
      title: "Cultural Village Visit",
      category: "Culture",
      description: "Experience authentic Kenyan traditions",
      image: "/placeholder.svg",
    },
  ];

  const categories = ["All", "Safari", "Adventure", "Wildlife", "Bird Watching", "Beach", "Culture"];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-safari-sunset/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">Gallery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the breathtaking beauty of Kenya through our lens. From majestic wildlife to stunning landscapes, 
              these photos capture the essence of what awaits you on your journey.
            </p>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((image) => (
                <Card key={image.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] bg-gradient-to-br from-safari-earth to-safari-green relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                        <Badge variant="secondary" className="mb-2">
                          {image.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{image.title}</h3>
                    <p className="text-muted-foreground mb-3">{image.description}</p>
                    <Badge variant="outline">{image.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary to-safari-sunset">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Your Own Memories?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book your Kenya adventure today and experience these incredible destinations firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/book-tour"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Book Your Tour
              </a>
              <a
                href="/#contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Richard
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;