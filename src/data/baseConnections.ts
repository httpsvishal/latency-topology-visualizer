import { exchangeLocations } from "./exchanges";
import { providerRegions } from "./providerRegions";

type BaseConnection = {
  id: string;
  fromId: string;
  toId: string;
  provider: "AWS" | "GCP" | "Azure";
};

const providerMap = new Map(providerRegions.map((region) => [region.id, region]));
const exchangeMap = new Map(exchangeLocations.map((exchange) => [exchange.id, exchange]));

export const baseConnections: BaseConnection[] = [
  { id: "binance-bybit", fromId: "binance-tokyo", toId: "bybit-frankfurt", provider: "AWS" },
  { id: "okx-deribit", fromId: "okx-singapore", toId: "deribit-amsterdam", provider: "GCP" },
  { id: "kraken-coinbase", fromId: "kraken-newark", toId: "coinbase-london", provider: "Azure" },
  { id: "bybit-deribit", fromId: "bybit-frankfurt", toId: "deribit-amsterdam", provider: "AWS" },
  { id: "okx-binance", fromId: "okx-singapore", toId: "binance-tokyo", provider: "GCP" },
  { id: "bitfinex-okx", fromId: "bitfinex-hongkong", toId: "okx-singapore", provider: "AWS" },
  { id: "bitmex-coinbase", fromId: "bitmex-dublin", toId: "coinbase-london", provider: "Azure" },
  { id: "kraken-bybit", fromId: "kraken-newark", toId: "bybit-frankfurt", provider: "AWS" },
];

export const exchangeToRegionConnections: BaseConnection[] = exchangeLocations.map((exchange) => ({
  id: `${exchange.id}-${exchange.cloudRegionId}`,
  fromId: exchange.id,
  toId: exchange.cloudRegionId,
  provider: exchange.provider,
}));

export const getCoords = (id: string) => {
  if (exchangeMap.has(id)) {
    const exchange = exchangeMap.get(id)!;
    return { lat: exchange.latitude, lng: exchange.longitude };
  }
  if (providerMap.has(id)) {
    const region = providerMap.get(id)!;
    return { lat: region.latitude, lng: region.longitude };
  }
  return { lat: 0, lng: 0 };
};

