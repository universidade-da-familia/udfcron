export interface IntelipostShipmentOrder {
  content: IntelipostShipmentOrderContent[];
}

interface IntelipostShipmentOrderContent {
  shipment_order_volume_array: IntelipostShipmentOrderVolume[];
}

interface IntelipostShipmentOrderVolume {
  tracking_code: string;
  shipped_date_iso: string;
}
