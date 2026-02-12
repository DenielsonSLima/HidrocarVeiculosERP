import React, { useRef } from 'react';
import { EstoqueService } from '../estoque.service';
import { IVeiculoFoto } from '../estoque.types';

interface Props {
  fotos: IVeiculoFoto[];
  onChange: (fotos: IVeiculoFoto[]) => void;
}

const PhotoUpload: React.FC<Props> = ({ fotos, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        setIsUploading(true);
        // Upload real para o Supabase Storage via serviço
        const publicUrl = await EstoqueService.uploadFoto(file);

        const newFoto: IVeiculoFoto = {
          id: crypto.randomUUID(),
          url: publicUrl,
          ordem: fotos.length,
          is_capa: fotos.length === 0
        };

        onChange([...fotos, newFoto]);
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Não foi possível fazer o upload da imagem.');
      } finally {
        setIsUploading(false);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    const novasFotos = fotos.filter(f => f.id !== id).map((f, idx) => ({
      ...f,
      ordem: idx,
      is_capa: idx === 0 // Garante que o primeiro sempre seja capa
    }));
    onChange(novasFotos);
  };

  const handleSetCapa = (id: string) => {
    // Move a foto selecionada para o início do array
    const selected = fotos.find(f => f.id === id);
    if (!selected) return;

    const others = fotos.filter(f => f.id !== id);
    const reordered = [selected, ...others].map((f, idx) => ({
      ...f,
      ordem: idx,
      is_capa: idx === 0
    }));

    onChange(reordered);
  };

  // Gera 8 slots (preenchidos ou vazios)
  const slots = Array.from({ length: 8 }).map((_, i) => fotos[i] || null);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((foto, index) => (
          <div
            key={index}
            className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all group ${foto
              ? (foto.is_capa ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' : 'border-slate-200')
              : 'border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center'
              }`}
            onClick={() => !foto && !isUploading && fileInputRef.current?.click()}
          >
            {isUploading && !foto && index === fotos.length ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Enviando...</span>
              </div>
            ) : foto ? (
              <>
                <img src={foto.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(foto.id); }}
                      className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                      title="Remover Foto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {!foto.is_capa && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetCapa(foto.id); }}
                      className="w-full py-1.5 bg-white/90 backdrop-blur-sm text-indigo-700 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white shadow-sm"
                    >
                      Definir Capa
                    </button>
                  )}
                </div>

                {/* Badge Capa */}
                {foto.is_capa && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">
                    Capa Principal
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Adicionar Foto</span>
                <span className="text-[8px] text-slate-300 font-medium block mt-0.5">{index + 1}/8</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoUpload;
