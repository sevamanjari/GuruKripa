import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  initialCustomers,
  initialVehicles,
  initialInsurances,
  initialPermits,
  initialUnderwriters,
  rtoServicesCatalog
} from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "store.json");

const getDefaultData = () => ({
  customers: [...initialCustomers],
  vehicles: [...initialVehicles],
  insurances: [...initialInsurances],
  permits: [...initialPermits],
  underwriters: [...initialUnderwriters],
  rtoServices: [...rtoServicesCatalog],
  lastUpdated: new Date().toISOString()
});

export const loadData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getDefaultData();
      saveData(initial);
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.underwriters) parsed.underwriters = [];
    return parsed;
  } catch (error) {
    console.error("Error reading data file, using default seed:", error);
    return getDefaultData();
  }
};

export const saveData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
};

export const resetData = () => {
  const fresh = getDefaultData();
  saveData(fresh);
  return fresh;
};
