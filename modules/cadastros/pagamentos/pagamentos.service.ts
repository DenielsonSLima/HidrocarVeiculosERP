import { CadastrosMasterService } from '../cadastros.service';

const TABLE = 'cad_tipos_pagamento';

/**
 * @deprecated Service vinculado a tabela legada 'cad_tipos_pagamento'. Não utilizado pelo módulo financeiro atual.
 */
export const PagamentosService = {
  async getAll() {
    console.warn('PagamentosService is deprecated. Use FormasPagamentoService.');
    return await CadastrosMasterService.getFromDB(TABLE);
  },
  async save(payload: any) {
    return await CadastrosMasterService.saveToDB(TABLE, payload);
  },
  async remove(id: string) {
    return await CadastrosMasterService.deleteFromDB(TABLE, id);
  }
};