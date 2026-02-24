"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, Edit, Save, ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const motels = useQuery(api.motels.getMyMotels);
  const createMotel = useMutation(api.motels.createMotel);
  const updateMotel = useMutation(api.motels.updateMotel);
  const deleteMotel = useMutation(api.motels.deleteMotel);
  const storeUser = useMutation(api.users.storeUser);

  const [isCreating, setIsCreating] = useState(false);
  const [editingMotel, setEditingMotel] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tripadvisor, setTripadvisor] = useState("");
  const [hours, setHours] = useState("");
  const [twoHours, setTwoHours] = useState("");
  const [fourHours, setFourHours] = useState("");
  const [twelveHours, setTwelveHours] = useState("");
  const [services, setServices] = useState("");
  const [accessories, setAccessories] = useState("");
  const [photos, setPhotos] = useState<{id: string, url: string}[]>([]);

  useEffect(() => {
    if (user) {
      storeUser({
        name: user.fullName || user.firstName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
      }).catch(console.error);
    }
  }, [user, storeUser]);

  if (!isLoaded || motels === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  const resetForm = () => {
    setName("");
    setDescription("");
    setPlan("free");
    setLat("");
    setLng("");
    setAddress("");
    setPhone("");
    setWhatsapp("");
    setTripadvisor("");
    setHours("");
    setTwoHours("");
    setFourHours("");
    setTwelveHours("");
    setServices("");
    setAccessories("");
    setPhotos([]);
    setEditingMotel(null);
    setIsCreating(false);
  };

  const handleEdit = (motel: any) => {
    setEditingMotel(motel);
    setName(motel.name);
    setDescription(motel.description);
    setPlan(motel.plan);
    setLat(motel.location.lat.toString());
    setLng(motel.location.lng.toString());
    setAddress(motel.location.address);
    setPhone(motel.phone || "");
    setWhatsapp(motel.whatsapp || "");
    setTripadvisor(motel.tripadvisor || "");
    setHours(motel.hours || "");
    setTwoHours(motel.periods?.twoHours || "");
    setFourHours(motel.periods?.fourHours || "");
    setTwelveHours(motel.periods?.twelveHours || "");
    setServices(motel.services?.join(", ") || "");
    setAccessories(motel.accessories?.join(", ") || "");
    
    // Map existing photos
    if (motel.photos && motel.photoUrls) {
      const mappedPhotos = motel.photos
        .map((id: string, i: number) => ({
          id,
          url: motel.photoUrls[i]
        }))
        .filter((p: any) => p.url !== null);
      setPhotos(mappedPhotos);
    } else {
      setPhotos([]);
    }
    
    setIsCreating(true);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        toast.success("Localização obtida com sucesso!");
      }, () => {
        toast.error("Não foi possível obter a localização.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !lat || !lng) {
      toast.error("Nome, endereço e coordenadas são obrigatórios");
      return;
    }

    try {
      const payload = {
        name,
        description,
        plan,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          address,
        },
        phone,
        whatsapp,
        tripadvisor,
        hours,
        periods: {
          twoHours,
          fourHours,
          twelveHours,
        },
        services: services.split(",").map(s => s.trim()).filter(Boolean),
        accessories: accessories.split(",").map(s => s.trim()).filter(Boolean),
        photos: photos.map(p => p.id as any),
      };

      if (editingMotel) {
        await updateMotel({ id: editingMotel._id, ...payload });
        toast.success("Motel atualizado com sucesso");
      } else {
        await createMotel(payload);
        toast.success("Motel criado com sucesso");
      }
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar motel");
      console.error(error);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Tem certeza que deseja excluir este motel?")) {
      try {
        await deleteMotel({ id });
        toast.success("Motel excluído");
      } catch (error) {
        toast.error("Erro ao excluir motel");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white tracking-wider">Painel do Proprietário</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-sm text-zinc-400 hover:text-white font-medium transition-colors">
              Conta
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isCreating ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Meus Motéis</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Motel
              </button>
            </div>

            {motels.length === 0 ? (
              <div className="bg-zinc-900 p-12 rounded-2xl border border-zinc-800 text-center">
                <p className="text-zinc-400 mb-4">Você ainda não cadastrou nenhum motel.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Começar agora
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {motels.map((motel) => (
                  <div
                    key={motel._id}
                    className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-6 items-start"
                  >
                    <div className="w-full md:w-48 h-32 bg-zinc-800 rounded-xl overflow-hidden relative shrink-0">
                      {motel.photoUrls && motel.photoUrls.length > 0 && motel.photoUrls[0] ? (
                        <Image src={motel.photoUrls[0]} alt={motel.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">Sem foto</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{motel.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          motel.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          motel.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {motel.status === 'approved' ? 'Aprovado' : motel.status === 'pending' ? 'Pendente' : 'Pausado'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                          Plano {motel.plan}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{motel.description}</p>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {motel.location.address}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <button
                        onClick={() => handleEdit(motel)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(motel._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {editingMotel ? "Editar Motel" : "Cadastrar Novo Motel"}
              </h2>
              <button
                onClick={resetForm}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Motel *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Plano</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as "free" | "premium")}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="free">Gratuito (Até 3 fotos)</option>
                      <option value="premium">Premium (Fotos ilimitadas)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Fotos</h3>
                <ImageUpload 
                  onUpload={(id, url) => setPhotos(prev => [...prev, {id, url}])} 
                  maxFiles={plan === 'free' ? 3 : 10}
                  existingPhotos={photos}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Localização</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Endereço Completo *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Longitude *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-lg transition-colors flex items-center justify-center shrink-0"
                        title="Pegar minha localização atual"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Contato e Links</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 9999-9999"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="5511999999999"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Link do TripAdvisor</label>
                    <input
                      type="url"
                      value={tripadvisor}
                      onChange={(e) => setTripadvisor(e.target.value)}
                      placeholder="https://www.tripadvisor.com.br/..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Periods & Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Períodos e Valores</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Valor 2 Horas</label>
                    <input
                      type="text"
                      value={twoHours}
                      onChange={(e) => setTwoHours(e.target.value)}
                      placeholder="R$ 80,00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Valor 4 Horas</label>
                    <input
                      type="text"
                      value={fourHours}
                      onChange={(e) => setFourHours(e.target.value)}
                      placeholder="R$ 120,00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Valor 12 Horas</label>
                    <input
                      type="text"
                      value={twelveHours}
                      onChange={(e) => setTwelveHours(e.target.value)}
                      placeholder="R$ 200,00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Comodidades</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Serviços (separados por vírgula)</label>
                    <textarea
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Room service 24h, Wi-Fi, Garagem privativa..."
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Acessórios da Suíte (separados por vírgula)</label>
                    <textarea
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      placeholder="Hidromassagem, Pole dance, Cadeira erótica..."
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20"
                >
                  <Save className="w-5 h-5" />
                  {editingMotel ? "Salvar Alterações" : "Cadastrar Motel"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
