const Manufacturer = require("../models/manufacturerModel");

// Get all manufacturers
exports.getManufacturers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const manufacturers = await Manufacturer.find(query);
    res.json(manufacturers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific manufacturer by ID
exports.getManufacturerById = async (req, res) => {
  try {
    console.log(`Fetching Manufacturer with ID: ${req.params.id}`);
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      console.log(`Manufacturer not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: "Manufacturer not found 😔" });
    }
    res.json(manufacturer);
  } catch (err) {
    console.error("Error fetching manufacturer:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// Create a new manufacturer
exports.createManufacturer = async (req, res) => {
  const manufacturer = new Manufacturer({
    name: req.body.name,
    brands: req.body.brands,
  });
  try {
    const newManufacturer = await manufacturer.save();
    res.status(201).json(newManufacturer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a manufacturer
exports.updateManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found 😔" });
    }
    manufacturer.name = req.body.name;
    manufacturer.brands = req.body.brands;
    const updatedManufacturer = await manufacturer.save();
    res.json(updatedManufacturer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Archive a manufacturer
exports.archiveManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found 😔" });
    }
    manufacturer.isArchived = true;
    const updatedManufacturer = await manufacturer.save();
    res.json(updatedManufacturer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unarchive a manufacturer
exports.unarchiveManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found 😔" });
    }
    manufacturer.isArchived = false;
    const updatedManufacturer = await manufacturer.save();
    res.json(updatedManufacturer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a manufacturer
exports.deleteManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found 😔" });
    }
    await manufacturer.deleteOne();
    res.json({ message: "Manufacturer deleted 🫢" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
