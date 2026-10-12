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
import { isDbConnected } from "../config/db.js";
import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Insurance from "../models/Insurance.js";
import Permit from "../models/Permit.js";
import Underwriter from "../models/Underwriter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Store data outside of src/ so node --watch-path=src is not triggered on database saves
const DATA_FILE = path.resolve(__dirname, "../../data/store.json");

const getDefaultData = () => ({
  customers: [...initialCustomers],
  vehicles: [...initialVehicles],
  insurances: [...initialInsurances],
  permits: [...initialPermits],
  underwriters: [...initialUnderwriters],
  rtoServices: [...rtoServicesCatalog],
  lastUpdated: new Date().toISOString()
});

const stripMongoId = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
};

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
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");

    // Asynchronously synchronize with MongoDB Atlas if connected
    if (isDbConnected()) {
      syncToMongo(data).catch((err) =>
        console.error("Background Mongo sync error:", err.message)
      );
    }
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

/**
 * Synchronize all memory/local records to MongoDB Atlas
 */
export const syncToMongo = async (data) => {
  if (!isDbConnected()) return;
  try {
    const tasks = [];
    if (data.customers) tasks.push(syncCollection(Customer, data.customers));
    if (data.vehicles) tasks.push(syncCollection(Vehicle, data.vehicles));
    if (data.insurances) tasks.push(syncCollection(Insurance, data.insurances));
    if (data.permits) tasks.push(syncCollection(Permit, data.permits));
    if (data.underwriters) tasks.push(syncCollection(Underwriter, data.underwriters));
    await Promise.all(tasks);
  } catch (err) {
    console.error("Failed to sync records to MongoDB Atlas:", err.message);
  }
};

/**
 * Sync individual collection with delete & upsert bulk operations
 */
async function syncCollection(Model, items) {
  if (!items || items.length === 0) {
    await Model.deleteMany({});
    return;
  }

  const currentIds = items.map((i) => i.id);
  // Remove deleted items
  await Model.deleteMany({ id: { $nin: currentIds } });

  // Upsert current items
  const ops = items.map((item) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: item },
      upsert: true
    }
  }));

  if (ops.length > 0) {
    await Model.bulkWrite(ops);
  }
}

/**
 * Hydrate local store from MongoDB Atlas on server startup
 */
export const syncFromMongo = async () => {
  if (!isDbConnected()) return;

  try {
    const [customers, vehicles, insurances, permits, underwriters] = await Promise.all([
      Customer.find().lean(),
      Vehicle.find().lean(),
      Insurance.find().lean(),
      Permit.find().lean(),
      Underwriter.find().lean()
    ]);

    const mongoTotal =
      customers.length +
      vehicles.length +
      insurances.length +
      permits.length +
      underwriters.length;

    const local = loadData();
    const localTotal =
      (local.customers?.length || 0) +
      (local.vehicles?.length || 0) +
      (local.insurances?.length || 0) +
      (local.permits?.length || 0) +
      (local.underwriters?.length || 0);

    if (mongoTotal > 0) {
      local.customers = customers.map(stripMongoId);
      local.vehicles = vehicles.map(stripMongoId);
      local.insurances = insurances.map(stripMongoId);
      local.permits = permits.map(stripMongoId);
      local.underwriters = underwriters.map(stripMongoId);
      local.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(local, null, 2), "utf-8");
      console.log(`🍃 Synced ${mongoTotal} live records from MongoDB Atlas.`);
    } else if (localTotal > 0) {
      await syncToMongo(local);
      console.log(`🍃 Seeded ${localTotal} records to MongoDB Atlas.`);
    }
  } catch (err) {
    console.error("Error during initial MongoDB sync:", err.message);
  }
};
