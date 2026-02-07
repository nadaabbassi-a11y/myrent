"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { Search, MapPin, Home as HomeIcon, Zap, CheckCircle, ThumbsUp, Headphones, ArrowRight, Bed, Bath, FileText, CreditCard, Plus, Users, Calendar, PenTool, DollarSign, User, Heart } from "lucide-react";
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

  // Scroll reveal animation style Apple
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    
    // Activate hero reveals immediately
    setTimeout(() => {
      const heroReveals = document.querySelectorAll(".wood-pattern .reveal");
      heroReveals.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("active");
        }, index * 200);
      });
    }, 100);

    // Intersection Observer avec threshold progressif pour un effet plus fluide
    const observerOptions = {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          
          // Calculer le pourcentage de visibilité
          const ratio = entry.intersectionRatio;
          
          if (ratio > 0.1) {
            // Ajouter la classe revealed progressivement
            if (!target.classList.contains("revealed")) {
              target.classList.add("revealed");
            }
            
            // Activer les enfants avec reveal class
            const childReveals = target.querySelectorAll(".reveal:not(.active)");
            childReveals.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("active");
              }, index * 100);
            });
          }
        });
      },
      observerOptions
    );

    // Observer toutes les sections avec scroll-reveal
    const scrollRevealElements = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-fade, .scroll-reveal-slide-up, .scroll-reveal-scale, .scroll-reveal-stagger"
    );
    
    scrollRevealElements.forEach((el) => {
      observer.observe(el);
    });

    // Observer sections
    sectionRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    // Observer all reveal elements outside hero
    setTimeout(() => {
      const allReveals = document.querySelectorAll(".reveal:not(.wood-pattern .reveal):not(.active)");
      allReveals.forEach((el) => {
        observer.observe(el);
      });
    }, 500);

    return () => {
      scrollRevealElements.forEach((el) => {
        observer.unobserve(el);
      });
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
          className="relative wood-pattern py-32 md:py-48 overflow-hidden"
        >
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-20">
                <h1 className="text-6xl md:text-8xl font-light mb-8 text-white leading-[1.05] tracking-tight drop-shadow-lg">
                  Trouvez facilement votre{" "}
                  <span className="font-normal">
                    logement
                  </span>
                </h1>
                <p className="text-2xl md:text-3xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                  Recherchez parmi des milliers d'annonces de locations long terme
                </p>
              </div>

              {/* Barre de recherche - Style Apple amélioré */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-2 bg-white rounded-3xl p-3 shadow-2xl border border-neutral-100">
                  <div className="relative flex-1 group">
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-neutral-900" />
                    <input
                      type="text"
                      placeholder="Ville ou quartier"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-14 pr-5 py-5 rounded-2xl border-0 focus:outline-none text-neutral-900 bg-neutral-50 focus:bg-white transition-all duration-300 text-lg font-light placeholder:text-neutral-400"
                    />
                  </div>
                  
                  <div className="relative flex-1 group">
                    <HomeIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none transition-colors group-focus-within:text-neutral-900" />
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full pl-14 pr-10 py-5 rounded-2xl border-0 focus:outline-none text-neutral-900 appearance-none bg-neutral-50 focus:bg-white transition-all duration-300 text-lg font-light cursor-pointer"
                    >
                      <option value="">Type</option>
                      <option value="studio">Studio</option>
                      <option value="1">1 chambre</option>
                      <option value="2">2 chambres</option>
                      <option value="3">3 chambres</option>
                      <option value="4+">4+ chambres</option>
                    </select>
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative flex-1 group">
                    <Zap className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-neutral-900" />
                    <input
                      type="number"
                      placeholder="Budget max"
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      className="w-full pl-14 pr-5 py-5 rounded-2xl border-0 focus:outline-none text-neutral-900 bg-neutral-50 focus:bg-white transition-all duration-300 text-lg font-light placeholder:text-neutral-400"
                    />
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-light py-5 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg min-w-[180px] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Search className="h-5 w-5" />
                    {t("common.search")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Listings - Style Apple */}
        <section 
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <Link href="/listings" className="block group">
              <h2 className="text-5xl md:text-7xl font-light mb-20 text-neutral-900 text-center tracking-tight group-hover:text-neutral-700 transition-colors cursor-pointer scroll-reveal-fade">
                {t("home.discoverTitle")}
              </h2>
            </Link>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto scroll-reveal-stagger">
              {featuredListings.map((listing, index) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <div className="group relative bg-white overflow-hidden transition-all duration-300 hover:opacity-90">
                    <div className="relative h-80 w-full overflow-hidden rounded-2xl mb-6">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    
                    <div className="px-2">
                      <div className="mb-3">
                        <span className="text-2xl font-light text-neutral-900">
                          {listing.price.toLocaleString('fr-CA')} $ / mois
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-light mb-2 text-neutral-900 leading-tight">{listing.title}</h3>
                      <p className="text-lg text-neutral-600 mb-6 flex items-center gap-2 font-light">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        {listing.area}, {listing.city}
                      </p>
                      
                      <div className="flex items-center gap-6 text-base text-neutral-500 mb-8">
                        <span className="flex items-center gap-2 font-light">
                          <Bed className="h-5 w-5 text-neutral-400" />
                          {listing.bedrooms} ch.
                        </span>
                        <span className="flex items-center gap-2 font-light">
                          <Bath className="h-5 w-5 text-neutral-400" />
                          {listing.bathrooms} sdb
                        </span>
                      </div>
                      
                      <div className="text-lg text-neutral-900 font-light group-hover:underline">
                        En savoir plus →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Style Apple */}
        <section 
          ref={(el) => { sectionRefs.current[1] = el; }}
          className="py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 scroll-reveal-slide-up">
              <h2 className="text-5xl md:text-7xl font-light text-neutral-900 mb-6 tracking-tight">
                Tous les outils professionnels
              </h2>
              <p className="text-2xl md:text-3xl text-neutral-600 max-w-2xl mx-auto font-light">
                Une plateforme complète pour gérer vos locations de A à Z
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto scroll-reveal-stagger">
              {/* Publier une annonce */}
              <div className="group">
                <div className="bg-white border-2 border-neutral-100 rounded-3xl p-10 transition-all duration-300 hover:border-neutral-200 hover:shadow-lg h-full flex flex-col">
                  <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-10">
                    <HomeIcon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-light text-neutral-900 mb-6 tracking-tight">Publier une annonce</h3>
                  <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                    Créez et publiez vos annonces en quelques minutes. Les locataires postulent directement en ligne.
                  </p>
                  <div className="mb-10 space-y-4 flex-grow">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Formulaire guidé complet</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Gestion des candidatures</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Calendrier de visites</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Messagerie intégrée</span>
                    </div>
                  </div>
                  <Link href="/auth/signup" className="inline-flex items-center gap-3 text-xl text-neutral-900 font-light hover:gap-4 transition-all mt-auto">
                    Créer une annonce
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
              
              {/* Gestion des contrats */}
              <div className="group">
                <div className="bg-white border-2 border-neutral-100 rounded-3xl p-10 transition-all duration-300 hover:border-neutral-200 hover:shadow-lg h-full flex flex-col">
                  <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-10">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-light text-neutral-900 mb-6 tracking-tight">Gestion des contrats</h3>
                  <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                    Baux conformes à la législation québécoise, signature électronique et stockage sécurisé.
                  </p>
                  <div className="mb-10 space-y-4 flex-grow">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Génération automatique</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Signature électronique</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Stockage sécurisé 24/7</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Export PDF</span>
                    </div>
                  </div>
                  <Link href="/auth/signup" className="inline-flex items-center gap-3 text-xl text-neutral-900 font-light hover:gap-4 transition-all mt-auto">
                    Voir les contrats
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
              
              {/* Collecte des loyers */}
              <div className="group">
                <div className="bg-white border-2 border-neutral-100 rounded-3xl p-10 transition-all duration-300 hover:border-neutral-200 hover:shadow-lg h-full flex flex-col">
                  <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-10">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-light text-neutral-900 mb-6 tracking-tight">Collecte des loyers</h3>
                  <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light">
                    Paiements en ligne sécurisés, suivi en temps réel et reçus automatiques.
                  </p>
                  <div className="mb-10 space-y-4 flex-grow">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Paiements Stripe sécurisés</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Suivi en temps réel</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Reçus automatiques</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-neutral-900 flex-shrink-0" />
                      <span className="text-lg text-neutral-700 font-light">Rappels automatiques</span>
                    </div>
                  </div>
                  <Link href="/auth/signup" className="inline-flex items-center gap-3 text-xl text-neutral-900 font-light hover:gap-4 transition-all mt-auto">
                    Gérer les paiements
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comment ça marche - Style Apple */}
        <section 
          ref={(el) => { sectionRefs.current[2] = el; }}
          className="py-32 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 scroll-reveal-slide-up">
              <h2 className="text-5xl md:text-7xl font-light text-neutral-900 mb-6 tracking-tight">
                Comment ça marche ?
              </h2>
              <p className="text-2xl md:text-3xl text-neutral-600 max-w-3xl mx-auto font-light">
                Un processus simple et efficace pour les propriétaires et les locataires
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-20 max-w-7xl mx-auto">
              {/* Pour les propriétaires */}
              <div className="relative">
                {/* Ligne verticale de connexion animée */}
                <div className="absolute left-8 top-24 bottom-8 w-1 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 opacity-30 rounded-full">
                  <div className="absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-slate-500 to-slate-400 rounded-full animate-[flowDown_8s_ease-in-out_infinite]"></div>
                </div>
                
                {/* En-tête avec effet premium */}
                <div className="relative mb-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-transparent rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative flex items-center gap-4 pb-8 border-b-2 border-gradient-to-r from-slate-200 via-slate-300 to-slate-200">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform duration-500 border-2 border-white/30">
                        <HomeIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-slate-400/50 to-slate-600/50 rounded-2xl blur-lg opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-neutral-900 mb-1">Pour les propriétaires</h3>
                      <p className="text-sm text-neutral-500 font-medium">5 étapes simples</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-12">
                  {/* Étape 1 - Carte 3D interactive */}
                  <div className="relative group reveal">
                    {/* Carte principale avec effet 3D */}
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      {/* Bordure animée au survol */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        {/* Icône avec effet 3D */}
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            {/* Ombre portée 3D */}
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            {/* Cercle principal */}
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <Plus className="h-9 w-9 text-white transform group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                            {/* Badge numéro */}
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              1
                            </div>
                            {/* Particules animées */}
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Créez votre annonce</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Remplissez le formulaire avec les informations de votre logement : photos, prix, adresse, caractéristiques. L'annonce est publiée immédiatement.
                          </p>
                          {/* Barre de progression visuelle */}
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flèche de connexion animée */}
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 2 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <Users className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              2
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Recevez des candidatures</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Les locataires postulent en ligne avec leur dossier complet. Vous recevez une notification pour chaque nouvelle candidature.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 3 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <Calendar className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              3
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Organisez les visites</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Utilisez le calendrier intégré pour proposer des créneaux. Les locataires peuvent réserver directement.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 4 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <PenTool className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              4
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Générez et signez le bail</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Le système génère automatiquement un bail conforme. Vous et le locataire signez électroniquement. Document stocké en sécurité.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 5 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <DollarSign className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              5
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Collectez les loyers</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Les locataires paient en ligne via Stripe. Vous suivez les paiements en temps réel et générez des reçus automatiquement.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pour les locataires */}
              <div className="relative">
                {/* Ligne verticale de connexion animée */}
                <div className="absolute left-8 top-24 bottom-8 w-1 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 opacity-30 rounded-full">
                  <div className="absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-slate-500 to-slate-400 rounded-full animate-[flowDown_8s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
                </div>
                
                {/* En-tête avec effet premium */}
                <div className="relative mb-16">
                  <div className="absolute inset-0 bg-gradient-to-l from-slate-50 to-transparent rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative flex items-center gap-4 pb-8 border-b-2 border-gradient-to-r from-slate-200 via-slate-300 to-slate-200">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform duration-500 border-2 border-white/30">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-slate-400/50 to-slate-600/50 rounded-2xl blur-lg opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-neutral-900 mb-1">Pour les locataires</h3>
                      <p className="text-sm text-neutral-500 font-medium">5 étapes simples</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-12">
                  {/* Étape 1 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <Search className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              1
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Recherchez un logement</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Parcourez les annonces, utilisez les filtres (prix, localisation, caractéristiques) et consultez les photos détaillées.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 2 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <User className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              2
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Complétez votre profil</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Remplissez votre dossier locataire une seule fois : informations personnelles, revenus, références. Utilisé pour toutes vos candidatures.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 3 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <Heart className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              3
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Postulez et visitez</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Candidaturez en un clic pour les logements qui vous intéressent. Réservez un créneau de visite ou demandez un rendez-vous.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 4 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <FileText className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              4
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Signez votre bail</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Si votre candidature est acceptée, le propriétaire génère le bail. Vous le signez électroniquement en ligne. Document accessible à tout moment.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-10 top-full mt-2 w-1 h-14 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-300 rounded-full transform group-hover:scale-y-110 transition-transform duration-500">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                    <ArrowRight className="absolute left-8 top-[calc(100%+3.5rem)] h-6 w-6 text-slate-500 transform group-hover:translate-x-2 transition-transform duration-500" />
                  </div>

                  {/* Étape 5 */}
                  <div className="relative group reveal">
                    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-100 transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/0 via-slate-500/50 to-slate-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-3xl bg-white"></div>
                      
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <div className="relative w-20 h-20 transform group-hover:rotate-6 transition-transform duration-500">
                            <div className="absolute inset-0 bg-slate-700/20 rounded-2xl blur-xl transform translate-y-2"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform group-hover:scale-110 transition-all duration-500">
                              <CreditCard className="h-9 w-9 text-white transform group-hover:scale-125 transition-transform duration-500" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-base font-black shadow-xl border-[3px] border-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              5
                            </div>
                            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-0 left-1/2 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-black text-neutral-900 text-2xl">Payez vos loyers</h4>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            Payez vos loyers en ligne de manière sécurisée. Consultez votre solde, l'historique des paiements et téléchargez vos reçus à tout moment.
                          </p>
                          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Style Apple */}
        <section 
          ref={(el) => { sectionRefs.current[3] = el; }}
          className="py-32 bg-white"
        >
          <div className="container mx-auto px-6 text-center scroll-reveal-slide-up">
            <h2 className="text-5xl md:text-7xl font-light text-neutral-900 mb-6 tracking-tight">
              Prêt à commencer ?
            </h2>
            <p className="text-2xl md:text-3xl text-neutral-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Rejoignez des centaines de propriétaires et locataires qui utilisent déjà notre plateforme pour simplifier leurs locations.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/signup">
                <button className="bg-neutral-900 hover:bg-neutral-800 text-white font-light text-lg py-4 px-10 rounded-xl transition-all duration-200 flex items-center gap-3">
                  Créer un compte gratuit
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/listings">
                <button className="text-neutral-900 hover:text-neutral-700 font-light text-lg py-4 px-10 rounded-xl transition-all duration-200 border-2 border-neutral-900 hover:border-neutral-700">
                  Voir les annonces
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
