export enum ServiceOrderStatus {
  Pendente = 'Pendente',
  EmReparo = 'Em Reparo',
  AguardandoPeca = 'Aguardando Peça',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  equipment: string;
  defect: string;
  status: ServiceOrderStatus;
  createdAt: string;
  updatedAt: string;
  technician: string;
  partsUsed: { partId: string; name: string; quantity: number }[];
}

export interface InventoryPart {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}
