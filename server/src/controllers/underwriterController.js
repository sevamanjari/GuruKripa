import { loadData, saveData } from "../data/dataStore.js";

/**
 * Get all insurance underwriters / companies created by user based on their dealings
 */
export const getUnderwriters = (req, res) => {
  try {
    const data = loadData();
    const underwriters = (data.underwriters || []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.json({
      success: true,
      count: underwriters.length,
      data: underwriters
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new insurance underwriter company profile
 */
export const createUnderwriter = (req, res) => {
  try {
    const { name, agencyCode, phone, email, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Underwriter / Company name is required."
      });
    }

    const trimmedName = name.trim();
    const data = loadData();
    data.underwriters = data.underwriters || [];

    // Check for duplicate name
    const existing = data.underwriters.find(
      (u) => u.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Underwriter '${trimmedName}' is already registered in your list.`,
        data: existing
      });
    }

    const newId = `UND-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`;
    const newUnderwriter = {
      id: newId,
      name: trimmedName,
      agencyCode: (agencyCode || "").trim(),
      phone: (phone || "").trim(),
      email: (email || "").trim(),
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    data.underwriters.push(newUnderwriter);
    saveData(data);

    res.status(201).json({
      success: true,
      message: `Underwriter '${trimmedName}' added successfully.`,
      data: newUnderwriter
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update an underwriter profile
 */
export const updateUnderwriter = (req, res) => {
  try {
    const { id } = req.params;
    const { name, agencyCode, phone, email, notes } = req.body;

    const data = loadData();
    data.underwriters = data.underwriters || [];

    const index = data.underwriters.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: "Underwriter not found."
      });
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const duplicate = data.underwriters.find(
        (u) => u.id !== id && u.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: `Another underwriter with name '${trimmedName}' already exists.`
        });
      }
      data.underwriters[index].name = trimmedName;
    }

    if (agencyCode !== undefined) data.underwriters[index].agencyCode = agencyCode.trim();
    if (phone !== undefined) data.underwriters[index].phone = phone.trim();
    if (email !== undefined) data.underwriters[index].email = email.trim();
    if (notes !== undefined) data.underwriters[index].notes = notes.trim();
    data.underwriters[index].updatedAt = new Date().toISOString();

    saveData(data);

    res.json({
      success: true,
      message: "Underwriter updated successfully.",
      data: data.underwriters[index]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete an underwriter profile
 */
export const deleteUnderwriter = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    data.underwriters = data.underwriters || [];

    const initialLen = data.underwriters.length;
    data.underwriters = data.underwriters.filter((u) => u.id !== id);

    if (data.underwriters.length === initialLen) {
      return res.status(404).json({
        success: false,
        error: "Underwriter not found."
      });
    }

    saveData(data);

    res.json({
      success: true,
      message: "Underwriter removed successfully."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
