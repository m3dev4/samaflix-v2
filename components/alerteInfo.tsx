"use client";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Film, MessageCircle, Rocket, Sparkles } from "lucide-react";

const AlerteInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedSamaflix");
    if (!hasVisited) {
      setIsOpen(true);
      localStorage.setItem("hasVisitedSamaflix", "true");
    }
  }, []);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md md:max-w-lg lg:max-w-xl fixed inset-0 m-auto h-auto max-h-[90vh] overflow-y-auto bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-4 md:p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bienvenue sur Samaflix
            </h2>
          </div>
          <AlertDialogDescription className="space-y-4 md:space-y-6 text-gray-200">
            <p className="text-base md:text-lg flex items-center gap-2">
              <Rocket className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
              <span>Nous sommes ravis de vous accueillir sur notre plateforme de streaming ✨</span>
            </p>

            <div className="space-y-2 md:space-y-3 bg-gray-800/50 p-3 md:p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                <Film className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                <span>Comment fonctionne Samaflix ? 🎬</span>
              </h3>
              <p className="text-xs md:text-sm leading-relaxed font-popins font-semibold">
                Samaflix ne stocke pas de fichiers, mais propose des liens vers des services externes. 
                Les problèmes juridiques doivent être traités avec les fournisseurs et les hébergeurs de fichiers. 
                Les fichiers multimédias diffusés par les fournisseurs de vidéos ne sont pas couverts par Samaflix.
              </p>
            </div>

            <div className="space-y-2 md:space-y-3 bg-gray-800/50 p-3 md:p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                <span>Aidez-nous à améliorer Samaflix 🌟</span>
              </h3>
              <p className="text-xs md:text-sm leading-relaxed font-popins font-semibold">
                Si vous ne trouvez pas un film ou rencontrez un lien non disponible, n'hésitez pas à nous laisser un message. 
                Vos retours nous aident à enrichir notre catalogue et à maintenir des liens actifs. 💪
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 md:mt-6">
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 md:py-4 text-sm md:text-base rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            onClick={() => setIsOpen(false)}
          >
            ✨ Commencer à explorer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlerteInfo;