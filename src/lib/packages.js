import path from 'path';

export function metadataPath(packageName) {
  return path.join('packages', `${packageName}.json`);
}

export function filePath(packageName, fileName) {
  return path.join('files', packageName, fileName);
}
