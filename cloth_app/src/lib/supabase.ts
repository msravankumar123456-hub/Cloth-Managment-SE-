import { createClient } from '@supabase/supabase-js';
import {
  Product,
  Order,
  Invoice,
  Retailer,
  Enquiry,
  Supplier,
  FabricInventory,
  ProductionRun,
  SizeChart,
  ShippingZone,
  Payment,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmcqjdbxbeiqksctllzh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.trim().length > 10);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Product Mapper (Supabase snake_case <-> App camelCase)
export const mapDbProductToApp = (db: any): Product => {
  const resolvedImage = (db.id === 'prod-3' || (typeof db.image === 'string' && db.image.includes('1542272604-780c96856592')))
    ? '/images/pants/classic-indigo-jeans.jpg'
    : db.image;
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    fabric: db.fabric,
    description: db.description || '',
    wholesalePrice: db.wholesale_price,
    retailMrp: db.retail_mrp,
    moq: db.moq || 30,
    image: resolvedImage,
    images: Array.isArray(db.images) && db.images.length > 0 
      ? db.images.map((img: string) => (typeof img === 'string' && img.includes('1542272604-780c96856592')) ? '/images/pants/classic-indigo-jeans.jpg' : img)
      : [resolvedImage],
  stock: {
    S: db.stock_s ?? 0,
    M: db.stock_m ?? 0,
    L: db.stock_l ?? 0,
    XL: db.stock_xl ?? 0,
    XXL: db.stock_xxl ?? 0,
  },
  colors: db.colors || [],
  tags: db.tags || [],
  rating: Number(db.rating) || 4.8,
  reviewsCount: db.reviews_count ?? (80 + Math.abs(parseInt(db.id?.replace(/\D/g, '') || '12', 10) % 150)),
  sku: db.sku || `LPM-${(db.category || 'APP').slice(0, 3).toUpperCase()}-${(db.id || '001').slice(-4).toUpperCase()}`,
  modelInfo: db.model_info || "Model is 6'1\" (185 cm) wearing size L (Chest 40\")",
  isFeatured: Boolean(db.is_featured),
  gsm: db.gsm,
  };
};

export const mapAppProductToDb = (p: Product) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  fabric: p.fabric,
  description: p.description,
  wholesale_price: p.wholesalePrice,
  retail_mrp: p.retailMrp,
  moq: p.moq,
  image: p.image,
  stock_s: p.stock.S,
  stock_m: p.stock.M,
  stock_l: p.stock.L,
  stock_xl: p.stock.XL,
  stock_xxl: p.stock.XXL,
  colors: p.colors,
  tags: p.tags,
  rating: p.rating,
  is_featured: p.isFeatured || false,
  gsm: p.gsm || null,
});

// Order Mapper
// Handles BOTH database rows (snake_case) and the create_order RPC response
// (camelCase). Previously only snake_case was handled, so a successful order
// produced undefined totals and crashed the tracking modal (blank black page).
export const mapDbOrderToApp = (db: any): Order => ({
  id: db.id,
  orderNumber: db.order_number ?? db.orderNumber,
  date: db.date,
  retailerName: db.retailer_name ?? db.retailerName,
  retailerStore: db.retailer_store ?? db.retailerStore,
  retailerCity: db.retailer_city ?? db.retailerCity,
  retailerPhone: db.retailer_phone ?? db.retailerPhone,
  shippingAddress: db.shipping_address ?? db.shippingAddress ?? '',
  items: typeof db.items === 'string' ? JSON.parse(db.items) : (db.items || []),
  totalPieces: db.total_pieces ?? db.totalPieces ?? 0,
  subtotal: db.subtotal ?? 0,
  gstAmount: db.gst_amount ?? db.gstAmount ?? 0,
  grandTotal: db.grand_total ?? db.grandTotal ?? 0,
  status: db.status ?? 'Confirmed',
  trackingNumber: db.tracking_number ?? db.trackingNumber,
  courierName: db.courier_name ?? db.courierName,
  dispatchDate: db.dispatch_date ?? db.dispatchDate,
  estimatedDelivery: db.estimated_delivery ?? db.estimatedDelivery,
  paymentMethod: db.payment_method ?? db.paymentMethod,
  paymentStatus: db.payment_status ?? db.paymentStatus ?? 'Paid',
  transactionId: db.transaction_id ?? db.transactionId ?? '',
  paidAt: db.paid_at ?? db.paidAt,
  notes: db.notes,
  createdAt: db.created_at ?? db.createdAt,
});

export const mapAppOrderToDb = (o: Order) => ({
  id: o.id,
  order_number: o.orderNumber,
  date: o.date,
  retailer_name: o.retailerName,
  retailer_store: o.retailerStore,
  retailer_city: o.retailerCity,
  retailer_phone: o.retailerPhone,
  shipping_address: o.shippingAddress || null,
  items: o.items,
  total_pieces: o.totalPieces,
  subtotal: o.subtotal,
  gst_amount: o.gstAmount,
  grand_total: o.grandTotal,
  status: o.status,
  tracking_number: o.trackingNumber,
  courier_name: o.courierName,
  dispatch_date: o.dispatchDate || null,
  estimated_delivery: o.estimatedDelivery,
  payment_method: o.paymentMethod,
  payment_status: o.paymentStatus,
  transaction_id: o.transactionId || null,
  paid_at: o.paidAt || null,
  notes: o.notes || null,
});

// Invoice Mapper
export const mapDbInvoiceToApp = (db: any): Invoice => ({
  id: db.id,
  invoiceNumber: db.invoice_number,
  orderId: db.order_id,
  orderNumber: db.order_number,
  date: db.date,
  dueDate: db.due_date,
  retailerName: db.retailer_name,
  retailerStore: db.retailer_store,
  retailerGst: db.retailer_gst,
  subtotal: db.subtotal,
  gstAmount: db.gst_amount,
  grandTotal: db.grand_total,
  totalPieces: db.total_pieces,
  status: db.status,
});

export const mapAppInvoiceToDb = (inv: Invoice) => ({
  id: inv.id,
  invoice_number: inv.invoiceNumber,
  order_id: inv.orderId,
  order_number: inv.orderNumber,
  date: inv.date,
  due_date: inv.dueDate,
  retailer_name: inv.retailerName,
  retailer_store: inv.retailerStore,
  retailer_gst: inv.retailerGst,
  subtotal: inv.subtotal,
  gst_amount: inv.gstAmount,
  grand_total: inv.grandTotal,
  total_pieces: inv.totalPieces,
  status: inv.status,
});

// Supplier Mapper
export const mapDbSupplierToApp = (db: any): Supplier => ({
  id: db.id,
  name: db.name,
  contactPerson: db.contact_person,
  phone: db.phone,
  email: db.email,
  city: db.city,
  state: db.state,
  gstNumber: db.gst_number,
  category: db.category,
  rating: Number(db.rating) || 4.5,
  isActive: Boolean(db.is_active),
  createdAt: db.created_at,
});

export const mapAppSupplierToDb = (s: Supplier) => ({
  id: s.id,
  name: s.name,
  contact_person: s.contactPerson,
  phone: s.phone,
  email: s.email,
  city: s.city,
  state: s.state,
  gst_number: s.gstNumber,
  category: s.category,
  rating: s.rating,
  is_active: s.isActive,
});

// Fabric Inventory Mapper
export const mapDbFabricInventoryToApp = (db: any): FabricInventory => ({
  id: db.id,
  supplierId: db.supplier_id,
  fabricName: db.fabric_name,
  type: db.type,
  gsm: db.gsm,
  color: db.color,
  quantityMeters: db.quantity_meters,
  pricePerMeter: db.price_per_meter,
  location: db.location,
  minThreshold: db.min_threshold,
  lastRestocked: db.last_restocked,
  createdAt: db.created_at,
});

export const mapAppFabricInventoryToDb = (f: FabricInventory) => ({
  id: f.id,
  supplier_id: f.supplierId,
  fabric_name: f.fabricName,
  type: f.type,
  gsm: f.gsm,
  color: f.color,
  quantity_meters: f.quantityMeters,
  price_per_meter: f.pricePerMeter,
  location: f.location,
  min_threshold: f.minThreshold,
  last_restocked: f.lastRestocked,
});

// Production Run Mapper
export const mapDbProductionRunToApp = (db: any): ProductionRun => ({
  id: db.id,
  productId: db.product_id,
  batchNumber: db.batch_number,
  quantityPlanned: db.quantity_planned,
  quantityCompleted: db.quantity_completed,
  status: db.status,
  startDate: db.start_date,
  endDate: db.end_date,
  responsiblePerson: db.responsible_person,
  notes: db.notes,
  createdAt: db.created_at,
});

export const mapAppProductionRunToDb = (p: ProductionRun) => ({
  id: p.id,
  product_id: p.productId,
  batch_number: p.batchNumber,
  quantity_planned: p.quantityPlanned,
  quantity_completed: p.quantityCompleted,
  status: p.status,
  start_date: p.startDate,
  end_date: p.endDate,
  responsible_person: p.responsiblePerson,
  notes: p.notes,
});

// Size Chart Mapper
export const mapDbSizeChartToApp = (db: any): SizeChart => ({
  id: db.id,
  category: db.category,
  size: db.size,
  chestCm: db.chest_cm,
  waistCm: db.waist_cm,
  hipCm: db.hip_cm,
  lengthCm: db.length_cm,
  sleeveCm: db.sleeve_cm,
  shoulderCm: db.shoulder_cm,
  createdAt: db.created_at,
});

export const mapAppSizeChartToDb = (s: SizeChart) => ({
  id: s.id,
  category: s.category,
  size: s.size,
  chest_cm: s.chestCm,
  waist_cm: s.waistCm,
  hip_cm: s.hipCm,
  length_cm: s.lengthCm,
  sleeve_cm: s.sleeveCm,
  shoulder_cm: s.shoulderCm,
});

// Shipping Zone Mapper
export const mapDbShippingZoneToApp = (db: any): ShippingZone => ({
  id: db.id,
  zoneName: db.zone_name,
  pincodePrefix: db.pincode_prefix,
  state: db.state,
  courierPartner: db.courier_partner,
  ratePerKg: db.rate_per_kg,
  estimatedDays: db.estimated_days,
  isActive: Boolean(db.is_active),
  createdAt: db.created_at,
});

export const mapAppShippingZoneToDb = (z: ShippingZone) => ({
  id: z.id,
  zone_name: z.zoneName,
  pincode_prefix: z.pincodePrefix,
  state: z.state,
  courier_partner: z.courierPartner,
  rate_per_kg: z.ratePerKg,
  estimated_days: z.estimatedDays,
  is_active: z.isActive,
});

// Payment Mapper
export const mapDbPaymentToApp = (db: any): Payment => ({
  id: db.id,
  orderId: db.order_id,
  invoiceId: db.invoice_id,
  amount: db.amount,
  method: db.method,
  status: db.status,
  transactionId: db.transaction_id,
  paidAt: db.paid_at,
  createdAt: db.created_at,
});

export const mapAppPaymentToDb = (p: Payment) => ({
  id: p.id,
  order_id: p.orderId,
  invoice_id: p.invoiceId,
  amount: p.amount,
  method: p.method,
  status: p.status,
  transaction_id: p.transactionId,
  paid_at: p.paidAt,
});
