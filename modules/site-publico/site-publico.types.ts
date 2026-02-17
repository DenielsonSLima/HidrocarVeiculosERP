import { IVeiculo } from '../estoque/estoque.types';
import { IEmpresa } from '../ajustes/empresa/empresa.types';

// ─── Tipo de veículo com relações de join (montadora, modelo, etc.) ───
export interface IVeiculoRelations {
  montadora?: { id: string; nome: string; logo_url?: string };
  modelo?: { nome: string };
  versao?: { nome: string };
  tipo_veiculo?: { nome: string };
}

export type IVeiculoPublic = IVeiculo & IVeiculoRelations;

export interface IMontadoraPublic {
  id: string;
  nome: string;
  logo_url: string;
  total_veiculos: number;
}

export interface IPublicPageData {
  empresa: IEmpresa;
  veiculos: IVeiculoPublic[];
  montadoras: IMontadoraPublic[];
}

export interface IGetStockParams {
  page: number;
  pageSize: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'created_desc' | 'preco_asc' | 'preco_desc';
  includeMontadoras?: boolean;
}

export interface IPaginatedStock {
  veiculos: IVeiculoPublic[];
  total: number;
  page: number;
  pageSize: number;
  montadoras?: IMontadoraPublic[];
}