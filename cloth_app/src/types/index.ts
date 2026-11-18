export type ClothingCategory = 'Shirts' | 'T-Shirts' | 'Denim' | 'Kurtis' | 'Trousers' | 'Blazers';

export interface SizeBreakdown {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface Product {
  id: string;
  name: string;
  category: ClothingCategory;
  fabric: string;
  description: string;
  wholesalePrice: number; // in INR ₹
  retailMrp: number;
  moq: number; // Minimum Order Quantity in pieces
  image: string;
  stock: SizeBreakdown;
  colors: string[];
  tags: string[];
  rating: number;
  isFeatured?: boolean;
  gsm?: number; // Fabric GSM
}

export interface CartItem {
  id: string;
  product: Product;
  sizes: SizeBreakdown;
  selectedColor: string;
  totalQuantity: number;
  itemTotal: number;
}

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'In Production' 
  | 'Quality Check' 
  | 'Dispatched' 
  | 'Out for Delivery' 
  | 'Delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  retailerName: string;
  retailerStore: string;
  retailerCity: string;
  retailerPhone: string;
  items: CartItem[];
  totalPieces: number;
  subtotal: number;
  gstAmount: number; // 5% GST
  grandTotal: number;
  status: OrderStatus;
  trackingNumber: string;
  courierName: string;
  dispatchDate?: string;
  estimatedDelivery: string;
  paymentMethod: 'UPI' | 'NEFT / RTGS' | 'Factory Credit (15 Days)';
  paymentStatus: 'Paid' | 'Pending';
  notes?: string;
}

export interface Retailer {
  id: string;
  name: string;
  businessName: string;
  gstNumber: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  address?: string;
  proofIdType?: string;
  proofIdNumber?: string;
  activeOrdersCount: number;
  totalSpent: number;
  creditLimit: number;
  joinedDate: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  date: string;
  dueDate: string;
  retailerName: string;
  retailerStore: string;
  retailerGst: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  totalPieces: number;
  status: 'Paid' | 'Pending';
}

export interface Enquiry {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
}

export type AuthView = 'choose-portal' | 'retailer-auth' | 'factory-auth' | null;

export type AuthMode = 'login' | 'register';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  place: string;
  pincode: string;
  passwordHash: string;
  role: 'retailer' | 'factory';
  isNewRetailer?: boolean;
  authenticatedAt: string;
}

export interface RetailerCredentials {
  identifier?: string;
  email?: string;
  name?: string;
  password: string;
}

export interface RetailerRegisterData {
  firstName: string;
  name?: string;
  mobile: string;
  place: string;
  email: string;
  pincode: string;
  shopAddress: string;
  proofIdType: 'Aadhaar' | 'PAN' | 'Other';
  proofIdNumber: string;
  password: string;
  confirmPassword: string;
  otpVerified?: boolean;
}

export interface FactoryCredentials {
  name?: string;
  email?: string;
  password: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstNumber?: string;
  category: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface FabricInventory {
  id: string;
  supplierId?: string;
  fabricName: string;
  type: string;
  gsm: number;
  color: string;
  quantityMeters: number;
  pricePerMeter: number;
  location: string;
  minThreshold: number;
  lastRestocked?: string;
  createdAt: string;
}

export interface ProductionRun {
  id: string;
  productId?: string;
  batchNumber: string;
  quantityPlanned: number;
  quantityCompleted: number;
  status: string;
  startDate: string;
  endDate?: string;
  responsiblePerson: string;
  notes?: string;
  createdAt: string;
}

export interface SizeChart {
  id: string;
  category: string;
  size: string;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  lengthCm?: number;
  sleeveCm?: number;
  shoulderCm?: number;
  createdAt: string;
}

export interface ShippingZone {
  id: string;
  zoneName: string;
  pincodePrefix: string;
  state: string;
  courierPartner: string;
  ratePerKg: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  invoiceId?: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}
