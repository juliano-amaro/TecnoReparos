import React, { useState, useEffect } from 'react';
import { InventoryPart } from '../types';

interface InventoryPartFormProps {
  onSubmit: (part: Omit<InventoryPart, 'id' | 'createdAt' | 'updatedAt'> | InventoryPart) => void;
  onClose: () => void;
  initialData?: InventoryPart | null;
}

const InventoryPartForm: React.FC<InventoryPartFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplier: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku,
        quantity: initialData.quantity,
        minQuantity: initialData.minQuantity,
        price: initialData.price,
        supplier: initialData.supplier,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        quantity: 0,
        minQuantity: 0,
        price: 0,
        supplier: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Peça</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          required
        />
      </div>
       <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU (Código)</label>
        <input
          type="text"
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtd. Mínima</label>
            <input
              type="number"
              id="minQuantity"
              name="minQuantity"
              value={formData.minQuantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              min="0"
            />
          </div>
      </div>
       <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          min="0"
          step="0.01"
        />
      </div>
       <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
        <input
          type="text"
          id="supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
      </div>

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
          {initialData ? 'Salvar Alterações' : 'Adicionar Peça'}
        </button>
      </div>
    </form>
  );
};

export default InventoryPartForm;
