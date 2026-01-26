const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Add support for Firebase's internal modules (.cjs files)
config.resolver.sourceExts.push("cjs");

// 2. Disable package exports handling (often conflicts with Firebase)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;