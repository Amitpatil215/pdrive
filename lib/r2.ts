import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PRESIGN_GET_SECONDS, PRESIGN_PUT_SECONDS } from "@/lib/constants";
import { r2Config } from "@/lib/env";

const CHECKSUM_HEADERS = new Set([
  "x-amz-checksum-crc32",
  "x-amz-checksum-crc32c",
  "x-amz-checksum-sha1",
  "x-amz-checksum-sha256",
  "x-amz-sdk-checksum-algorithm",
  "x-amz-trailer",
]);

function client() {
  const { accessKeyId, secretAccessKey, endpoint } = r2Config();
  return new S3Client({
    region: "auto",
    endpoint: endpoint.replace(/\/$/, ""),
    credentials: { accessKeyId, secretAccessKey },
    // Path-style URLs match Cloudflare's R2 S3 examples.
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function bucket() {
  return r2Config().bucket;
}

function presignOptions(expiresIn: number) {
  return { expiresIn, unsignableHeaders: CHECKSUM_HEADERS };
}

export async function presignPut(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client(), command, presignOptions(PRESIGN_PUT_SECONDS));
}

export async function presignGet(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
  });
  return getSignedUrl(client(), command, presignOptions(PRESIGN_GET_SECONDS));
}

export async function objectExists(key: string) {
  try {
    await client().send(
      new HeadObjectCommand({ Bucket: bucket(), Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(key: string) {
  await client().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}
