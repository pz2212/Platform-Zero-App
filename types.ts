
export enum UserRole {
  FARMER = 'FARMER',
  WHOLESALER = 'WHOLESALER',
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PZ_REP = 'PZ_REP'
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'LEAD' | 'SYSTEM' | 'APPLICATION' | 'PRICE_REQUEST';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isProductLink?: boolean;
  productId?: string;
  imageUrl?: string;
}

export interface BusinessProfile {
  companyName: string;
  tradingName: string;
  abn: string;
  businessLocation: string;
  directorName: string;
  businessMobile: string;
  email: string;
  accountsEmail: string;
  accountsMobile: string;
  tradingDaysHours: string;
  productsSold: string;
  hasLogistics: boolean | null;
  deliversStatewide?: boolean;
  deliveryDistanceKm?: string;
  deliversInterstate?: boolean;
  logisticPartner1?: string;
  logisticPartner2?: string;
  logisticPartner3?: string;
  bankName: string;
  bsb: string;
  accountNumber: string;
  agreeTo14DayTerms: boolean;
  agreeTo20PercentDiscount: boolean | null;
  alternativeDiscount?: string;
  acceptedTandCs: boolean;
  isComplete: boolean;
}

export interface User {
  id: string;
  name: string;
  businessName: string;
  role: UserRole;
  email: string;
  dashboardVersion?: 'v1' | 'v2';
  paymentTerms?: '14 Days' | '30 Days';
  acceptFastPay?: boolean;
  bankDetails?: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
  businessProfile?: BusinessProfile;
  activeSellingInterests?: string[];
  activeBuyingInterests?: string[];
  commissionRate?: number;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  businessName: string;
  email: string;
  requestedRole: UserRole;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details?: string;
  consumerData?: {
    mobile: string;
    location: string;
    weeklySpend: number;
    orderFrequency: string;
    businessCategory?: BusinessCategory;
    abn?: string;
    deliveryAddress?: string;
    deliveryInstructions?: string;
    productsList?: string;
    deliveryDays?: string[];
    deliveryTimeSlot?: string;
    chefName?: string;
    chefEmail?: string;
    chefMobile?: string;
    accountsEmail?: string;
    accountsMobile?: string;
    want55DayTerms?: boolean;
    invoiceFile?: string;
  };
}

export interface Driver {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleRegistration: string;
  vehicleType: 'Van' | 'Truck' | 'Refrigerated Truck';
  status: 'Active' | 'Inactive';
}

export interface Packer {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruit';
  variety: string;
  imageUrl: string;
  defaultPricePerKg: number;
  industryPrice?: number;
  co2SavingsPerKg?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  ownerId: string;
  quantityKg: number;
  expiryDate: string;
  harvestDate: string;
  status: 'Available' | 'Sold' | 'Expired' | 'Pending Approval' | 'Rejected' | 'Donated';
  originalFarmerName?: string;
  harvestLocation?: string;
  receivedDate?: string;
  notes?: string;
  discountAfterDays?: number;
  discountPricePerKg?: number;
  batchImageUrl?: string;
  lastPriceVerifiedDate?: string; // Track daily verification
}

export interface OrderIssue {
  type: 'Quality' | 'Damage' | 'Missing Item' | 'Wrong Item';
  description: string;
  photoUrl?: string;
  reportedAt: string;
  deadline: string;
  requestedResolution: 'Replacement' | 'Refund' | 'Credit' | 'Delivery of Missing Items';
  requestedDeliveryDate?: string;
  requestedDeliveryTime?: string;
  status: 'Open' | 'Resolved' | 'Rejected';
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Delivery' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  priority?: 'STANDARD' | 'HIGH' | 'URGENT';
  logistics?: LogisticsDetails;
  acceptanceDeadline?: string;
  customerNotes?: string;
  issue?: OrderIssue;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Overdue';
  paymentMethod?: 'pay_now' | 'invoice' | 'amex';
  packerId?: string;
  packerName?: string;
  packedAt?: string;
  deliveryDriverName?: string;
  deliveryPhotoUrl?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  productId: string;
  quantityKg: number;
  pricePerKg: number;
  isPacked?: boolean;
  packingIssue?: string;
}

export interface LogisticsDetails {
  method: 'PICKUP' | 'LOGISTICS';
  driverId?: string;
  driverName?: string;
  partner?: 'Little Logistics' | 'Collins Transport' | 'LinFox';
  deliveryLocation?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  refrigeration?: boolean;
}

export type ConsumerConnectionStatus = 'Active' | 'Pending Connection' | 'Pricing Pending' | 'Pending PZ Approval' | 'Not Connected';

export type BusinessCategory = 'Deli' | 'Cafe' | 'Restaurant' | 'Pub' | 'Sporting club' | 'Catering' | 'Grocery store';

export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email?: string;
  phone?: string;
  category: BusinessCategory | 'Unassigned' | 'Chain' | 'Retailer';
  joinedDate?: string;
  abn?: string;
  location?: string;
  deliveryAddress?: string;
  weeklySpend?: number;
  orderFrequency?: string;
  deliveryTimeWindow?: string;
  commonProducts?: string;
  director?: { name: string; email: string; phone: string };
  accounts?: { name: string; email: string; phone: string };
  chef?: { name: string; email: string; phone: string };
  connectionStatus?: ConsumerConnectionStatus;
  connectedSupplierId?: string;
  connectedSupplierName?: string;
  connectedSupplierRole?: 'Wholesaler' | 'Farmer';
  pricingTier?: string;
  pzMarkup?: number;
  pricingStatus?: 'Approved' | 'Pending' | 'Not Set' | 'Pending PZ Approval';
  assignedPzRepId?: string;
  assignedPzRepName?: string;
  onboardingData?: {
    estimatedVolume: string;
    orderFrequency: 'Daily' | 'Weekly' | 'Ad-hoc';
    deliveryAddress: string;
    specialRequirements?: string;
  };
}

export interface Lead {
  id: string;
  businessName: string;
  location: string;
  weeklySpend: number;
  deliveryTimePref: string;
  requestedProducts: {
    productId: string;
    productName: string;
    currentPrice: number;
  }[];
}

export interface MarketInsight {
  trend: 'Up' | 'Down' | 'Stable';
  percentage: number;
  description: string;
}

export interface PricingRule {
  id: string;
  ownerId: string;
  productId: string;
  category: BusinessCategory;
  strategy: 'FIXED' | 'PERCENTAGE_DISCOUNT';
  value: number;
  isActive: boolean;
}

export interface BuyerInterest {
  customerId: string;
  productName: string;
  maxPrice?: number;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface OnboardingFormTemplate {
  role: UserRole;
  sections: FormSection[];
}

export interface SupplierPriceRequestItem {
  productId: string;
  productName: string;
  targetPrice: number;
  offeredPrice?: number;
}

export interface SupplierPriceRequest {
  id: string;
  supplierId: string;
  status: 'PENDING' | 'SUBMITTED' | 'WON' | 'LOST';
  createdAt: string;
  customerContext: string;
  customerLocation: string;
  items: SupplierPriceRequestItem[];
}
