import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { ServiceOrder, ServiceOrderStatus, InventoryPart } from './types';

// Custom hook for using localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('currentUser', null);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const initialOrders: ServiceOrder[] = [
    {
      id: '1',
      clientName: 'João Silva',
      equipment: 'Notebook Dell Inspiron 15',
      defect: 'Não liga, sem sinal de vida.',
      status: ServiceOrderStatus.EmReparo,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      technician: 'Carlos',
      partsUsed: [
        { partId: 'p1', name: 'SSD 240GB Kingston A400', quantity: 1 }
      ],
    },
    {
      id: '2',
      clientName: 'Maria Oliveira',
      equipment: 'MacBook Pro 13"',
      defect: 'Tela quebrada após queda.',
      status: ServiceOrderStatus.AguardandoPeca,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      technician: 'Ana',
      partsUsed: [],
    },
     {
      id: '3',
      clientName: 'Pedro Costa',
      equipment: 'PC Gamer (Custom)',
      defect: 'Superaquecendo e desligando sozinho em jogos.',
      status: ServiceOrderStatus.Pendente,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      technician: 'Carlos',
      partsUsed: [],
    },
  ];

  const initialParts: InventoryPart[] = [
    {
      id: 'p1',
      name: 'SSD 240GB Kingston A400',
      sku: 'SA400S37/240G',
      quantity: 7, // Adjusted initial quantity
      minQuantity: 5,
      price: 150.00,
      supplier: 'Fornecedor A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p2',
      name: 'Memória RAM 8GB DDR4 Crucial',
      sku: 'CT8G4DFRA266',
      quantity: 3,
      minQuantity: 5,
      price: 220.50,
      supplier: 'Fornecedor B',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p3',
      name: 'Tela 15.6" LED Slim',
      sku: 'LP156WHB-TPA1',
      quantity: 2,
      minQuantity: 2,
      price: 450.00,
      supplier: 'Fornecedor A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const [serviceOrders, setServiceOrders] = useLocalStorage<ServiceOrder[]>('serviceOrders', initialOrders);
  const [inventoryParts, setInventoryParts] = useLocalStorage<InventoryPart[]>('inventoryParts', initialParts);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, [setIsAuthenticated, setCurrentUser]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const updateInventory = (parts: { partId: string; quantity: number }[], operation: 'add' | 'subtract') => {
    setInventoryParts(currentParts => {
      const partsMap = new Map(currentParts.map(p => [p.id, { ...p }]));
      for (const part of parts) {
        const existingPart = partsMap.get(part.partId);
        if (existingPart) {
          if (operation === 'subtract') {
            existingPart.quantity -= part.quantity;
          } else {
            existingPart.quantity += part.quantity;
          }
        }
      }
      return Array.from(partsMap.values());
    });
  };

  const serviceOrderHandlers = {
    addOrder: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt' | 'technician'>) => {
        const newOrder = { 
            ...order, 
            id: `os-${Date.now().toString()}`, 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            technician: currentUser || 'Desconhecido'
        };
        setServiceOrders(prev => [...prev, newOrder]);
        if (newOrder.partsUsed.length > 0) {
            updateInventory(newOrder.partsUsed, 'subtract');
        }
    },
    updateOrder: (updatedOrder: ServiceOrder) => {
        const originalOrder = serviceOrders.find(o => o.id === updatedOrder.id);
        if (!originalOrder) return;

        const quantityChanges = new Map<string, number>();

        originalOrder.partsUsed.forEach(part => {
            quantityChanges.set(part.partId, (quantityChanges.get(part.partId) || 0) + part.quantity);
        });

        updatedOrder.partsUsed.forEach(part => {
            quantityChanges.set(part.partId, (quantityChanges.get(part.partId) || 0) - part.quantity);
        });

        const partsToUpdate: { partId: string; quantity: number }[] = [];
        quantityChanges.forEach((qtyChange, partId) => {
            if (qtyChange !== 0) {
                // If qtyChange is positive, we add back to inventory.
                // If qtyChange is negative, we subtract from inventory.
                updateInventory([{partId, quantity: -qtyChange}], 'subtract');
            }
        });

        setServiceOrders(prev => prev.map(order => 
            order.id === updatedOrder.id 
                ? { ...updatedOrder, updatedAt: new Date().toISOString() } 
                : order
        ));
    },
    deleteOrder: (id: string) => {
        const orderToDelete = serviceOrders.find(order => order.id === id);
        if (orderToDelete && orderToDelete.partsUsed.length > 0) {
            updateInventory(orderToDelete.partsUsed, 'add');
        }
        setServiceOrders(prev => prev.filter(order => order.id !== id));
    }
  };

  const inventoryHandlers = {
    addPart: (part: Omit<InventoryPart, 'id' | 'createdAt' | 'updatedAt'>) => {
      setInventoryParts(prev => [
        ...prev,
        {
          ...part,
          id: `p-${Date.now().toString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    },
    updatePart: (updatedPart: InventoryPart) => {
      setInventoryParts(prev => prev.map(part =>
        part.id === updatedPart.id
          ? { ...updatedPart, updatedAt: new Date().toISOString() }
          : part
      ));
    },
    deletePart: (id: string) => {
      setInventoryParts(prev => prev.filter(part => part.id !== id));
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <Dashboard
      currentUser={currentUser || 'Técnico'}
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
      serviceOrders={serviceOrders}
      serviceOrderHandlers={serviceOrderHandlers}
      inventoryParts={inventoryParts}
      inventoryHandlers={inventoryHandlers}
    />
  );
};

export default App;
