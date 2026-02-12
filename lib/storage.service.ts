import { supabase } from './supabase';

export const StorageService = {
    /**
     * Faz upload de uma imagem para o Supabase Storage.
     * @param file Arquivo a ser enviado
     * @param bucket Nome do bucket (ex: 'montadoras', 'modelos', 'veiculos')
     * @param folder Pasta opcional dentro do bucket
     * @returns URL pública da imagem
     */
    async uploadImage(file: File, bucket: string, folder: string = ''): Promise<string> {
        try {
            // Gera um nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Erro no upload de imagem:', error);
            throw error;
        }
    },

    /**
     * Tenta converter um Base64 para File para realizar o upload
     */
    base64ToFile(base64: string, filename: string): File {
        const arr = base64.split(',');
        const match = arr[0].match(/:(.*?);/);
        const mime = match ? match[1] : 'image/jpeg'; // Fallback
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }
};
