// Procurement module mock data and types

export interface ProcurementKpi {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export interface QuoteResult {
  distributor: string;
  price: number;
  listPrice: number;
  stock: number | 'POD';
  eta: string;
  leadTime: string;
  isBest: boolean;
}

export interface ActiveOrder {
  id: string;
  items: string;
  itemCount: number;
  client: string;
  distributor: string;
  status: 'ordered' | 'shipped' | 'delivered' | 'processing';
  total: number;
  date: string;
  trackingNum?: string;
}

export interface VendorScorecard {
  name: string;
  shortName: string;
  fillRate: number;
  avgDeliveryDays: number;
  priceScore: number;
  totalOrders: number;
  ytdSpend: number;
  color: string;
}

export interface SavingsEntry {
  month: string;
  saved: number;
  totalSpend: number;
  ordersCount: number;
}

export const procurementKpis: ProcurementKpi[] = [
  { label: 'Orders This Month', value: '143', sub: 'Through Mar 17', color: '#00D4AA' },
  { label: 'Total Spend MTD', value: '$312,840', sub: 'Net after discounts', color: '#F1F5F9' },
  { label: 'Savings vs. List Price', value: '$41,290', sub: '11.7% avg discount', color: '#00D4AA' },
  { label: 'Pending Approvals', value: '7', sub: '$28,450 pending auth', color: '#F59E0B' },
];

export const mockQuoteResults: QuoteResult[] = [
  { distributor: 'TD Synnex', price: 1842.50, listPrice: 2199.00, stock: 47, eta: 'Mar 19', leadTime: '2 days', isBest: false },
  { distributor: 'Ingram Micro', price: 1798.00, listPrice: 2199.00, stock: 12, eta: 'Mar 20', leadTime: '3 days', isBest: false },
  { distributor: 'D&H Distributing', price: 1756.40, listPrice: 2199.00, stock: 8, eta: 'Mar 19', leadTime: '2 days', isBest: true },
  { distributor: 'Arrow Electronics', price: 1881.00, listPrice: 2199.00, stock: 31, eta: 'Mar 21', leadTime: '4 days', isBest: false },
  { distributor: 'CDW', price: 1924.00, listPrice: 2199.00, stock: 200, eta: 'Mar 18', leadTime: '1 day', isBest: false },
  { distributor: 'Insight Direct', price: 1899.75, listPrice: 2199.00, stock: 55, eta: 'Mar 19', leadTime: '2 days', isBest: false },
  { distributor: 'Pax8', price: 1810.00, listPrice: 2199.00, stock: 'POD' as const, eta: 'Mar 22', leadTime: '5 days', isBest: false },
  { distributor: 'Connection', price: 1867.20, listPrice: 2199.00, stock: 22, eta: 'Mar 20', leadTime: '3 days', isBest: false },
];

export const activeOrders: ActiveOrder[] = [
  { id: 'PO-20260317-001', items: 'Dell Latitude 5540 × 12', itemCount: 12, client: 'Axiom Healthcare Group', distributor: 'TD Synnex', status: 'shipped', total: 22140, date: 'Mar 15, 2026', trackingNum: '1Z4R8A290321948271' },
  { id: 'PO-20260317-002', items: 'Cisco Catalyst 9200L × 3', itemCount: 3, client: 'Northgate Logistics', distributor: 'Arrow Electronics', status: 'ordered', total: 8760, date: 'Mar 16, 2026' },
  { id: 'PO-20260317-003', items: 'Fortinet FortiGate 60F × 1', itemCount: 1, client: 'Meridian Law Group', distributor: 'Ingram Micro', status: 'processing', total: 1240, date: 'Mar 17, 2026' },
  { id: 'PO-20260317-004', items: 'HP EliteDesk 800 G9 × 8, Monitors × 8', itemCount: 16, client: 'BlueHarbor Financial', distributor: 'CDW', status: 'delivered', total: 14480, date: 'Mar 10, 2026' },
  { id: 'PO-20260317-005', items: 'Ubiquiti UniFi AP × 24', itemCount: 24, client: 'Cascade Engineering', distributor: 'D&H Distributing', status: 'delivered', total: 4320, date: 'Mar 8, 2026' },
  { id: 'PO-20260317-006', items: 'Microsoft Surface Pro 10 × 5', itemCount: 5, client: 'Vertex Capital Partners', distributor: 'Insight Direct', status: 'shipped', total: 9875, date: 'Mar 14, 2026', trackingNum: 'FX349201847230194' },
  { id: 'PO-20260317-007', items: 'APC Smart-UPS 1500VA × 6', itemCount: 6, client: 'Summit Data Services', distributor: 'TD Synnex', status: 'ordered', total: 5340, date: 'Mar 17, 2026' },
];

export const vendorScorecards: VendorScorecard[] = [
  { name: 'TD Synnex', shortName: 'Synnex', fillRate: 97.2, avgDeliveryDays: 2.1, priceScore: 88, totalOrders: 312, ytdSpend: 487200, color: '#0D6EFD' },
  { name: 'Ingram Micro', shortName: 'Ingram', fillRate: 96.8, avgDeliveryDays: 2.4, priceScore: 91, totalOrders: 248, ytdSpend: 392100, color: '#818CF8' },
  { name: 'D&H Distributing', shortName: 'D&H', fillRate: 94.1, avgDeliveryDays: 2.0, priceScore: 94, totalOrders: 187, ytdSpend: 218400, color: '#00D4AA' },
  { name: 'Arrow Electronics', shortName: 'Arrow', fillRate: 91.5, avgDeliveryDays: 3.2, priceScore: 82, totalOrders: 143, ytdSpend: 312700, color: '#F59E0B' },
  { name: 'Pax8', shortName: 'Pax8', fillRate: 99.1, avgDeliveryDays: 0.5, priceScore: 89, totalOrders: 421, ytdSpend: 156800, color: '#00D4AA' },
  { name: 'CDW', shortName: 'CDW', fillRate: 98.4, avgDeliveryDays: 1.2, priceScore: 76, totalOrders: 89, ytdSpend: 203400, color: '#EF4444' },
];

export const savingsHistory: SavingsEntry[] = [
  { month: 'Oct 2025', saved: 9840, totalSpend: 287400, ordersCount: 118 },
  { month: 'Nov 2025', saved: 11200, totalSpend: 304100, ordersCount: 127 },
  { month: 'Dec 2025', saved: 14750, totalSpend: 371200, ordersCount: 158 },
  { month: 'Jan 2026', saved: 10390, totalSpend: 291800, ordersCount: 121 },
  { month: 'Feb 2026', saved: 13140, totalSpend: 318900, ordersCount: 136 },
  { month: 'Mar 2026', saved: 12430, totalSpend: 312840, ordersCount: 143 },
];
