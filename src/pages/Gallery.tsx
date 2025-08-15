import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      title: "Maasai Mara Safari",
      location: "Maasai Mara National Reserve",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Mount Kenya Adventure",
      location: "Mount Kenya National Park",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Coastal Paradise",
      location: "Diani Beach",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Lake Nakuru Wildlife",
      location: "Lake Nakuru National Park",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Amboseli Elephants",
      location: "Amboseli National Park",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Tsavo East Adventure",
      location: "Tsavo East National Park",
      image: "/placeholder.svg"
    }
  ];

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
              Explore the breathtaking beauty of Kenya through our curated collection 
              of safari moments and adventures captured by Richard and our guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={image.image}
                      alt={image.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                      <p className="text-sm opacity-90">{image.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;