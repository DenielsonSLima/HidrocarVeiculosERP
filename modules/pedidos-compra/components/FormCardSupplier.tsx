
import React from 'react';
import { IPedidoCompra } from '../pedidos-compra.types';
import { IParceiro } from '../../parceiros/parceiros.types';
import PartnerSelect from './PartnerSelect';

interface Props {
  formData: Partial<IPedidoCompra>;
  parceiros: IParceiro[];
  onChange: (parceiro: IParceiro) => void;
  disabled?: boolean;
}

const FormCardSupplier: React.FC<Props> = ({ formData, parceiros, onChange, disabled }) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">02. Origem do Veículo</h3>
      <PartnerSelect 
        parceiros={parceiros} 
        selectedId={formData.fornecedor_id} 
        onChange={onChange} 
        disabled={disabled}
      />
    </div>
  );
};

export default FormCardSupplier;
