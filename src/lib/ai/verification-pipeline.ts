/**
 * Verification pipeline orchestrator.
 * Coordinates document parsing, cross-verification, and overall status determination.
 */

import {
  parseDocument,
  verifyDocument,
  type ExtractedDocumentData,
  type VerificationResult,
} from "./document-parser";
import { namesMatch } from "./levenshtein";
import { daysUntilExpiry, isExpiringWithin } from "./validators";

// ---- Types ----

export interface DocumentInput {
  type: string;
  fileUrl: string;
}

export interface DocumentResult {
  documentType: string;
  extractedData: ExtractedDocumentData;
  verification: VerificationResult;
}

export interface CrossVerificationResult {
  nameConsistency: { passed: boolean; details: string };
  expiryAlerts: Array<{
    document: string;
    expiresIn: number;
    expiryDate: string;
  }>;
  vehicleClassMatch: { passed: boolean; details: string };
}

export interface PipelineResult {
  overallStatus: "passed" | "flagged" | "rejected";
  documentResults: DocumentResult[];
  crossVerificationResult: CrossVerificationResult;
}

// ---- Pipeline ----

export async function runVerificationPipeline(
  _entityType: "vendor" | "driver",
  documents: DocumentInput[],
  vehicleType?: string
): Promise<PipelineResult> {
  // Step 1: Parse all documents in parallel
  const parseResults = await Promise.all(
    documents.map(async (doc) => {
      const extractedData = await parseDocument(doc.fileUrl, doc.type);
      return { type: doc.type, extractedData };
    })
  );

  // Step 2: Collect all names from parsed documents
  const allNames: Array<{ docType: string; name: string }> = [];
  for (const result of parseResults) {
    const { fields } = result.extractedData;
    const name =
      fields.name ?? fields.owner_name ?? fields.insured_name;
    if (name) {
      allNames.push({ docType: result.type, name });
    }
  }

  // Step 3: Cross-reference names
  let nameConsistency: CrossVerificationResult["nameConsistency"];
  if (allNames.length < 2) {
    nameConsistency = {
      passed: true,
      details: "Only one document with a name found. No cross-check possible.",
    };
  } else {
    const referenceName = allNames[0].name;
    const mismatches: string[] = [];

    for (let i = 1; i < allNames.length; i++) {
      if (!namesMatch(referenceName, allNames[i].name)) {
        mismatches.push(
          `${allNames[i].docType.toUpperCase()} says "${allNames[i].name}"`
        );
      }
    }

    if (mismatches.length === 0) {
      nameConsistency = {
        passed: true,
        details: `Names match across all ${allNames.length} documents: "${referenceName}"`,
      };
    } else {
      nameConsistency = {
        passed: false,
        details: `Name on ${allNames[0].docType.toUpperCase()} is "${referenceName}", but ${mismatches.join("; ")}`,
      };
    }
  }

  // Step 4: Check expiry dates across all documents
  const expiryAlerts: CrossVerificationResult["expiryAlerts"] = [];
  for (const result of parseResults) {
    const { fields } = result.extractedData;
    const expiryField =
      fields.expiry_date ?? fields.expiry ?? fields.validity;
    if (expiryField && isExpiringWithin(expiryField, 30)) {
      expiryAlerts.push({
        document: result.type,
        expiresIn: daysUntilExpiry(expiryField),
        expiryDate: expiryField,
      });
    }
  }

  // Step 5: Verify license class matches vehicle type
  let vehicleClassMatch: CrossVerificationResult["vehicleClassMatch"] = {
    passed: true,
    details: "No license-to-vehicle check needed.",
  };

  if (vehicleType) {
    const licenseResult = parseResults.find((r) => r.type === "license");
    if (licenseResult) {
      const classes =
        licenseResult.extractedData.fields.vehicle_classes?.toUpperCase() ?? "";
      const needsHMV =
        vehicleType === "12_seater" || vehicleType === "16_seater";

      if (needsHMV) {
        const has = classes.includes("HMV") || classes.includes("HTV");
        vehicleClassMatch = {
          passed: has,
          details: has
            ? `License includes HMV class, valid for ${vehicleType}`
            : `License MISSING HMV class required for ${vehicleType}. Has: ${classes}`,
        };
      } else {
        const has = classes.includes("LMV");
        vehicleClassMatch = {
          passed: has,
          details: has
            ? `License includes LMV class, valid for ${vehicleType}`
            : `License MISSING LMV class required for ${vehicleType}. Has: ${classes}`,
        };
      }
    }
  }

  // Step 6: Verify each document with cross-reference data
  const crossRefData: Record<string, string> = {};
  if (allNames.length > 0) {
    crossRefData.name = allNames[0].name;
  }
  if (vehicleType) {
    crossRefData.vehicleType = vehicleType;
  }

  const documentResults: DocumentResult[] = await Promise.all(
    parseResults.map(async (result) => {
      const verification = await verifyDocument(
        result.extractedData,
        crossRefData
      );
      return {
        documentType: result.type,
        extractedData: result.extractedData,
        verification,
      };
    })
  );

  // Step 7: Determine overall status
  const hasRejected = documentResults.some(
    (r) => r.verification.status === "rejected"
  );
  const hasFlagged =
    documentResults.some((r) => r.verification.status === "flagged") ||
    !nameConsistency.passed ||
    expiryAlerts.length > 0 ||
    !vehicleClassMatch.passed;

  let overallStatus: PipelineResult["overallStatus"];
  if (hasRejected) {
    overallStatus = "rejected";
  } else if (hasFlagged) {
    overallStatus = "flagged";
  } else {
    overallStatus = "passed";
  }

  return {
    overallStatus,
    documentResults,
    crossVerificationResult: {
      nameConsistency,
      expiryAlerts,
      vehicleClassMatch,
    },
  };
}
