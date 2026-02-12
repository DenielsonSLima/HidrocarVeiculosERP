
import { CadastrosMasterService } from '../cadastros.service';
import { ICidade } from './cidades.types';

const TABLE = 'cad_cidades';

export const CidadesService = {
  async getAll(): Promise<ICidade[]> {
    const data = await CadastrosMasterService.getFromDB(TABLE);
    return (data || []) as ICidade[];
  },

  async save(payload: Partial<ICidade>): Promise<ICidade> {
    const data = await CadastrosMasterService.saveToDB(TABLE, payload);
    return data as ICidade;
  },

  async remove(id: string): Promise<boolean> {
    return await CadastrosMasterService.deleteFromDB(TABLE, id);
  },

  // Consulta opcional de CEP para auxiliar o preenchimento
  async consultarCEP(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      return data.erro ? null : data;
    } catch (e) {
      return null;
    }
  }
};
