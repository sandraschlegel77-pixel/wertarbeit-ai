export const PLATFORM_CATALOG = [
  { key: "ebay", name: "eBay", portal: "https://developer.ebay.com/", status: "NOT_CONNECTED" },
  { key: "etsy", name: "Etsy", portal: "https://developers.etsy.com/", status: "NOT_CONNECTED" },
  { key: "kaufland", name: "Kaufland", portal: "https://sellerapi.kaufland.com/", status: "NOT_CONNECTED" },
  { key: "amazon-sp-api", name: "Amazon SP-API", portal: "https://developer-docs.amazon.com/sp-api/", status: "NOT_CONNECTED" },
  { key: "google-business", name: "Google Business Profile", portal: "https://developers.google.com/my-business/", status: "NOT_CONNECTED" },
  { key: "pinterest", name: "Pinterest", portal: "https://developers.pinterest.com/", status: "NOT_CONNECTED" },
  { key: "meta", name: "Meta", portal: "https://developers.facebook.com/", status: "NOT_CONNECTED" },
  { key: "tiktok", name: "TikTok", portal: "https://developers.tiktok.com/", status: "NOT_CONNECTED" },
  { key: "youtube", name: "YouTube", portal: "https://developers.google.com/youtube/v3/", status: "NOT_CONNECTED" },
  { key: "dhl", name: "DHL", portal: "https://developer.dhl.com/", status: "NOT_CONNECTED" },
  { key: "dpd", name: "DPD", portal: "https://www.dpd.com/de/de/", status: "NOT_CONNECTED" },
  { key: "whatsapp", name: "WhatsApp Business", portal: "https://developers.facebook.com/docs/whatsapp/cloud-api/", status: "whatsapp" },
  { key: "google-sheets", name: "Google Sheets", portal: "https://developers.google.com/sheets/api", status: "sheets" },
  { key: "google-drive", name: "Google Drive", portal: "https://developers.google.com/drive/api", status: "NOT_CONNECTED" },
  { key: "otto", name: "Otto Market", portal: "https://www.otto.market/", status: "otto" },
  { key: "hood", name: "Hood.de", portal: "https://www.hood.de/", status: "hood" },
  { key: "avocadostore", name: "Avocadostore", portal: "https://www.avocadostore.de/haendler", status: "avocadostore" },
] as const;

export type PlatformKey = (typeof PLATFORM_CATALOG)[number]["key"];
