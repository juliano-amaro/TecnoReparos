import React, { useState, useMemo } from 'react';
import { ServiceOrder, ServiceOrderStatus, InventoryPart } from '../types';
import ThemeToggle from './ThemeToggle';
import { PlusIcon, EditIcon, TrashIcon, LogoutIcon, WrenchScrewdriverIcon, ArchiveBoxIcon } from './Icons';
import Modal from './Modal';
import ServiceOrderForm from './ServiceOrderForm';
import InventoryPartForm from './InventoryPartForm';

// --- PROPS ---
interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  serviceOrders: ServiceOrder[];
  serviceOrderHandlers: {
    addOrder: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'technician'>) => void;
    updateOrder: (order: ServiceOrder) => void;
    deleteOrder: (id: string) => void;
  };
  inventoryParts: InventoryPart[];
  inventoryHandlers: {
    addPart: (part: Omit<InventoryPart, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updatePart: (part: InventoryPart) => void;
    deletePart: (id: string) => void;
  };
}

type ActiveView = 'orders' | 'inventory';

// --- STYLES ---
const statusColors: { [key in ServiceOrderStatus]: string } = {
  [ServiceOrderStatus.Pendente]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [ServiceOrderStatus.EmReparo]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [ServiceOrderStatus.AguardandoPeca]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [ServiceOrderStatus.Concluido]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [ServiceOrderStatus.Cancelado]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

// --- SUB-COMPONENTS ---
const ServiceOrderList: React.FC<{
    orders: ServiceOrder[];
    onEdit: (order: ServiceOrder) => void;
    onDelete: (order: ServiceOrder) => void;
}> = ({ orders, onEdit, onDelete }) => (
    <div className="space-y-4">
        {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-sm text-gray-500 dark:text-gray-400">#{order.id.slice(-5)}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate mt-1">{order.clientName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.equipment}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{order.defect}</p>
                    </div>
                    <div className="flex flex-col md:items-end justify-between gap-2 mt-4 md:mt-0 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => onEdit(order)} className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(order)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 text-left md:text-right mt-2 md:mt-0">
                            <p>Téc: {order.technician}</p>
                            <p>Atualizado em: {new Date(order.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                {order.partsUsed && order.partsUsed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Peças Utilizadas:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {order.partsUsed.map(part => (
                                <li key={part.partId} className="text-sm text-gray-700 dark:text-gray-300">
                                    {part.name} <span className="text-gray-500">(Qtd: {part.quantity})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        ))}
    </div>
);

const InventoryList: React.FC<{
    parts: InventoryPart[];
    onEdit: (part: InventoryPart) => void;
    onDelete: (part: InventoryPart) => void;
}> = ({ parts, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">Nome da Peça</th>
                    <th scope="col" className="px-6 py-3">SKU</th>
                    <th scope="col" className="px-6 py-3">Qtd.</th>
                    <th scope="col" className="px-6 py-3">Preço</th>
                    <th scope="col" className="px-6 py-3">Fornecedor</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody>
                {parts.map(part => (
                    <tr key={part.id} className={`border-b dark:border-gray-700 ${part.quantity <= part.minQuantity ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800'}`}>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{part.name}</th>
                        <td className="px-6 py-4">{part.sku}</td>
                        <td className={`px-6 py-4 font-semibold ${part.quantity <= part.minQuantity ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                            {part.quantity}
                        </td>
                        <td className="px-6 py-4">R$ {part.price.toFixed(2)}</td>
                        <td className="px-6 py-4">{part.supplier}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => onEdit(part)} className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(part)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


// --- MAIN COMPONENT ---
const Dashboard: React.FC<DashboardProps> = (props) => {
  const { currentUser, onLogout, theme, toggleTheme, serviceOrders, serviceOrderHandlers, inventoryParts, inventoryHandlers } = props;
  
  // View State
  const [activeView, setActiveView] = useState<ActiveView>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Service Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderDeleteModalOpen, setIsOrderDeleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ServiceOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<ServiceOrder | null>(null);
  
  // Inventory Modal State
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isPartDeleteModalOpen, setIsPartDeleteModalOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState<InventoryPart | null>(null);
  const [partToDelete, setPartToDelete] = useState<InventoryPart | null>(null);

  // --- Handlers ---
  const handleOpenModal = (item: ServiceOrder | InventoryPart | null = null) => {
    if (activeView === 'orders') {
      setCurrentOrder(item as ServiceOrder | null);
      setIsOrderModalOpen(true);
    } else {
      setCurrentPart(item as InventoryPart | null);
      setIsPartModalOpen(true);
    }
  };

  const handleOpenDeleteModal = (item: ServiceOrder | InventoryPart) => {
    if (activeView === 'orders') {
      setOrderToDelete(item as ServiceOrder);
      setIsOrderDeleteModalOpen(true);
    } else {
      setPartToDelete(item as InventoryPart);
      setIsPartDeleteModalOpen(true);
    }
  };
  
  const handleCloseModals = () => {
    setIsOrderModalOpen(false);
    setCurrentOrder(null);
    setIsOrderDeleteModalOpen(false);
    setOrderToDelete(null);
    setIsPartModalOpen(false);
    setCurrentPart(null);
    setIsPartDeleteModalOpen(false);
    setPartToDelete(null);
  };
  
  const handleOrderFormSubmit = (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'technician'> | ServiceOrder) => {
    if ('id' in orderData) {
      serviceOrderHandlers.updateOrder(orderData as ServiceOrder);
    } else {
      serviceOrderHandlers.addOrder(orderData);
    }
    handleCloseModals();
  };
  
  const handlePartFormSubmit = (partData: Omit<InventoryPart, 'id' | 'createdAt' | 'updatedAt'> | InventoryPart) => {
    if ('id' in partData) {
      inventoryHandlers.updatePart(partData as InventoryPart);
    } else {
      inventoryHandlers.addPart(partData);
    }
    handleCloseModals();
  };
  
  const handleDeleteConfirm = () => {
    if (activeView === 'orders' && orderToDelete) {
      serviceOrderHandlers.deleteOrder(orderToDelete.id);
    } else if (activeView === 'inventory' && partToDelete) {
      inventoryHandlers.deletePart(partToDelete.id);
    }
    handleCloseModals();
  };

  // --- Memos for Filtering ---
  const filteredOrders = useMemo(() => {
    return serviceOrders
      .filter(order =>
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm)
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [serviceOrders, searchTerm]);

  const filteredParts = useMemo(() => {
    return inventoryParts
      .filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryParts, searchTerm]);

  const renderContent = () => {
    if (activeView === 'inventory') {
      return filteredParts.length > 0 ? (
        <InventoryList parts={filteredParts} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
      ) : (
        <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">Nenhuma peça encontrada no estoque.</p></div>
      );
    }

    // Default to orders view
    return filteredOrders.length > 0 ? (
      <ServiceOrderList orders={filteredOrders} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
    ) : (
      <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">Nenhuma ordem de serviço encontrada.</p></div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <WrenchScrewdriverIcon className="h-8 w-8 text-primary-500" />
              <h1 className="text-xl font-bold">TecnoReparos</h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="hidden sm:block">Olá, <span className="font-semibold">{currentUser}</span></p>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button onClick={onLogout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors" aria-label="Sair do sistema">
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => { setActiveView('orders'); setSearchTerm(''); }} className={`${activeView === 'orders' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    <WrenchScrewdriverIcon className="w-5 h-5"/> Ordens de Serviço
                </button>
                <button onClick={() => { setActiveView('inventory'); setSearchTerm(''); }} className={`${activeView === 'inventory' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    <ArchiveBoxIcon className="w-5 h-5"/> Estoque
                </button>
            </nav>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">{activeView === 'orders' ? 'Ordens de Serviço' : 'Gerenciamento de Estoque'}</h2>
           <button onClick={() => handleOpenModal()} className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <PlusIcon className="w-5 h-5"/> {activeView === 'orders' ? 'Nova O.S.' : 'Adicionar Peça'}
          </button>
        </div>
        
        <div className="mb-6">
            <input 
                type="text"
                placeholder={activeView === 'orders' ? 'Buscar por cliente, equipamento ou ID...' : 'Buscar por nome da peça ou SKU...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
            />
        </div>

        {renderContent()}
      </main>

      {/* Service Order Modals */}
      <Modal isOpen={isOrderModalOpen} onClose={handleCloseModals} title={currentOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}>
        <ServiceOrderForm 
            onSubmit={handleOrderFormSubmit} 
            onClose={handleCloseModals} 
            initialData={currentOrder}
            inventoryParts={inventoryParts}
        />
      </Modal>
      <Modal isOpen={isOrderDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão">
        <div>
          <p>Você tem certeza que deseja excluir a ordem de serviço para o cliente <strong className="font-semibold">{orderToDelete?.clientName}</strong>?</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Cancelar</button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Excluir</button>
          </div>
        </div>
      </Modal>
      
      {/* Inventory Modals */}
      <Modal isOpen={isPartModalOpen} onClose={handleCloseModals} title={currentPart ? 'Editar Peça do Estoque' : 'Adicionar Nova Peça'}>
          <InventoryPartForm onSubmit={handlePartFormSubmit} onClose={handleCloseModals} initialData={currentPart} />
      </Modal>
      <Modal isOpen={isPartDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão">
        <div>
          <p>Você tem certeza que deseja excluir a peça <strong className="font-semibold">{partToDelete?.name}</strong> do estoque?</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Cancelar</button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
