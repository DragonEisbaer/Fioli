const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 6969;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`[${new Date().toISOString()}] Zugriff von IP: ${clientIp} auf ${req.method} ${req.url}`);
  next();
});

// Pfad zur JSON-Datei
const dataFilePath = path.join(__dirname, "Gerichte.json");
const wochenplanPath = path.join(__dirname, "Wochenplan.json");
const vorratskammerPath = path.join(__dirname, "Vorratskammer.json");

// Hilfsfunktion: Lade die JSON-Daten
const loadData = () => {
  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data);
};

// Hilfsfunktion: Speichere die JSON-Daten
const saveData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
};

// Hilfsfunktion: Einheit umrechnen
const convertToBaseUnit = (quantity, unit) => {
  const unitConversions = {
    g: 1, // Gramm als Basiseinheit
    kg: 1000, // 1 kg = 1000 g
    ml: 1, // Milliliter als Basiseinheit
    l: 1000, // 1 l = 1000 ml
    stück: 1, // Stück bleibt unverändert
  };

  if (!unitConversions[unit]) {
    throw new Error(`Unbekannte Einheit: ${unit}`);
  }

  return quantity * unitConversions[unit];
};

// Hilfsfunktion: Einheit zurückrechnen
const convertFromBaseUnit = (quantity, baseUnit) => {
  const unitConversions = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    stück: 1,
  };

  if (!unitConversions[baseUnit]) {
    throw new Error(`Unbekannte Basiseinheit: ${baseUnit}`);
  }

  // Wenn möglich, in größere Einheit umrechnen (z. B. g -> kg)
  if (baseUnit === "g" && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: "kg" };
  } else if (baseUnit === "ml" && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: "l" };
  }

  return { quantity, unit: baseUnit };
};

// Endpunkt: Alle Gerichte abrufen
app.get("/gerichte", (req, res) => {
  try {
    const data = loadData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Daten" });
  }
});

// Endpunkt: Neues Gericht hinzufügen
app.post("/gerichte/:category", (req, res) => {
  const { category } = req.params;
  const newGericht = req.body;

  try {
    const data = loadData();

    if (!data[category]) {
      return res.status(400).json({ error: "Ungültige Kategorie" });
    }

    data[category].push(newGericht);
    saveData(data);

    res.status(201).json({ message: "Gericht hinzugefügt", data: newGericht });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Speichern der Daten" });
  }
});

// Endpunkt: Gericht löschen
app.delete("/gerichte/:category/:value", (req, res) => {
  const { category, value } = req.params;
  console.log("Kategorie:", category);
  console.log("Wert:", value);

  try {
    const data = loadData();

    if (!data[category]) {
      console.error("Kategorie nicht gefunden:", category);
      return res.status(400).json({ error: "Ungültige Kategorie" });
    }

    const updatedCategory = data[category].filter((gericht) => gericht.value !== value);

    if (updatedCategory.length === data[category].length) {
      console.error("Gericht nicht gefunden:", value);
      return res.status(404).json({ error: "Gericht nicht gefunden" });
    }

    data[category] = updatedCategory;
    saveData(data);

    res.status(200).json({ message: "Gericht gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Gerichts:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Gerichts" });
  }
});

// Endpunkt: Gericht aktualisieren
app.put("/gerichte/:category/:value", (req, res) => {
  const { category, value } = req.params;
  const updatedGericht = req.body;

  try {
    const data = loadData();

    if (!data[category]) {
      return res.status(400).json({ error: "Ungültige Kategorie" });
    }

    const index = data[category].findIndex((gericht) => gericht.value === value);
    if (index === -1) {
      return res.status(404).json({ error: "Gericht nicht gefunden" });
    }

    data[category][index] = { ...data[category][index], ...updatedGericht };
    saveData(data);

    res.status(200).json({ message: "Gericht aktualisiert", data: data[category][index] });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Aktualisieren des Gerichts" });
  }
});

// Endpunkt: Ausgewählte Gerichte speichern
app.post("/wochenplan", (req, res) => {
  const selectedGerichte = req.body;

  try {
    fs.writeFileSync(wochenplanPath, JSON.stringify(selectedGerichte, null, 2), "utf8");
    console.log("Wochenplan gespeichert:", selectedGerichte);
    res.status(201).json({ message: "Wochenplan gespeichert", data: selectedGerichte });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Speichern des Wochenplans" });
  }
});

// Endpunkt: Wochenplan aktualisieren
app.patch("/wochenplan", (req, res) => {
  const { tag, kategorie, gericht } = req.body;

  console.log("Empfangene Daten:", { tag, kategorie, gericht });

  try {
    const wochenplan = JSON.parse(fs.readFileSync(wochenplanPath, "utf8"));

    // Kategorie abgleichen (z. B. "frühstück" -> "Frühstück")
    const kategorieKey = Object.keys(wochenplan[tag] || {}).find(
      (key) => key.toLowerCase() === kategorie.toLowerCase()
    );

    if (!wochenplan[tag]) {
      console.error("Tag nicht gefunden:", tag);
      return res.status(400).json({ error: `Tag "${tag}" nicht gefunden im Wochenplan.` });
    }

    if (!kategorieKey) {
      console.error("Kategorie nicht gefunden:", kategorie);
      console.log(wochenplan[tag]);
      return res.status(400).json({ error: `Kategorie "${kategorie}" nicht gefunden für Tag "${tag}".` });
    }

    // Kategorie aktualisieren
    wochenplan[tag][kategorieKey] = gericht;

    // Wochenplan speichern
    fs.writeFileSync(wochenplanPath, JSON.stringify(wochenplan, null, 2), "utf8");

    res.status(200).json({ message: "Wochenplan erfolgreich aktualisiert", data: wochenplan });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Wochenplans:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Wochenplans" });
  }
});

// Endpunkt: Wochenplan zurücksetzen
app.post("/wochenplan/reset", (req, res) => {
  try {
    const wochenplan = JSON.parse(fs.readFileSync(wochenplanPath, "utf8"));

    // Alle Gerichte auf null setzen
    Object.keys(wochenplan).forEach((tag) => {
      Object.keys(wochenplan[tag]).forEach((kategorie) => {
        wochenplan[tag][kategorie] = null;
      });
    });

    // Wochenplan speichern
    fs.writeFileSync(wochenplanPath, JSON.stringify(wochenplan, null, 2), "utf8");

    res.status(200).json({ message: "Wochenplan erfolgreich zurückgesetzt", data: wochenplan });
  } catch (error) {
    console.error("Fehler beim Zurücksetzen des Wochenplans:", error);
    res.status(500).json({ error: "Fehler beim Zurücksetzen des Wochenplans" });
  }
});

// Endpunkt: Wochenplan abrufen
app.get("/wochenplan", (req, res) => {
  try {
    const wochenplan = JSON.parse(fs.readFileSync(wochenplanPath, "utf8"));
    res.status(200).json(wochenplan);
  } catch (error) {
    console.error("Fehler beim Abrufen des Wochenplans:", error);
    res.status(500).json({ error: "Fehler beim Abrufen des Wochenplans" });
  }
});

// Endpunkt: Einkaufsliste berechnen
app.get("/einkaufsliste", (req, res) => {
  try {
    const wochenplan = JSON.parse(fs.readFileSync(wochenplanPath, "utf8"));
    const vorratskammer = JSON.parse(fs.readFileSync(vorratskammerPath, "utf8"));
    const gerichte = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

    const einkaufsliste = {};

    // Zutaten aus dem Wochenplan summieren
    Object.values(wochenplan).forEach((tag) => {
      Object.values(tag).forEach((gerichtName) => {
        if (gerichtName) {
          const gericht = Object.values(gerichte).flat().find((g) => g.value === gerichtName);
          if (gericht) {
            gericht.zutaten.forEach(({ name, quantity, unit }) => {
              const normalizedName = name.toLowerCase(); // Konvertiere den Namen in Kleinbuchstaben
              const baseQuantity = convertToBaseUnit(quantity, unit);

              if (!einkaufsliste[normalizedName]) {
                einkaufsliste[normalizedName] = { quantity: 0, unit };
              }

              einkaufsliste[normalizedName].quantity += baseQuantity;
            });
          }
        }
      });
    });

    // Vorratskammer abziehen
    Object.entries(vorratskammer).forEach(([name, { quantity, unit }]) => {
      const normalizedName = name.toLowerCase(); // Konvertiere den Namen in Kleinbuchstaben
      if (einkaufsliste[normalizedName]) {
        const baseQuantityVorratskammer = convertToBaseUnit(quantity, unit);
        const baseQuantityEinkaufsliste = convertToBaseUnit(einkaufsliste[normalizedName].quantity, einkaufsliste[normalizedName].unit);

        // Ziehe die Vorratskammer-Menge ab
        let remainingQuantity = baseQuantityEinkaufsliste - baseQuantityVorratskammer;

        if (remainingQuantity > 0) {
          // Konvertiere zurück in die ursprüngliche Einheit der Einkaufsliste
          const { quantity: finalQuantity, unit: finalUnit } = convertFromBaseUnit(remainingQuantity, einkaufsliste[normalizedName].unit);
          einkaufsliste[normalizedName] = { quantity: finalQuantity, unit: finalUnit };
        } else {
          // Entferne die Zutat, wenn die Menge <= 0 ist
          delete einkaufsliste[normalizedName];
        }
      }
    });

    // Einheiten zurückrechnen
    Object.keys(einkaufsliste).forEach((name) => {
      const { quantity, unit } = einkaufsliste[name];
      const converted = convertFromBaseUnit(quantity, unit);
      einkaufsliste[name] = converted;
    });

    res.status(200).json(einkaufsliste);
  } catch (error) {
    console.error("Fehler beim Berechnen der Einkaufsliste:", error);
    res.status(500).json({ error: "Fehler beim Berechnen der Einkaufsliste" });
  }
});

// Endpunkt: Vorratskammer exportieren
app.get("/export/vorratskammer", (req, res) => {
  try {
    const vorratskammer = JSON.parse(fs.readFileSync(vorratskammerPath, "utf8"));
    res.status(200).json(vorratskammer);
  } catch (error) {
    console.error("Fehler beim Exportieren der Vorratskammer:", error);
    res.status(500).json({ error: "Fehler beim Exportieren der Vorratskammer" });
  }
});

// Endpunkt: Gerichte exportieren
app.get("/export/gerichte", (req, res) => {
  try {
    const gerichte = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    res.status(200).json(gerichte);
  } catch (error) {
    console.error("Fehler beim Exportieren der Gerichte:", error);
    res.status(500).json({ error: "Fehler beim Exportieren der Gerichte" });
  }
});

// Endpunkt: Wochenplan exportieren
app.get("/export/wochenplan", (req, res) => {
  try {
    const wochenplan = JSON.parse(fs.readFileSync(wochenplanPath, "utf8"));
    res.status(200).json(wochenplan);
  } catch (error) {
    console.error("Fehler beim Exportieren des Wochenplans:", error);
    res.status(500).json({ error: "Fehler beim Exportieren des Wochenplans" });
  }
});

// Endpunkt: Vorratskammer abrufen
app.get("/vorratskammer", (req, res) => {
  try {
    const vorratskammer = JSON.parse(fs.readFileSync(vorratskammerPath, "utf8"));
    res.status(200).json(vorratskammer);
  } catch (error) {
    console.error("Fehler beim Abrufen der Vorratskammer:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Vorratskammer" });
  }
});

// Endpunkt: Vorratskammer aktualisieren
app.post("/vorratskammer", (req, res) => {
  const updatedVorratskammer = req.body;

  try {
    // Konvertiere alle Zutatennamen in Kleinbuchstaben
    const normalizedVorratskammer = Object.entries(updatedVorratskammer).reduce((acc, [name, value]) => {
      acc[name.toLowerCase()] = value;
      return acc;
    }, {});

    fs.writeFileSync(vorratskammerPath, JSON.stringify(normalizedVorratskammer, null, 2), "utf8");
    res.status(200).json({ message: "Vorratskammer erfolgreich aktualisiert" });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Vorratskammer:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Vorratskammer" });
  }
});

// Endpunkt: Zutat aus der Vorratskammer löschen
app.delete("/vorratskammer/:name", (req, res) => {
  const name = req.params.name.toLowerCase(); // Normalisiere den Namen in Kleinbuchstaben

  try {
    const vorratskammer = JSON.parse(fs.readFileSync(vorratskammerPath, "utf8"));

    if (vorratskammer[name]) {
      delete vorratskammer[name]; // Entferne die Zutat
      fs.writeFileSync(vorratskammerPath, JSON.stringify(vorratskammer, null, 2), "utf8");
      res.status(200).json({ message: `Zutat '${name}' wurde gelöscht.` });
    } else {
      res.status(404).json({ error: `Zutat '${name}' nicht gefunden.` });
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Zutat:", error);
    res.status(500).json({ error: "Fehler beim Löschen der Zutat." });
  }
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});