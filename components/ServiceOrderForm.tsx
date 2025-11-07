import React, { useState, useEffect } from 'react';
import { ServiceOrder, ServiceOrderStatus, InventoryPart } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface ServiceOrderFormProps {
  onSubmit: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'technician'> | ServiceOrder) => void;
  onClose: () => void;
  initialData?: ServiceOrder | null;
  inventoryParts: InventoryPart[];
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ onSubmit, onClose, initialData, inventoryParts }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    equipment: '',
    defect: '',
    status: ServiceOrderStatus.Pendente,
    partsUsed: [] as { partId: string; name: string; quantity: number }[],
  });

  const [partToAdd, setPartToAdd] = useState<{ partId: string; quantity: number }>({ partId: '', quantity: 1 });

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        equipment: initialData.equipment,
        defect: initialData.defect,
        status: initialData.status,
        partsUsed: initialData.partsUsed || [],
      });
    } else {
      setFormData({
        clientName: '',
        equipment: '',
        defect: '',
        status: ServiceOrderStatus.Pendente,
        partsUsed: [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPart = () => {
    if (!partToAdd.partId || partToAdd.quantity <= 0) return;
    
    const partDetails = inventoryParts.find(p => p.id === partToAdd.partId);
    if (!partDetails) return;
    
    const existingPartIndex = formData.partsUsed.findIndex(p => p.partId === partToAdd.partId);
    let newPartsUsed = [...formData.partsUsed];

    // Calculate available stock
    const originalQuantityInOrder = initialData?.partsUsed.find(p => p.partId === partToAdd.partId)?.quantity || 0;
    const availableStock = partDetails.quantity + originalQuantityInOrder;

    if (existingPartIndex > -1) {
        // Part already in the list, update its quantity
        const totalQuantity = newPartsUsed[existingPartIndex].quantity + partToAdd.quantity;
        if (totalQuantity > availableStock) {
            alert(`Quantidade indisponível em estoque. Disponível: ${availableStock}`);
            return;
        }
        newPartsUsed[existingPartIndex].quantity = totalQuantity;
    } else {
        // New part, add to the list
        if (partToAdd.quantity > availableStock) {
            alert(`Quantidade indisponível em estoque. Disponível: ${availableStock}`);
            return;
        }
        newPartsUsed.push({
            partId: partDetails.id,
            name: partDetails.name,
            quantity: partToAdd.quantity,
        });
    }

    setFormData(prev => ({ ...prev, partsUsed: newPartsUsed }));
    setPartToAdd({ partId: '', quantity: 1 }); // Reset
  };

  const handleRemovePart = (partId: string) => {
    setFormData(prev => ({
        ...prev,
        partsUsed: prev.partsUsed.filter(p => p.partId !== partId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSubmit({ ...initialData, ...formData });
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info Fields */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Cliente</label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          required
        />
      </div>
      <div>
        <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipamento</label>
        <input
          type="text"
          id="equipment"
          name="equipment"
          value={formData.equipment}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          required
        />
      </div>
      <div>
        <label htmlFor="defect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Defeito Reclamado</label>
        <textarea
          id="defect"
          name="defect"
          rows={3}
          value={formData.defect}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          required
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        >
          {Object.values(ServiceOrderStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      
      {/* Parts Section */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Peças Utilizadas</h4>
        
        {/* Parts List */}
        <div className="space-y-2">
            {formData.partsUsed.length > 0 ? formData.partsUsed.map(part => (
                <div key={part.partId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{part.name} - <span className="font-semibold">Qtd: {part.quantity}</span></p>
                    <button type="button" onClick={() => handleRemovePart(part.partId)}>
                        <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700"/>
                    </button>
                </div>
            )) : <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma peça adicionada.</p>}
        </div>

        {/* Add Part Form */}
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <label htmlFor="partId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peça</label>
                <select 
                    id="partId"
                    value={partToAdd.partId}
                    onChange={e => setPartToAdd(prev => ({ ...prev, partId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                >
                    <option value="" disabled>Selecione uma peça</option>
                    {inventoryParts.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0 && !initialData?.partsUsed.find(ip => ip.partId === p.id)}>
                            {p.name} (Estoque: {p.quantity})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                 <label htmlFor="partQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtd.</label>
                <input 
                    type="number"
                    id="partQuantity"
                    value={partToAdd.quantity}
                    onChange={e => setPartToAdd(prev => ({...prev, quantity: parseInt(e.target.value, 10) || 1}))}
                    className="mt-1 block w-20 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    min="1"
                />
            </div>
            <button
                type="button"
                onClick={handleAddPart}
                className="p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <PlusIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {initialData ? 'Salvar Alterações' : 'Cadastrar O.S.'}
        </button>
      </div>
    </form>
  );
};

export default ServiceOrderForm;
