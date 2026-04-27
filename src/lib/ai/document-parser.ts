/**
 * Document AI simulation layer.
 * Interface designed for future Google Document AI integration.
 * Current implementation returns realistic mock data.
 */

import {
  isValidPAN,
  isValidAadhaar,
  isValidDLNumber,
  isValidVehicleReg,
  isExpired,
  isExpiringWithin,
  daysUntilExpiry,
} from "./validators";
import { namesMatch } from "./levenshtein";

// ---- Types ----

export interface ExtractedDocumentData {
  documentType: string;
  fields: Record<string, string>;
  confidence: number;
  rawText: string;
}

export interface VerificationCheck {
  check: string;
  passed: boolean;
  detail: string;
}

export interface VerificationResult {
  status: "passed" | "flagged" | "rejected";
  notes: string;
  checks: VerificationCheck[];
}

export interface PhotoAssessment {
  score: number;
  isValid: boolean;
  damageDetected: boolean;
  notes: string;
}

// ---- Mock data per document type ----

const MOCK_EXTRACTED: Record<
  string,
  { fields: Record<string, string>; rawText: string }
> = {
  pan: {
    fields: {
      name: "RAJESH KUMAR SHARMA",
      pan_number: "ABCPS1234F",
      dob: "1985-06-15",
      fathers_name: "MOHAN LAL SHARMA",
    },
    rawText:
      "INCOME TAX DEPARTMENT\nGOVT OF INDIA\nPERMANENT ACCOUNT NUMBER\nABCPS1234F\nRAJESH KUMAR SHARMA\nFATHER: MOHAN LAL SHARMA\nDOB: 15/06/1985",
  },
  aadhaar: {
    fields: {
      name: "RAJESH KUMAR SHARMA",
      aadhaar_number: "234567890123",
      address: "42, MG Road, Koramangala, Bangalore 560034",
      dob: "1985-06-15",
      gender: "Male",
    },
    rawText:
      "GOVERNMENT OF INDIA\nRAJESH KUMAR SHARMA\nDOB: 15/06/1985\nMale\n42, MG Road, Koramangala\nBangalore 560034\n2345 6789 0123",
  },
  license: {
    fields: {
      name: "RAJESH KUMAR SHARMA",
      dl_number: "KA0120200001234",
      expiry: "2030-06-14",
      vehicle_classes: "LMV, MCWG",
      dob: "1985-06-15",
      blood_group: "B+",
      issue_date: "2020-06-15",
    },
    rawText:
      "UNION OF INDIA\nDRIVING LICENCE\nKA01 2020 0001234\nRAJESH KUMAR SHARMA\nDOB: 15/06/1985\nVALID TILL: 14/06/2030\nCOV: LMV, MCWG",
  },
  rc_book: {
    fields: {
      registration_number: "KA01AB1234",
      owner_name: "RAJESH KUMAR SHARMA",
      validity: "2030-12-31",
      chassis_number: "MA3FJEB1S00123456",
      engine_number: "K12MN1234567",
      vehicle_class: "LMV",
      fuel_type: "Diesel",
      maker: "TOYOTA KIRLOSKAR MOTOR",
    },
    rawText:
      "REGISTRATION CERTIFICATE\nKA-01-AB-1234\nRAJESH KUMAR SHARMA\nTOYOTA KIRLOSKAR MOTOR\nVALID TILL: 31/12/2030",
  },
  insurance: {
    fields: {
      expiry_date: "2027-03-15",
      policy_number: "INS/2024/BLR/00456789",
      insured_name: "RAJESH KUMAR SHARMA",
      vehicle_number: "KA01AB1234",
      insurer: "NATIONAL INSURANCE CO LTD",
      coverage_type: "Comprehensive",
    },
    rawText:
      "NATIONAL INSURANCE CO LTD\nPOLICY NO: INS/2024/BLR/00456789\nINSURED: RAJESH KUMAR SHARMA\nVEHICLE: KA-01-AB-1234\nVALID TILL: 15/03/2027",
  },
  fitness: {
    fields: {
      expiry_date: "2026-09-30",
      certificate_number: "FIT/KA/2024/001234",
      vehicle_number: "KA01AB1234",
      issue_date: "2024-10-01",
    },
    rawText:
      "FITNESS CERTIFICATE\nCERT NO: FIT/KA/2024/001234\nVEHICLE: KA-01-AB-1234\nVALID TILL: 30/09/2026",
  },
  puc: {
    fields: {
      expiry_date: "2026-12-15",
      certificate_number: "PUC/BLR/2024/098765",
      vehicle_number: "KA01AB1234",
      emission_result: "PASS",
    },
    rawText:
      "POLLUTION UNDER CONTROL CERTIFICATE\nPUC/BLR/2024/098765\nVEHICLE: KA-01-AB-1234\nRESULT: PASS\nVALID TILL: 15/12/2026",
  },
  police_verification: {
    fields: {
      name: "RAJESH KUMAR SHARMA",
      verification_date: "2024-08-20",
      station: "Koramangala PS, Bangalore",
      result: "No adverse record found",
    },
    rawText:
      "POLICE VERIFICATION REPORT\nNAME: RAJESH KUMAR SHARMA\nSTATION: Koramangala PS\nDATE: 20/08/2024\nRESULT: No adverse record found",
  },
  medical_fitness: {
    fields: {
      name: "RAJESH KUMAR SHARMA",
      expiry_date: "2027-08-19",
      doctor_name: "Dr. A. Krishnamurthy",
      hospital: "Apollo Clinic, Bangalore",
      result: "Fit to drive",
    },
    rawText:
      "MEDICAL FITNESS CERTIFICATE\nRAJESH KUMAR SHARMA\nFIT TO DRIVE\nVALID TILL: 19/08/2027\nDR. A. KRISHNAMURTHY",
  },
};

// ---- Core functions ----

export async function parseDocument(
  _fileUrl: string,
  documentType: string
): Promise<ExtractedDocumentData> {
  // Simulate network delay (2-3 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 1000)
  );

  const mock = MOCK_EXTRACTED[documentType];

  if (!mock) {
    return {
      documentType,
      fields: {},
      confidence: 0.3,
      rawText: "Unable to parse document. Unsupported document type.",
    };
  }

  return {
    documentType,
    fields: { ...mock.fields },
    confidence: 0.85 + Math.random() * 0.12, // 0.85 - 0.97
    rawText: mock.rawText,
  };
}

export async function verifyDocument(
  extracted: ExtractedDocumentData,
  crossReferenceData?: Record<string, string>
): Promise<VerificationResult> {
  const checks: VerificationCheck[] = [];
  const { documentType, fields } = extracted;

  // PAN format validation
  if (documentType === "pan" && fields.pan_number) {
    const valid = isValidPAN(fields.pan_number);
    checks.push({
      check: "PAN format validation",
      passed: valid,
      detail: valid
        ? `PAN ${fields.pan_number} matches required format`
        : `PAN ${fields.pan_number} does not match format [A-Z]{5}[0-9]{4}[A-Z]`,
    });
  }

  // Aadhaar Verhoeff checksum
  if (documentType === "aadhaar" && fields.aadhaar_number) {
    const valid = isValidAadhaar(fields.aadhaar_number);
    checks.push({
      check: "Aadhaar checksum validation",
      passed: valid,
      detail: valid
        ? "Aadhaar number passes Verhoeff checksum"
        : "Aadhaar number fails Verhoeff checksum validation",
    });
  }

  // DL number format
  if (documentType === "license" && fields.dl_number) {
    const valid = isValidDLNumber(fields.dl_number);
    checks.push({
      check: "DL number format",
      passed: valid,
      detail: valid
        ? `DL number ${fields.dl_number} matches Indian format`
        : `DL number ${fields.dl_number} does not match expected format`,
    });
  }

  // RC number format
  if (documentType === "rc_book" && fields.registration_number) {
    const valid = isValidVehicleReg(fields.registration_number);
    checks.push({
      check: "Vehicle registration format",
      passed: valid,
      detail: valid
        ? `Registration ${fields.registration_number} matches Indian format`
        : `Registration ${fields.registration_number} does not match XX-00-XX-0000 format`,
    });
  }

  // Expiry date checks for documents that have them
  const expiryField =
    fields.expiry_date ?? fields.expiry ?? fields.validity;
  if (expiryField) {
    if (isExpired(expiryField)) {
      checks.push({
        check: "Document expiry",
        passed: false,
        detail: `Document expired on ${expiryField}`,
      });
    } else if (isExpiringWithin(expiryField, 30)) {
      checks.push({
        check: "Document expiry",
        passed: true, // Not failed, but flagged below
        detail: `Document expires in ${daysUntilExpiry(expiryField)} days (${expiryField})`,
      });
    } else {
      checks.push({
        check: "Document expiry",
        passed: true,
        detail: `Document valid until ${expiryField}`,
      });
    }
  }

  // Name cross-reference against other documents
  const docName =
    fields.name ?? fields.owner_name ?? fields.insured_name;
  if (docName && crossReferenceData?.name) {
    const match = namesMatch(docName, crossReferenceData.name);
    checks.push({
      check: "Name cross-verification",
      passed: match,
      detail: match
        ? `Name "${docName}" matches reference name "${crossReferenceData.name}"`
        : `Name mismatch: document says "${docName}", reference says "${crossReferenceData.name}"`,
    });
  }

  // Vehicle class check for license vs vehicle type
  if (
    documentType === "license" &&
    fields.vehicle_classes &&
    crossReferenceData?.vehicleType
  ) {
    const classes = fields.vehicle_classes.toUpperCase();
    const vType = crossReferenceData.vehicleType;
    const needsHMV =
      vType === "12_seater" || vType === "16_seater";
    const hasLMV = classes.includes("LMV");
    const hasHMV =
      classes.includes("HMV") || classes.includes("HTV");

    let passed: boolean;
    let detail: string;

    if (needsHMV) {
      passed = hasHMV;
      detail = passed
        ? `License includes HMV class, valid for ${vType}`
        : `License missing HMV class required for ${vType}. Current classes: ${fields.vehicle_classes}`;
    } else {
      passed = hasLMV;
      detail = passed
        ? `License includes LMV class, valid for ${vType}`
        : `License missing LMV class required for ${vType}. Current classes: ${fields.vehicle_classes}`;
    }

    checks.push({
      check: "Vehicle class authorization",
      passed,
      detail,
    });
  }

  // Determine overall status
  const anyFailed = checks.some((c) => !c.passed);
  const hasExpiringSoon =
    expiryField != null && isExpiringWithin(expiryField, 30) && !isExpired(expiryField);
  const hasExpired = expiryField != null && isExpired(expiryField);

  let status: VerificationResult["status"];
  let notes: string;

  if (hasExpired || checks.some((c) => !c.passed && c.check !== "Document expiry")) {
    // Critical failures (format invalid, name mismatch, expired) => rejected
    if (hasExpired) {
      status = "rejected";
      notes = `Document has expired on ${expiryField}. Please upload a valid document.`;
    } else {
      const failedChecks = checks.filter((c) => !c.passed);
      status = "rejected";
      notes = failedChecks.map((c) => c.detail).join(". ");
    }
  } else if (hasExpiringSoon) {
    status = "flagged";
    notes = `Document expires in ${daysUntilExpiry(expiryField!)} days. Consider renewing soon.`;
  } else if (anyFailed) {
    status = "flagged";
    notes = checks
      .filter((c) => !c.passed)
      .map((c) => c.detail)
      .join(". ");
  } else {
    status = "passed";
    notes = "All verification checks passed.";
  }

  return { status, notes, checks };
}

export async function assessVehiclePhoto(
  _fileUrl: string,
  photoType: string
): Promise<PhotoAssessment> {
  // Simulate processing delay (1-2 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  // Mock scoring: most photos score 7-9, some variation by type
  const baseScores: Record<string, number> = {
    front: 8,
    rear: 8,
    left: 7,
    right: 7,
    interior_front: 8,
    interior_rear: 7,
    boot: 9,
    odometer: 8,
  };

  const base = baseScores[photoType] ?? 7;
  // Add small random variation: -1 to +1
  const variation = Math.round(Math.random() * 2) - 1;
  const score = Math.max(1, Math.min(10, base + variation));

  const isValid = score >= 4;
  const damageDetected = score <= 5 && Math.random() > 0.5;

  let notes = "";
  if (!isValid) {
    notes = `This does not appear to be a valid ${photoType.replace(/_/g, " ")} photo. Please retake.`;
  } else if (damageDetected) {
    notes = "Possible damage detected. Minor scratches or dents visible.";
  } else if (score >= 8) {
    notes = "Photo quality is excellent. Vehicle appears to be in good condition.";
  } else if (score >= 6) {
    notes = "Photo quality is acceptable. Vehicle condition looks adequate.";
  } else {
    notes = "Photo quality is below average. Consider retaking in better lighting.";
  }

  return { score, isValid, damageDetected, notes };
}
