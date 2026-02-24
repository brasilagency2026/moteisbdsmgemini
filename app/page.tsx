"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, Navigation, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function Home() {
  const motels = useQuery(api.motels.getApprovedMotels);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [selectedMotel, setSelectedMotel] = useState<any | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const sortedMotels = motels ? [...motels].sort((a, b) => {
    if (!userLoc) return 0;
    const distA = calculateDistance(userLoc.lat, userLoc.lng, a.location.lat, a.location.lng);
    const distB = calculateDistance(userLoc.lat, userLoc.lng, b.location.lat, b.location.lng);
    return distA - distB;
  }) : [];

  const openModal = (motel: any) => {
    setSelectedMotel(motel);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMotel && selectedMotel.photoUrls) {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedMotel.photoUrls.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMotel && selectedMotel.photoUrls) {
      setCurrentPhotoIndex((prev) => (prev - 1 + selectedMotel.photoUrls.length) % selectedMotel.photoUrls.length);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="absolute top-0 w-full z-20 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="https://i.ibb.co/NdHzfGQ6/symbolbdsmtransparent.png" 
              alt="BDSMBRAZIL Logo" 
              width={48} 
              height={48} 
              className="object-contain"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <span className="text-2xl font-bold tracking-widest text-white uppercase">BDSMBRAZIL</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/sign-up" className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors">
                Cadastrar Motel
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Painel
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://i.ibb.co/jFjp6nh/grok-image-28e567e3-b224-45cb-aa3c-3d11b5bda95f-1.jpg"
            alt="Motel Background"
            fill
            className="object-cover opacity-60"
            priority
            referrerPolicy="no-referrer"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Encontre o Motel Perfeito
          </h1>
          <p className="text-xl text-zinc-300 mb-8">
            Descubra os melhores motéis perto de você. Privacidade, luxo e conforto.
          </p>
          {userLoc ? (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white border border-white/20">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>Mostrando motéis próximos a você</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white border border-white/20">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span>Buscando sua localização...</span>
            </div>
          )}
        </div>
      </section>

      {/* Motels List */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-white">Motéis Próximos</h2>
        
        {!motels ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-red-500" />
          </div>
        ) : sortedMotels.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            Nenhum motel encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedMotels.map((motel) => (
              <div 
                key={motel._id} 
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-500/50 transition-colors cursor-pointer group"
                onClick={() => openModal(motel)}
              >
                <div className="relative h-64 w-full">
                  {motel.photoUrls && motel.photoUrls.length > 0 && motel.photoUrls[0] ? (
                    <Image 
                      src={motel.photoUrls[0]} 
                      alt={motel.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-600">Sem foto</span>
                    </div>
                  )}
                  {motel.plan === 'premium' && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Premium
                    </div>
                  )}
                  {userLoc && (
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {calculateDistance(userLoc.lat, userLoc.lng, motel.location.lat, motel.location.lng).toFixed(1)} km
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{motel.name}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{motel.description}</p>
                  
                  <div className="flex gap-3">
                    {motel.whatsapp && (
                      <a 
                        href={`https://wa.me/${motel.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">WhatsApp</span>
                      </a>
                    )}
                    <a 
                      href={`https://waze.com/ul?ll=${motel.location.lat},${motel.location.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm font-medium">Navegar</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Motel Details Modal */}
      {selectedMotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMotel(null)} />
          <div className="relative bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 shadow-2xl flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelectedMotel(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Carousel */}
            <div className="w-full md:w-1/2 relative h-[300px] md:h-auto min-h-[400px] bg-black">
              {selectedMotel.photoUrls && selectedMotel.photoUrls.length > 0 && selectedMotel.photoUrls[currentPhotoIndex] ? (
                <>
                  <Image 
                    src={selectedMotel.photoUrls[currentPhotoIndex]} 
                    alt={`${selectedMotel.name} photo ${currentPhotoIndex + 1}`} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedMotel.photoUrls.length > 1 && (
                    <>
                      <button 
                        onClick={prevPhoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={nextPhoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedMotel.photoUrls.map((_: any, i: number) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${i === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  Sem fotos disponíveis
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedMotel.name}</h2>
              <p className="text-zinc-400 mb-6">{selectedMotel.location.address}</p>
              
              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Descrição</h4>
                  <p className="text-zinc-300 leading-relaxed">{selectedMotel.description}</p>
                </div>

                {selectedMotel.periods && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Períodos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMotel.periods.twoHours && (
                        <div className="bg-zinc-800 p-3 rounded-xl text-center border border-zinc-700">
                          <div className="text-xs text-zinc-400 mb-1">2 Horas</div>
                          <div className="font-bold text-white">{selectedMotel.periods.twoHours}</div>
                        </div>
                      )}
                      {selectedMotel.periods.fourHours && (
                        <div className="bg-zinc-800 p-3 rounded-xl text-center border border-zinc-700">
                          <div className="text-xs text-zinc-400 mb-1">4 Horas</div>
                          <div className="font-bold text-white">{selectedMotel.periods.fourHours}</div>
                        </div>
                      )}
                      {selectedMotel.periods.twelveHours && (
                        <div className="bg-zinc-800 p-3 rounded-xl text-center border border-zinc-700">
                          <div className="text-xs text-zinc-400 mb-1">12 Horas</div>
                          <div className="font-bold text-white">{selectedMotel.periods.twelveHours}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {selectedMotel.services && selectedMotel.services.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Serviços</h4>
                      <ul className="space-y-1">
                        {selectedMotel.services.map((s: string, i: number) => (
                          <li key={i} className="text-zinc-300 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedMotel.accessories && selectedMotel.accessories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Acessórios</h4>
                      <ul className="space-y-1">
                        {selectedMotel.accessories.map((s: string, i: number) => (
                          <li key={i} className="text-zinc-300 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-3">
                {selectedMotel.whatsapp && (
                  <a 
                    href={`https://wa.me/${selectedMotel.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </a>
                )}
                {selectedMotel.phone && (
                  <a 
                    href={`tel:${selectedMotel.phone.replace(/\D/g, '')}`} 
                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">Ligar</span>
                  </a>
                )}
                <a 
                  href={`https://waze.com/ul?ll=${selectedMotel.location.lat},${selectedMotel.location.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  <span className="font-medium">Waze</span>
                </a>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedMotel.location.lat},${selectedMotel.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Maps</span>
                </a>
                {selectedMotel.tripadvisor && (
                  <a 
                    href={selectedMotel.tripadvisor}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="font-medium">Ver no TripAdvisor</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
