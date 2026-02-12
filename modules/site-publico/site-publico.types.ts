import { IVeiculo } from '../estoque/estoque.types';
import { IEmpresa } from '../ajustes/empresa/empresa.types';

// Fix: Removed 'extends any' from the interface definition as TypeScript doesn't allow extending the 'any' type.
export interface IMontadoraPublic {
  id: string;
  nome: string;
  logo_url: string;
  total_veiculos: number;
}

export interface IPublicPageData {
  empresa: IEmpresa;
  veiculos: IVeiculo[];
  montadoras: IMontadoraPublic[];
}