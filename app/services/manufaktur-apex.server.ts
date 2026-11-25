import db from "../db.server";
import {
  assertSellableUniqueInventory,
  buildGs1DigitalLink,
  buildXtoolLayeredSvg,
  ManufakturInputError,
  type XtoolSvgInput,
} from "./manufaktur-apex-core";

export {
  assertSellableUniqueInventory,
  buildGs1DigitalLink,
  buildXtoolLayeredSvg,
  projectDppFacts,
  type DppDisclosureRole,
  type DppFacts,
  type XtoolSvgInput,
} from "./manufaktur-apex-core";

export async function createXtoolWorkshopFile(input: XtoolSvgInput & {
  shop: string;
  orderId?: string;
  sku?: string;
}) {
  if (!input.shop) throw new ManufakturInputError("Shop-Zuordnung fehlt.");
  const result = buildXtoolLayeredSvg(input);
  const row = await db.xtoolSvg.create({
    data: {
      shop: input.shop,
      orderId: input.orderId?.trim().slice(0, 120) || null,
      sku: input.sku?.trim().slice(0, 120) || null,
      gravurText: input.engravingText.trim(),
      material: input.material.trim(),
      widthMm: result.widthMm,
      heightMm: result.heightMm,
      fontFamily: input.font === "SERIF" ? "serif" : "sans-serif",
      svgContent: result.svg,
      workshopNote: result.note,
    },
    select: { id: true, orderId: true, sku: true, gravurText: true, material: true, createdAt: true },
  });
  return { ...row, createdAt: row.createdAt.toISOString(), ...result };
}

export async function verifyLocalGraRecord(shop: string, certificateId: string) {
  if (!shop || !certificateId || certificateId.length > 120) {
    throw new ManufakturInputError("Shop oder Zertifikatskennung fehlt.");
  }
  const row = await db.graCertificate.findFirst({
    where: { shop, OR: [{ id: certificateId }, { certificateNo: certificateId }] },
    select: { id: true, certificateNo: true, stoneType: true, carat: true, productId: true, qrDppUrl: true, createdAt: true },
  });
  if (!row) return { status: "NOT_FOUND" as const, localRecordFound: false, graAuthenticityVerified: false, nfcVerified: false };
  return {
    status: "LOCAL_RECORD_ONLY" as const,
    localRecordFound: true,
    graAuthenticityVerified: false,
    nfcVerified: false,
    certificate: {
      certificateNo: row.certificateNo,
      stoneType: row.stoneType,
      carat: row.carat,
      productId: row.productId,
      qrDppUrl: row.qrDppUrl,
      recordedAt: row.createdAt.toISOString(),
    },
  };
}
