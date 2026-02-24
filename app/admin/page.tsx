"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle, PauseCircle, XCircle, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const motels = useQuery(api.motels.getAllMotelsAdmin);
  const updateMotelStatus = useMutation(api.motels.updateMotelStatus);
  const deleteMotel = useMutation(api.motels.deleteMotel);
  const currentUser = useQuery(api.users.getUser);

  if (!isLoaded || motels === undefined || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-zinc-400 mb-8">Você não tem permissão para acessar esta página.</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium transition-colors">
          Voltar para Home
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (id: any, status: "pending" | "approved" | "paused") => {
    try {
      await updateMotelStatus({ id, status });
      toast.success(`Status atualizado para ${status}`);
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error(error);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Tem certeza que deseja excluir este motel permanentemente?")) {
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
            <h1 className="text-xl font-bold text-white tracking-wider text-red-500">Super Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-white mb-8">Gerenciamento de Motéis</h2>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs text-zinc-300 uppercase bg-zinc-800/50 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Motel</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Plano</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Data de Cadastro</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {motels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Nenhum motel cadastrado.
                    </td>
                  </tr>
                ) : (
                  motels.map((motel) => (
                    <tr key={motel._id} className="border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{motel.name}</div>
                        <div className="text-xs text-zinc-500 mt-1">{motel.location.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                          {motel.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          motel.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          motel.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {motel.status === 'approved' ? 'Aprovado' : motel.status === 'pending' ? 'Pendente' : 'Pausado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(motel.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {motel.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(motel._id, 'approved')}
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {motel.status !== 'paused' && (
                            <button
                              onClick={() => handleStatusChange(motel._id, 'paused')}
                              className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                              title="Pausar"
                            >
                              <PauseCircle className="w-5 h-5" />
                            </button>
                          )}
                          {motel.status !== 'pending' && (
                            <button
                              onClick={() => handleStatusChange(motel._id, 'pending')}
                              className="p-2 text-zinc-400 hover:bg-zinc-400/10 rounded-lg transition-colors"
                              title="Mover para Pendente"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                          <button
                            onClick={() => handleDelete(motel._id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
