import { Injectable, Logger } from '@nestjs/common';
import {
  FarmerContext,
  FarmerDeliveryRecord,
} from '../ai/interfaces/ai-contracts.interface';

@Injectable()
export class MockDbService {
  private readonly logger = new Logger(MockDbService.name);

  // In-memory persistent database of farmers and reception records
  private readonly farmers: Map<string, FarmerContext> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const farmer1: FarmerContext = {
      farmerId: 'FARMER-76492',
      farmerRut: '76.492.103-8',
      farmerName: 'Agrícola Los Nogales SpA (Don Carlos Morales)',
      farmLocation: 'Curicó, Región del Maule',
      deliveries: [
        {
          receptionId: 'REC-2026-1020',
          deliveryDate: '2026-10-20', // Last Tuesday
          dispatchGuideNumber: 'GD-89412',
          cropType: 'Royal Dawn Cherries (Cerezas)',
          declaredBins: 18,
          countedBins: 18,
          declaredKilos: 7200,
          status: 'APPROVED',
          isLiquidated: true,
          liquidationDate: '2026-10-24',
          paymentAmountClp: 18450000,
        },
        {
          receptionId: 'REC-2026-1022',
          deliveryDate: '2026-10-22', // Thursday
          dispatchGuideNumber: 'GD-89504',
          cropType: 'Santina Cherries (Cerezas)',
          declaredBins: 24,
          countedBins: 24,
          declaredKilos: 9600,
          status: 'APPROVED',
          isLiquidated: false,
          liquidationDate: '2026-10-31',
          paymentAmountClp: 24600000,
        },
        {
          receptionId: 'REC-2026-1025',
          deliveryDate: '2026-10-25', // Saturday
          dispatchGuideNumber: 'GD-89689',
          cropType: 'Lapins Cherries (Cerezas)',
          declaredBins: 30,
          countedBins: 28,
          declaredKilos: 11200,
          status: 'FLAGGED_FOR_REVIEW',
          isLiquidated: false,
        },
      ],
    };

    const farmer2: FarmerContext = {
      farmerId: 'FARMER-81203',
      farmerRut: '81.203.450-K',
      farmerName: 'Fundo El Peral (Héctor Valenzuela)',
      farmLocation: 'Teno, Región del Maule',
      deliveries: [
        {
          receptionId: 'REC-2026-1021',
          deliveryDate: '2026-10-21',
          dispatchGuideNumber: 'GD-44102',
          cropType: 'Gala Apples (Manzanas)',
          declaredBins: 36,
          countedBins: 36,
          declaredKilos: 14400,
          status: 'APPROVED',
          isLiquidated: true,
          liquidationDate: '2026-10-26',
          paymentAmountClp: 11520000,
        },
      ],
    };

    this.farmers.set(farmer1.farmerId, farmer1);
    this.farmers.set(farmer1.farmerRut, farmer1);
    this.farmers.set(farmer2.farmerId, farmer2);
    this.farmers.set(farmer2.farmerRut, farmer2);

    this.logger.log('Mock database seeded with initial agricultural suppliers and reception history.');
  }

  getFarmerContext(identifier: string): FarmerContext | null {
    return this.farmers.get(identifier) || null;
  }

  getAllFarmers(): FarmerContext[] {
    const unique = new Map<string, FarmerContext>();
    for (const farmer of this.farmers.values()) {
      unique.set(farmer.farmerId, farmer);
    }
    return Array.from(unique.values());
  }

  recordNewDelivery(
    supplierRut: string,
    record: FarmerDeliveryRecord,
  ): FarmerDeliveryRecord {
    let farmer = this.farmers.get(supplierRut);
    if (!farmer) {
      farmer = {
        farmerId: `FARMER-${Math.floor(10000 + Math.random() * 90000)}`,
        farmerRut: supplierRut,
        farmerName: `Productor Asociado (${supplierRut})`,
        farmLocation: 'Valle Central, Chile',
        deliveries: [],
      };
      this.farmers.set(farmer.farmerId, farmer);
      this.farmers.set(supplierRut, farmer);
    }

    farmer.deliveries.unshift(record);
    this.logger.log(
      `Recorded delivery [${record.receptionId}] for farmer [${farmer.farmerName}] with status [${record.status}]`,
    );
    return record;
  }
}
