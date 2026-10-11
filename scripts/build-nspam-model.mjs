import { readFileSync, writeFileSync } from "node:fs";

const [modelPath, calibrationPath, outputPath] = process.argv.slice(2);

if (!modelPath || !calibrationPath || !outputPath) {
  console.log(
    "Usage: node scripts/build-nspam-model.mjs <model.txt> <calibration.json> <output.bin>",
  );
  process.exit(1);
}

const TREE_FIELDS = [
  "split_feature",
  "threshold",
  "left_child",
  "right_child",
  "leaf_value",
];

const parseNumbers = (value) => value.trim().split(/\s+/).map(Number);

const parseTrees = (modelText) => {
  let trees = [];
  let section = null;
  const finishTree = () => {
    if (!section) return;
    trees.push({
      splitFeature: parseNumbers(section.split_feature),
      threshold: parseNumbers(section.threshold),
      leftChild: parseNumbers(section.left_child),
      rightChild: parseNumbers(section.right_child),
      leafValue: parseNumbers(section.leaf_value),
    });
    section = null;
  };
  for (const rawLine of modelText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("Tree=")) {
      finishTree();
      section = {};
      continue;
    }
    if (line === "end of trees") {
      finishTree();
      break;
    }
    if (!section) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.substring(0, separator);
    if (TREE_FIELDS.includes(key)) section[key] = line.substring(separator + 1);
  }
  return trees;
};

const trees = parseTrees(readFileSync(modelPath, "utf8"));
const calibration = JSON.parse(readFileSync(calibrationPath, "utf8"));
const calibrationX = calibration.calib_x;
const calibrationY = calibration.calib_y;

if (trees.length === 0) throw new Error("The nspam model contains no trees.");
if (calibrationX.length !== calibrationY.length)
  throw new Error("The nspam calibration points are not aligned.");

const nodeCount = trees.reduce((sum, tree) => sum + tree.splitFeature.length, 0);
const leafCount = trees.reduce((sum, tree) => sum + tree.leafValue.length, 0);
const header = [trees.length, nodeCount, leafCount, calibrationX.length];
const buffer = Buffer.alloc(
  header.length * 4 +
    trees.length * 8 +
    nodeCount * 12 +
    leafCount * 4 +
    calibrationX.length * 8,
);

let offset = 0;
const writeUint32 = (value) => {
  buffer.writeUInt32LE(value, offset);
  offset += 4;
};
const writeInt32 = (value) => {
  buffer.writeInt32LE(value, offset);
  offset += 4;
};
const writeFloat32 = (value) => {
  buffer.writeFloatLE(value, offset);
  offset += 4;
};
const writeInt16 = (value) => {
  if (value < -32768 || value > 32767)
    throw new Error("The nspam model has a tree too large to pack.");
  buffer.writeInt16LE(value, offset);
  offset += 2;
};

header.forEach(writeUint32);
trees.forEach((tree) => writeUint32(tree.splitFeature.length));
trees.forEach((tree) => writeUint32(tree.leafValue.length));
trees.forEach((tree) => tree.splitFeature.forEach(writeInt32));
trees.forEach((tree) => tree.threshold.forEach(writeFloat32));
trees.forEach((tree) => tree.leafValue.forEach(writeFloat32));
calibrationX.forEach(writeFloat32);
calibrationY.forEach(writeFloat32);
trees.forEach((tree) => tree.leftChild.forEach(writeInt16));
trees.forEach((tree) => tree.rightChild.forEach(writeInt16));

writeFileSync(outputPath, buffer);
console.log(
  `Packed ${trees.length} trees, ${nodeCount} nodes and ${leafCount} leaves into ${buffer.length} bytes`,
);
