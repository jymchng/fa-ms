import * as fs from 'fs';
import * as path from 'path';
import { joinRelativeToPackageJson } from 'jacob-bot-common/dist/src/utils/path';
import { printAnyObjectWithStandardFormat } from 'jacob-bot-common/dist/src/utils/printing';
import * as prettier from 'prettier';
import prettierOptions from './.prettierrc.json' assert { type: 'json' };

console.log(
  `Global constants while running './build.ts':\n`,
  `\`prettierOptions\` = ${printAnyObjectWithStandardFormat(prettierOptions)};`,
);

function toTitleCase(input: string): string {
  // Split the input string into an array of words.
  const words = input.split(' ');

  // Map over each word, capitalizing the first letter and lowercasing the rest.
  const titleCasedWords = words.map((word) => {
    if (word) {
      // Check if the word is not an empty string.
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }
    return word; // Return the empty string as is.
  });

  // Join the array of words back into a single string with spaces.
  return titleCasedWords.join(' ');
}

// Define the paths
const rootDir = __dirname;
const targetDirs = {
  Config: joinRelativeToPackageJson('src/core/common/configs'),
  Secrets: joinRelativeToPackageJson('src/core/common/secrets'),
};
const buildScriptPath = path.join(rootDir, 'build.ts');

// Check if the target directory exists and create it if not
for (const targetDir of Object.values(targetDirs)) {
  console.log(`Creating \`targetDir\` = ${targetDir}`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

// Function to parse environment or secret files
function parseKeyValueFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} does not exist.`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const data: Record<string, string> = {};
  content.split(/\r?\n/).forEach((line) => {
    if (!line.trim().startsWith('#') && line.includes('=')) {
      const [key, value] = line.split('=', 2);
      if (!value) throw new Error(`Empty value for key ${key}`);
      data[key.trim()] = value.trim();
    }
  });
  return data;
}

// General function to determine the type based on the value
function determineType(value: string): string {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
    ? 'number'
    : 'string';
}

async function buildConfigFile(fileDir: string, fileNameFirstPart: string) {
  const fullFillName = `${fileDir}/.${fileNameFirstPart}.${process.env.NODE_ENV}`;
  const targetFile = path.join(targetDirs.Config, `index.ts`);
  const fileData = parseKeyValueFile(fullFillName);

  let content = `import { joinRelativeToPackageJson } from "jacob-bot-common/dist/src/utils/path";\nimport { parseKeyValueFileIntoConfiguration } from "jacob-bot-common/dist/src/configuration";\n\nexport type Config = {\n`;
  Object.entries(fileData).forEach(([key, value]) => {
    content += `  ${key}: ${determineType(value)};\n`;
  });
  content += '};\n\n';

  const additionalContent = `export const appConfigs = parseKeyValueFileIntoConfiguration<Config>(joinRelativeToPackageJson(\`.${fileNameFirstPart}.\${process.env.NODE_ENV}\`));`;
  // console.log(\`\\\`appConfigs\\\` are loaded: its value is\\n \${printAnyObjectWithStandardFormat(appConfigs)}\`);
  content += additionalContent;
  fs.writeFileSync(
    targetFile,
    await prettier.format(content, prettierOptions as prettier.Config),
  );
  console.log(
    `${fileNameFirstPart} file created successfully from ${fullFillName}.`,
  );
}

function generateSecretFileContentPerFile(
  fileDir: string,
  fileNameFirstPart: string,
): string {
  const fullFillName = `${fileDir}/.${fileNameFirstPart}.${process.env.NODE_ENV}`;
  const fileData = parseKeyValueFile(fullFillName);

  const typeName = (function () {
    if (fileNameFirstPart.toLowerCase() === 'secrets') {
      return toTitleCase(fileNameFirstPart);
    }
    return toTitleCase(fileNameFirstPart) + 'Secrets';
  })();

  let content = `export type ${typeName} = {\n`;
  Object.entries(fileData).forEach(([key, value]) => {
    content += `  ${key}: Secret<${determineType(value)}>;\n`;
  });
  content += '};\n\n';

  const additionalContent = `export const app${typeName} = Secret.parseKeyValueFileIntoObjectOfKeySecret<${typeName}>(joinRelativeToPackageJson(\`secrets/.${fileNameFirstPart}.\${process.env.NODE_ENV}\`));\n\n`;
  // console.log(\`\\\`app${typeName}\\\` are loaded: its value is\\n \${printAnyObjectWithStandardFormat(app${typeName})}\`);\n\n
  content += additionalContent;

  return content;
}

// Build secrets from secret files
async function buildSecrets() {
  const secretsDir = path.join(rootDir, 'secrets');
  const dir = fs.opendirSync(secretsDir); // Get the directory object
  let baseContent =
    'import { Secret } from "jacob-bot-common/dist/src/secret";\nimport { joinRelativeToPackageJson } from "jacob-bot-common/dist/src/utils/path";\n\n';
  let dirent;
  while ((dirent = dir.readSync()) !== null) {
    // Split the filename into parts based on the dot
    const parts = dirent.name.split('.');
    // Check if the file has exactly three parts and the last part does not match the NODE_ENV
    if (parts.length === 3 && parts[2] === process.env.NODE_ENV) {
      console.log('Building secrets for', dirent.name);
      baseContent += generateSecretFileContentPerFile(secretsDir, parts[1]);
    }
  }
  dir.closeSync(); // Close the directory stream
  const targetFilePath = path.join(targetDirs.Secrets, `index.ts`);
  baseContent = await prettier.format(
    baseContent,
    prettierOptions as prettier.Config,
  );
  fs.writeFileSync(targetFilePath, baseContent);
  console.log(
    `\`${targetFilePath}\` file created successfully from files in \`${secretsDir}\`.`,
  );
}
const main = async () => {
  // Example function calls
  await buildConfigFile(rootDir, 'env');
  await buildSecrets();
  return 0;
};

main();
