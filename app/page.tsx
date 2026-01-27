"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { Search, MapPin, Home as HomeIcon, Zap, CheckCircle, ThumbsUp, Headphones, ArrowRight, Bed, Bath } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Données des listings les plus intéressants pour la page d'accueil
const featuredListings = [
  {
    id: "1",
    title: "Studio meublé – Plateau",
    price: 1450,
    city: "Montréal",
    area: "Plateau Mont-Royal",
    bedrooms: 0,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
  },
  {
    id: "2",
    title: "3½ – Rosemont",
    price: 1250,
    city: "Montréal",
    area: "Rosemont",
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
  },
  {
    id: "3",
    title: "Appartement 4½ – Centre-ville",
    price: 1800,
    city: "Montréal",
    area: "Ville-Marie",
    bedrooms: 2,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
  }
];

export default function Home() {
  const router = useRouter();
  const { t } = useLanguageContext();
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchBudget, setSearchBudget] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Effet parallaxe pour le hero
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    
    // Activate hero reveals immediately
    setTimeout(() => {
      const heroReveals = document.querySelectorAll(".hero-gradient .reveal");
      heroReveals.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("active");
        }, index * 200);
      });
    }, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Also activate all child elements with reveal class
            const childReveals = entry.target.querySelectorAll(".reveal:not(.active)");
            childReveals.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("active");
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Observe sections
    sectionRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    // Observe all reveal elements outside hero
    setTimeout(() => {
      const allReveals = document.querySelectorAll(".reveal:not(.hero-gradient .reveal):not(.active)");
      allReveals.forEach((el) => {
        observer.observe(el);
      });
    }, 500);

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (searchType) params.set("type", searchType);
    if (searchBudget) params.set("budget", searchBudget);
    router.push(`/listings?${params.toString()}`);
  };

  // Générer des particules uniquement côté client pour éviter l'erreur d'hydratation
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    left: number;
    top: number;
    animationDelay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Générer les particules uniquement côté client
    if (typeof window === "undefined") return;
    
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
    })));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section avec barre de recherche */}
        <section 
          ref={heroRef}
          className="relative hero-gradient py-24 md:py-40 overflow-hidden perspective-3d"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`,
          }}
        >
          {/* Particules flottantes */}
          {particles.length > 0 && (
            <div className="floating-particles">
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="particle"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    animationDelay: `${particle.animationDelay}s`,
                    animationDuration: `${particle.duration}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Gradient mesh animé */}
          <div className="absolute inset-0 gradient-mesh opacity-30"></div>

          {/* Background image avec blur */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-5 blur-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent"></div>
          </div>

          {/* Morphing blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 morphing-blob bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 morphing-blob bg-gradient-to-br from-indigo-400/20 to-blue-400/20 blur-3xl" style={{ animationDelay: '2s' }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 reveal">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl leading-[1.1] pb-2">
                  Trouvez facilement votre{" "}
                  <span className="text-shimmer inline-block leading-[1.1] pb-1">
                    logement
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light reveal" style={{ animationDelay: '0.2s' }}>
                  Recherchez parmi des milliers d'annonces de locations long terme
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="glass-premium rounded-3xl shadow-2xl p-8 md:p-10 light-sweep reveal" style={{ animationDelay: '0.4s' }}>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 transition-colors group-focus-within:text-violet-600" />
                    <input
                      type="text"
                      placeholder="Ville ou quartier"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none text-gray-900 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="relative group">
                    <HomeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none text-gray-900 appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                    >
                      <option value="">Type</option>
                      <option value="studio">Studio</option>
                      <option value="1">1 chambre</option>
                      <option value="2">2 chambres</option>
                      <option value="3">3 chambres</option>
                      <option value="4+">4+ chambres</option>
                    </select>
                  </div>
                  
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 transition-colors group-focus-within:text-violet-600" />
                    <input
                      type="number"
                      placeholder="Budget max"
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none text-gray-900 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transform hover:scale-105 shine-effect"
                  >
                    <Search className="h-5 w-5" />
                    {t("common.search")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Listings */}
        <section 
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full gradient-mesh opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-gray-900 text-center reveal">
              <span className="text-shimmer">{t("home.discoverTitle")}</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredListings.map((listing, index) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <div className="group relative bg-white rounded-3xl overflow-hidden depth-shadow depth-shadow-hover transition-all duration-700 border border-gray-100 transform hover:-translate-y-4 card-3d reveal" style={{ animationDelay: `${index * 150}ms` }}>
                    <div className="absolute top-5 left-5 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-2xl text-sm backdrop-blur-sm pulse-glow">
                      {listing.price.toLocaleString('fr-CA')} $ / mois
                    </div>
                    
                    <div className="relative h-72 w-full overflow-hidden wave-animation">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-150 transition-transform duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                    </div>
                    
                    <div className="p-7">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-violet-600 transition-colors">{listing.title}</h3>
                      <p className="text-gray-600 mb-5 flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-violet-500" />
                        {listing.area}, {listing.city}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Bed className="h-4 w-4 text-violet-500" />
                          {listing.bedrooms} ch.
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Bath className="h-4 w-4 text-violet-500" />
                          {listing.bathrooms} sdb
                        </span>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <HomeIcon className="h-4 w-4" />
                        Dans votre budget
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={(el) => { sectionRefs.current[1] = el; }}
          className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh opacity-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-gray-900 text-center reveal">
              {t("home.featuresTitle")} <span className="text-shimmer">MyRent</span> ?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Link href="/about" className="text-center group p-10 rounded-3xl bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-violet-50 hover:to-indigo-50 transition-all duration-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-4 card-3d reveal cursor-pointer">
                <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pulse-glow">
                  <CheckCircle className="h-14 w-14 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-violet-600 transition-colors">{t("home.verifiedListings")}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t("home.verifiedListingsDesc")}
                </p>
                <div className="inline-flex items-center gap-2 text-violet-600 font-semibold group-hover:gap-3 transition-all">
                  {t("home.learnMore")}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              
              <Link href="/listings" className="text-center group p-10 rounded-3xl bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 transition-all duration-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-4 card-3d reveal cursor-pointer" style={{ animationDelay: '0.2s' }}>
                <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pulse-glow">
                  <ThumbsUp className="h-14 w-14 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors">{t("home.easyAndFast")}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t("home.easyAndFastDesc")}
                </p>
                <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                  {t("home.viewListings")}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              
              <Link href="/contact" className="text-center group p-10 rounded-3xl bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-4 card-3d reveal cursor-pointer" style={{ animationDelay: '0.4s' }}>
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pulse-glow">
                  <Headphones className="h-14 w-14 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">{t("home.support")}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t("home.supportDesc")}
                </p>
                <div className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  {t("home.contactUs")}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={(el) => { sectionRefs.current[2] = el; }}
          className="py-32 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden light-sweep"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 morphing-blob bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 morphing-blob bg-white rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 morphing-blob bg-yellow-200/30 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <div className="absolute inset-0 gradient-mesh opacity-20"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-7xl font-extrabold mb-8 reveal">
              {t("home.title")}
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto font-light reveal" style={{ animationDelay: '0.2s' }}>
              {t("home.subtitle")}
            </p>
            <Link href="/auth/signup" className="inline-block reveal group" style={{ animationDelay: '0.4s' }}>
              <button className="bg-white text-violet-600 hover:bg-gray-50 font-bold py-6 px-14 rounded-3xl transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-110 text-lg transform pulse-glow flex items-center justify-center mx-auto">
                {t("home.cta")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
