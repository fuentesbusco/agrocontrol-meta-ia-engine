export interface VisionAnalysisInput {
  image: string; // URL or base64 data URI
  truckLicensePlate?: string;
}

export interface VisionAnalysisResult {
  totalBins: number;
  totalPallets: number;
  confidenceScore: number;
  processingTimeMs: number;
  provider: string;
  detectedObjects?: Array<{
    label: string;
    boundingBox?: [number, number, number, number];
    confidence: number;
  }>;
}

export interface OcrAnalysisInput {
  image: string; // URL or base64 data URI
  expectedSupplierRut?: string;
}

export interface OcrExtractionResult {
  documentId: string;
  supplierRut: string;
  supplierName: string;
  declaredKilos: number;
  declaredBins: number;
  cropType: string;
  isLegible: boolean;
  confidenceScore: number;
  processingTimeMs: number;
  provider: string;
}

export interface FarmerDeliveryRecord {
  receptionId: string;
  deliveryDate: string; // YYYY-MM-DD
  dispatchGuideNumber: string;
  cropType: string;
  declaredBins: number;
  countedBins: number;
  declaredKilos: number;
  status: 'APPROVED' | 'FLAGGED_FOR_REVIEW';
  isLiquidated: boolean;
  liquidationDate?: string;
  paymentAmountClp?: number;
}

export interface FarmerContext {
  farmerId: string;
  farmerRut: string;
  farmerName: string;
  farmLocation: string;
  deliveries: FarmerDeliveryRecord[];
}

export interface AgentChatInput {
  farmerId: string;
  userMessage: string;
}

export interface AgentChatResult {
  agentResponse: string;
  intent: 'PAYMENT_STATUS' | 'DELIVERY_CONFIRMATION' | 'QUALITY_DISPUTE' | 'GENERAL_INQUIRY';
  groundedDeliveriesCount: number;
  provider: string;
  referencedDeliveries?: FarmerDeliveryRecord[];
}
