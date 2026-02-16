import type { Service } from "./store"

export const categories = [
  { id: "cleaning", name: "Cleaning", icon: "sparkles", color: "#007BFF" },
  { id: "plumbing", name: "Plumbing", icon: "build", color: "#46A3FF" },
  { id: "electrical", name: "Electrical", icon: "flash", color: "#FFB800" },
  { id: "painting", name: "Painting", icon: "brush", color: "#FF6B6B" },
  { id: "carpentry", name: "Carpentry", icon: "hammer", color: "#8B4513" },
  { id: "appliance", name: "Appliance", icon: "settings", color: "#6B7280" },
  { id: "pest", name: "Pest Control", icon: "bug", color: "#10B981" },
  { id: "salon", name: "Salon at Home", icon: "cut", color: "#EC4899" },
]

export const services: Service[] = [
  // Cleaning Services
  {
    id: "clean-1",
    name: "Deep Home Cleaning",
    description:
      "Complete deep cleaning of your home including all rooms, bathrooms, and kitchen. Our experts use eco-friendly products.",
    price: 1499,
    originalPrice: 1999,
    duration: "3-4 hours",
    image: "https://static.wixstatic.com/media/b4ca61_4f38273ed6a241738b30e30b5ba4184a~mv2.png/v1/fill/w_764,h_382,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/b4ca61_4f38273ed6a241738b30e30b5ba4184a~mv2.png",
    rating: 4.8,
    reviews: 2453,
    category: "cleaning",
  },
  {
    id: "clean-2",
    name: "Bathroom Cleaning",
    description: "Thorough bathroom cleaning including tiles, fixtures, and sanitization.",
    price: 499,
    originalPrice: 699,
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    rating: 4.7,
    reviews: 1876,
    category: "cleaning",
  },
  {
    id: "clean-3",
    name: "Kitchen Cleaning",
    description: "Deep cleaning of kitchen including chimney, cabinets, and appliances.",
    price: 799,
    originalPrice: 999,
    duration: "2-3 hours",
    image: "https://img.freepik.com/premium-photo/man-cleaning-kitchen-stove-with-detergent-spray-bottle-cloth_368093-8425.jpg",
    rating: 4.9,
    reviews: 3241,
    category: "cleaning",
  },
  {
    id: "clean-4",
    name: "Sofa Cleaning",
    description: "Professional sofa and upholstery cleaning with stain removal.",
    price: 599,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1664372899370-7548c9a0f427?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 987,
    category: "cleaning",
  },
  // Plumbing Services
  {
    id: "plumb-1",
    name: "Tap & Mixer Repair",
    description: "Expert repair and replacement of taps and mixers.",
    price: 199,
    duration: "30-60 mins",
    image: "https://johnnyrooter.com/wp-content/uploads/2025/02/AdobeStock_1026063643.webp",
    rating: 4.5,
    reviews: 1234,
    category: "plumbing",
  },
  {
    id: "plumb-2",
    name: "Drain Cleaning",
    description: "Professional drain cleaning and blockage removal.",
    price: 349,
    duration: "1-2 hours",
    image: "https://www.arrowsewernj.com/wp-content/uploads/2023/08/worker-cleaning-clogged-drain-with-hydro-jetting.jpg",
    rating: 4.4,
    reviews: 876,
    category: "plumbing",
  },
  {
    id: "plumb-3",
    name: "Water Tank Cleaning",
    description: "Complete water tank cleaning and sanitization service.",
    price: 899,
    originalPrice: 1199,
    duration: "2-3 hours",
    image: "https://www.clee.in/wp-content/uploads/2022/08/Water-Tank-Cleaning.jpg",
    rating: 4.7,
    reviews: 654,
    category: "plumbing",
  },
  // Electrical Services
  {
    id: "elec-1",
    name: "Fan Installation",
    description: "Professional ceiling fan installation and repair.",
    price: 249,
    duration: "30-45 mins",
    image: "https://images.unsplash.com/photo-1632394128474-b8c3dca00f83?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 1567,
    category: "electrical",
  },
  {
    id: "elec-2",
    name: "Wiring & Cabling",
    description: "Complete electrical wiring and cabling solutions.",
    price: 499,
    duration: "1-3 hours",
    image: "https://icanelectricians.ca/mississauga/wp-content/uploads/sites/5/2023/04/Safe-And-Reliable-Electrical-Services.webp",
    rating: 4.8,
    reviews: 2134,
    category: "electrical",
  },
  {
    id: "elec-3",
    name: "Switchboard Repair",
    description: "Switchboard repair, replacement and installation.",
    price: 299,
    duration: "30-60 mins",
    image: "https://plus.unsplash.com/premium_photo-1682086495085-0a73efeac2b7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.5,
    reviews: 987,
    category: "electrical",
  },
  // Painting Services
  {
    id: "paint-1",
    name: "Full Home Painting",
    description: "Complete home painting with premium quality paints.",
    price: 8999,
    originalPrice: 12999,
    duration: "3-5 days",
    image: "https://plus.unsplash.com/premium_photo-1683121602687-60c47b2222f0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    reviews: 876,
    category: "painting",
  },
  {
    id: "paint-2",
    name: "Single Room Painting",
    description: "Professional painting for a single room.",
    price: 2499,
    duration: "1-2 days",
    image: "https://plus.unsplash.com/premium_photo-1661890842404-e1aa074dbff5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 1234,
    category: "painting",
  },
  // Appliance Services
  {
    id: "app-1",
    name: "AC Service & Repair",
    description: "Complete AC servicing including gas refill and cleaning.",
    price: 449,
    originalPrice: 599,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1682126009570-3fe2399162f7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 3456,
    category: "appliance",
  },
  {
    id: "app-2",
    name: "Washing Machine Repair",
    description: "Expert washing machine repair and servicing.",
    price: 349,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1661342406124-740ae7a0dd0e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.5,
    reviews: 2134,
    category: "appliance",
  },
  {
    id: "app-3",
    name: "Refrigerator Repair",
    description: "Professional refrigerator repair and gas refilling.",
    price: 399,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1661342490985-26da70d07a52?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 1876,
    category: "appliance",
  },
  // Salon Services
  {
    id: "salon-1",
    name: "Haircut for Women",
    description: "Professional haircut at your home by expert stylists.",
    price: 399,
    duration: "30-45 mins",
    image: "https://img.freepik.com/free-photo/beautiful-woman-has-cutting-hair-hairdresser_329181-1942.jpg",
    rating: 4.8,
    reviews: 4567,
    category: "salon",
  },
  {
    id: "salon-2",
    name: "Facial & Cleanup",
    description: "Relaxing facial and cleanup with premium products.",
    price: 599,
    originalPrice: 799,
    duration: "45-60 mins",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    rating: 4.9,
    reviews: 3245,
    category: "salon",
  },
  {
    id: "salon-3",
    name: "Manicure & Pedicure",
    description: "Complete manicure and pedicure service at home.",
    price: 699,
    duration: "1-1.5 hours",
    image: "https://plus.unsplash.com/premium_photo-1661290231745-15f1ed6fea88?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 2876,
    category: "salon",
    
    
  },
  // Pest Control
  {
    id: "pest-1",
    name: "General Pest Control",
    description: "Complete pest control for cockroaches, ants, and spiders.",
    price: 999,
    originalPrice: 1499,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1722054517666-50bb22954e53?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 1567,
    category: "pest",
  },
  {
    id: "pest-2",
    name: "Termite Control",
    description: "Advanced termite control treatment for your home.",
    price: 2999,
    duration: "3-4 hours",
    image: "https://plus.unsplash.com/premium_photo-1661304818621-0fceeb066f2d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.8,
    reviews: 876,
    category: "pest",
  },
  // Carpentry
  {
    id: "carp-1",
    name: "Furniture Assembly",
    description: "Professional furniture assembly and installation.",
    price: 299,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1744995489299-63637165ac0f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.5,
    reviews: 1234,
    category: "carpentry",
  },
  {
    id: "carp-2",
    name: "Door Repair",
    description: "Door repair, alignment, and lock installation.",
    price: 349,
    duration: "1-2 hours",
    image: "https://plus.unsplash.com/premium_photo-1683133371786-7f5be08d5a5e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 987,
    category: "carpentry",
  },
  // Add this inside the export const services array
  // Add these to the 'services' array in services-data.ts
{
  id: "salon-men-1", 
  name: "Men's Haircut & Styling",
  description: "Professional haircut and hair styling by expert barbers at your home.",
  price: 249,
  originalPrice: 399,
  duration: "30-45 mins",
  //image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800", // New professional barber image
   image: "https://images.unsplash.com/photo-1695173122226-3a932002ab33?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rating: 4.8,
  reviews: 1240,
  category: "salon",
},
{
  id: "salon-men-2", 
  name: "Beard Grooming & Trim",
  description: "Shape and trim your beard for a sharp, clean look.",
  price: 149,
  originalPrice: 199,
  duration: "20-30 mins",
  image: "https://plus.unsplash.com/premium_photo-1664303521711-bff2aee233b7?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rating: 4.7,
  reviews: 850,
  category: "salon",
},
]

export const getServicesByCategory = (categoryId: string) => {
  return services.filter((service) => service.category === categoryId)
}

export const getServiceById = (id: string) => {
  return services.find((service) => service.id === id)
}

// export const getFeaturedServices = () => {
//   return services.filter((service) => service.originalPrice).slice(0, 6)
// }

export const getFeaturedServices = (limit?: number) => {
  const featuredServices = services.filter(
    (service) => service.originalPrice
  )

  return typeof limit === "number"
    ? featuredServices.slice(0, limit)
    : featuredServices
}

// export const getPopularServices = () => {
//   return [...services].sort((a, b) => b.reviews - a.reviews).slice(0, 6)
// }


export const getPopularServices = (limit?: number) => {
  const sorted = [...services].sort(
    (a, b) => b.reviews - a.reviews
  )

  return typeof limit === "number"
    ? sorted.slice(0, limit)
    : sorted
}
