"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { confirmPayment } from '@/app/actions/payment';

function SimulationPaiementContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount') ? Number(searchParams.get('amount')) : 0;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!orderId || amount <= 0) {
            router.push('/');
        }
    }, [orderId, amount, router]);

    const handlePay = async () => {
        if (!orderId) return;
        setIsProcessing(true);
        // Simulation d'un délai bancaire satim
        setTimeout(async () => {
            const result = await confirmPayment(orderId);
            setIsProcessing(false);
            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => router.push('/client-dashboard'), 3000);
            } else {
                alert("Erreur lors de la validation du paiement.");
            }
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] text-white flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Paiement Accepté !</h1>
                <p className="text-gray-400">Votre commande est désormais validée. Redirection vers votre tableau de bord...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center p-6 font-sans">
            <div className="bg-[#2c2c2e] p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700">

                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-white">Passerelle Sécurisée</h1>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-white text-black font-bold px-2 py-1 rounded">CIB</span>
                        <span className="text-[10px] bg-[#ffdb58] text-black font-bold px-2 py-1 rounded">EDAHABIA</span>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-gray-400 text-sm mb-1">Montant à payer</p>
                    <p className="text-4xl font-black text-white">{amount.toLocaleString('fr-DZ')} <span className="text-lg text-gray-400">DZD</span></p>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Numéro de Carte (Simulation)</label>
                        <input type="text" value="0000 0000 0000 0000" readOnly className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg p-3 text-white text-center tracking-[4px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Date d'expiration</label>
                            <input type="text" value="12/28" readOnly className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg p-3 text-white text-center" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">CVC</label>
                            <input type="text" value="123" readOnly className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg p-3 text-white text-center tracking-[2px]" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="w-full bg-[#00A15D] hover:bg-[#008a4f] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Validation...
                        </>
                    ) : (
                        `Payer ${amount.toLocaleString('fr-DZ')} DZD`
                    )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Moteur de paiement Chargily V2 Sandbox (Test)
                </p>
            </div>
        </div>
    );
}

export default function SimulationPaiementPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white">Chargement du portail de paiement...</div>}>
            <SimulationPaiementContent />
        </Suspense>
    );
}
