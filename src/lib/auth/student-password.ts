import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_COST = 32768;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;
const DUMMY_SALT = "5d2b4a98403d6f337a516a58f792ef2d";

function derivePasswordKey(
  password: string,
  salt: string,
  cost = SCRYPT_COST,
  blockSize = SCRYPT_BLOCK_SIZE,
  parallelization = SCRYPT_PARALLELIZATION,
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem: SCRYPT_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashStudentPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await derivePasswordKey(password, salt);

  return [
    "scrypt",
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt,
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyStudentPassword(password: string, storedHash: string) {
  const [algorithm, costValue, blockSizeValue, parallelizationValue, salt, hash] =
    storedHash.split("$");
  const cost = Number(costValue);
  const blockSize = Number(blockSizeValue);
  const parallelization = Number(parallelizationValue);

  if (
    algorithm !== "scrypt" ||
    cost !== SCRYPT_COST ||
    blockSize !== SCRYPT_BLOCK_SIZE ||
    parallelization !== SCRYPT_PARALLELIZATION ||
    !/^[a-f0-9]{32}$/i.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/i.test(hash ?? "")
  ) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = await derivePasswordKey(
    password,
    salt,
    cost,
    blockSize,
    parallelization,
  );

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function performDummyStudentPasswordCheck(password: string) {
  await derivePasswordKey(password, DUMMY_SALT);
}
