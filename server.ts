import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import cors from 'cors';
import Database from 'better-sqlite3';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const EXCEL_FILE = 'database.xlsx';
const DB_FILE = 'database.db';
const REQUIRED_SHEETS = ['suppliers', 'associations', 'warehouses', 'petrol', 'gas', 'jamiyati'];

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yelderby_db_user:Joo6226@cluster0.isisuck.mongodb.net/?appName=Cluster';

// Define Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: String
});

const supplierSchema = new mongoose.Schema({
  merchantCode: String,
  name: { type: String, required: true },
  nationalId: String,
  phone: String,
  phase: String,
  center: String,
  village: String,
  address: String,
  insuranceAmount: Number,
  fundingType: String,
  status: String
});

const associationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  members: Number,
  location: String,
  status: String
});

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: Number,
  currentStock: Number,
  manager: String,
  lastAudit: String,
  status: String
});

const petrolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  district: String,
  fuelType: String,
  dailySales: Number,
  location: String,
  status: String
});

const gasSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: String,
  manager: String,
  domesticCount: Number,
  commercialCount: Number,
  status: String
});

const jamiyatiSchema = new mongoose.Schema({
  m: Number,
  phase: String,
  ownerName: { type: String, required: true },
  status: String,
  reason: String,
  district: String,
  village: String,
  address: String,
  nationalId: String,
  phone: String,
  merchantCode: String,
  fundingType: String,
  insuranceAmount: Number
});

// Models
const User = mongoose.model('User', userSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Association = mongoose.model('Association', associationSchema);
const Warehouse = mongoose.model('Warehouse', warehouseSchema);
const Petrol = mongoose.model('Petrol', petrolSchema);
const Gas = mongoose.model('Gas', gasSchema);
const Jamiyati = mongoose.model('Jamiyati', jamiyatiSchema);

const Models: { [key: string]: mongoose.Model<any> } = {
  suppliers: Supplier,
  associations: Association,
  warehouses: Warehouse,
  petrol: Petrol,
  gas: Gas,
  jamiyati: Jamiyati,
  users: User
};

let lastDbError: string | null = null;

// Initialize MongoDB and Migrate if needed
async function initDb() {
  const maxRetries = 3;
  let retries = 0;
  lastDbError = null;

  while (retries < maxRetries) {
    try {
      console.log(`[DB] Attempting to connect to MongoDB (Attempt ${retries + 1}/${maxRetries})...`);
      
      // Mask password in logs for security
      const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
      console.log(`[DB] URI: ${maskedUri}`);
      
      // Set up global connection listeners if not already set
      if (mongoose.connection.listeners('error').length === 0) {
        mongoose.connection.on('error', (err) => {
          console.error('[DB] Mongoose connection error event:', err);
          lastDbError = String(err);
        });
        mongoose.connection.on('disconnected', () => {
          console.warn('[DB] Mongoose disconnected');
          lastDbError = 'Disconnected from MongoDB';
        });
      }

      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000, // 15s timeout
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      
      console.log('[DB] Connected to MongoDB successfully');
      lastDbError = null;
      
      // Verify connection by doing a simple count
      await User.countDocuments();
      console.log('[DB] Verified connection with a test query');
      
      break; // Success, exit loop
    } catch (err) {
      retries++;
      lastDbError = String(err);
      console.error(`[DB] Connection attempt ${retries} failed:`, err);
      if (retries >= maxRetries) {
        console.error('[DB] Max retries reached. Database features may be unavailable.');
        return; // Exit function after max retries
      }
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  try {
    // Seed initial users if empty
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log('[Seed] Seeding initial users...');
      await User.create([
        { username: 'admin', password: 'admin246', name: 'المدير العام', role: 'admin' },
        { username: 'viewer', password: 'viewer123', name: 'مشاهد البيانات', role: 'viewer' }
      ]);
    }

    // Migration from SQLite to MongoDB if SQLite exists and MongoDB collections are empty
    if (fs.existsSync(DB_FILE)) {
      try {
        const db = new Database(DB_FILE);
        console.log('[Migration] Checking for data in SQLite to migrate to MongoDB...');
        
        for (const sheetName of REQUIRED_SHEETS) {
          const mongoCount = await Models[sheetName].countDocuments();
          if (mongoCount === 0) {
            try {
              const sqliteData = db.prepare(`SELECT * FROM ${sheetName}`).all() as any[];
              if (sqliteData.length > 0) {
                console.log(`[Migration] Migrating ${sqliteData.length} items from SQLite ${sheetName} to MongoDB...`);
                const cleanedData = sqliteData.map(({ id, ...rest }) => rest);
                await Models[sheetName].insertMany(cleanedData);
              }
            } catch (e) {
              console.warn(`[Migration] Could not migrate ${sheetName}:`, e);
            }
          }
        }
        db.close();
      } catch (e) {
        console.error('[Migration] SQLite access failed:', e);
      }
    }

    // Seed initial data if still empty
    for (const sheetName of REQUIRED_SHEETS) {
      const count = await Models[sheetName].countDocuments();
      if (count === 0) {
        console.log(`[Seed] Seeding initial data for ${sheetName}...`);
        if (sheetName === 'suppliers') {
          await Supplier.create([
            { 
              merchantCode: '222000734029', 
              name: 'أحمد محمد علي حسن', 
              nationalId: '28501012201456', 
              phone: '01012345678', 
              phase: 'الأولى', 
              center: 'مركز بني سويف', 
              village: 'تزمنت الشرقية', 
              address: 'شارع البحر', 
              insuranceAmount: 15000, 
              fundingType: 'ذاتي', 
              status: 'نشط' 
            },
            { 
              merchantCode: '222000734055', 
              name: 'محمود سيد إبراهيم', 
              nationalId: '29005052201987', 
              phone: '01122334455', 
              phase: 'الثانية', 
              center: 'الواسطى', 
              village: 'قمن العروس', 
              address: 'بجوار المسجد الكبير', 
              insuranceAmount: 12000, 
              fundingType: 'قرض', 
              status: 'متوقف' 
            }
          ]);
        } else if (sheetName === 'associations') {
          await Association.create([
            { name: 'جمعية الوفاء الخيرية', type: 'خيرية', members: 150, location: 'بني سويف', status: 'نشط' },
            { name: 'الجمعية الاستهلاكية بالعظماء', type: 'استهلاكية', members: 85, location: 'ناصر', status: 'نشط' }
          ]);
        } else if (sheetName === 'warehouses') {
          await Warehouse.create([
            { name: 'مخبز الأمل الآلي', capacity: 5000, currentStock: 3200, manager: 'سيد حسن', lastAudit: '2024-03-10', status: 'نشط' },
            { name: 'مطحن بني سويف الرئيسي', capacity: 20000, currentStock: 15000, manager: 'إبراهيم علي', lastAudit: '2024-03-15', status: 'نشط' }
          ]);
        } else if (sheetName === 'petrol') {
          await Petrol.create([
            { name: 'محطة مصر للبترول - بني سويف', company: 'مصر للبترول', district: 'بندر بني سويف', fuelType: 'بنزين 92/95', dailySales: 4500, location: 'شارع صلاح سالم', status: 'نشط' },
            { name: 'محطة توتال - الواسطى', company: 'توتال', district: 'الواسطى', fuelType: 'سولار/بنزين', dailySales: 6000, location: 'طريق القاهرة - أسيوط', status: 'نشط' }
          ]);
        } else if (sheetName === 'gas') {
          await Gas.create([
            { name: 'مستودع غاز ببا الرئيسي', area: 'ببا', manager: 'أحمد كمال', domesticCount: 1200, commercialCount: 300, status: 'نشط' },
            { name: 'مستودع غاز سمسطا', area: 'سمسطا', manager: 'محمد جابر', domesticCount: 800, commercialCount: 150, status: 'نشط' }
          ]);
        } else if (sheetName === 'jamiyati') {
          await Jamiyati.create([
            { 
              m: 1, 
              phase: 'الأولى', 
              ownerName: 'صفاء رجب محمد حسين', 
              status: 'نشط', 
              district: 'الفشن', 
              village: 'الجفادون', 
              address: 'ملك محمود عبدالله', 
              nationalId: '28901182201688', 
              phone: '01115509834', 
              merchantCode: '222000741820', 
              fundingType: 'قرض', 
              insuranceAmount: 45600 
            },
            { 
              m: 2, 
              phase: 'الثانية', 
              ownerName: 'محمد أحمد محمود حسن', 
              status: 'متوقف', 
              reason: 'تغيير النشاط',
              district: 'ببا', 
              village: 'جزيرة ببا', 
              address: 'شارع النيل', 
              nationalId: '29205102201554', 
              phone: '01223344556', 
              merchantCode: '222000741990', 
              fundingType: 'ذاتي', 
              insuranceAmount: 35000 
            },
            { 
              m: 3, 
              phase: 'الثالثة', 
              ownerName: 'إيمان سيد عبد العال', 
              status: 'نشط', 
              district: 'سمسطا', 
              village: 'الشنطور', 
              address: 'بجوار الوحدة الصحية', 
              nationalId: '29508202201776', 
              phone: '01009988776', 
              merchantCode: '222000742110', 
              fundingType: 'قرض', 
              insuranceAmount: 50000 
            }
          ]);
        }
      }
    }
  } catch (err) {
    console.error('[DB] Error during seeding/migration:', err);
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const stats: any = {};
      const isConnected = mongoose.connection.readyState === 1;
      let dbError: string | null = lastDbError;
      
      if (isConnected) {
        try {
          for (const sheet of REQUIRED_SHEETS) {
            stats[sheet] = await Models[sheet].countDocuments();
          }
        } catch (e) {
          dbError = String(e);
        }
      } else if (!dbError) {
        dbError = 'Database not connected';
      }
      
      res.json({ 
        status: isConnected && !dbError ? 'ok' : 'error', 
        dbStatus: isConnected ? 'connected' : 'disconnected',
        dbError,
        stats, 
        sheets: REQUIRED_SHEETS 
      });
    } catch (e) {
      res.status(500).json({ status: 'error', message: String(e) });
    }
  });

  // Login API
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username, password });
      if (user) {
        res.json({ status: 'ok', user: { id: user._id, username: user.username, name: user.name, role: user.role } });
      } else {
        res.status(401).json({ status: 'error', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
    } catch (e) {
      res.status(500).json({ status: 'error', message: String(e) });
    }
  });

  // Register API
  app.post('/api/register', async (req, res) => {
    const { username, password, name, role } = req.body;
    try {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ status: 'error', message: 'اسم المستخدم موجود بالفعل' });
      }
      const user = await User.create({ username, password, name, role: role || 'viewer' });
      res.json({ status: 'ok', userId: user._id });
    } catch (e) {
      res.status(500).json({ status: 'error', message: String(e) });
    }
  });

  // Reset Database
  app.post('/api/reset', async (req, res) => {
    try {
      for (const sheet of REQUIRED_SHEETS) {
        await Models[sheet].deleteMany({});
      }
      await initDb();
      res.json({ status: 'ok' });
    } catch (e) {
      res.status(500).json({ status: 'error', message: String(e) });
    }
  });

  // Global Search
  app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const results: any[] = [];

    try {
      for (const sheetName of REQUIRED_SHEETS) {
        const model = Models[sheetName];
        const schema = model.schema;
        const searchFields = Object.keys(schema.paths).filter(path => schema.paths[path].instance === 'String');
        
        const orClause = searchFields.map(field => ({
          [field]: { $regex: q, $options: 'i' }
        }));

        const rows = await model.find({ $or: orClause });
        
        rows.forEach(row => {
          results.push({
            ...row.toObject(),
            id: row._id,
            _sheet: sheetName,
            _sheetTitle: {
              suppliers: 'البدالين',
              associations: 'الجمعيات',
              warehouses: 'المخابز',
              petrol: 'محطات البترول',
              gas: 'مستودعات البوتاجاز',
              'gas-storage': 'مستودعات البوتاجاز',
              jamiyati: 'مشروع جمعيتي'
            }[sheetName] || sheetName
          });
        });
      }

      res.json(results.slice(0, 20));
    } catch (e) {
      console.error('[API] Search error:', e);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // API Endpoints
  app.get('/api/data/:sheet', async (req, res) => {
    const { sheet } = req.params;
    const { page, limit, search } = req.query;

    if (!REQUIRED_SHEETS.includes(sheet)) return res.status(404).json({ error: 'Sheet not found' });
    
    try {
      let query: any = {};
      
      // Handle search (regex across all string fields)
      if (search && typeof search === 'string') {
        const model = Models[sheet];
        const schema = model.schema;
        const searchFields = Object.keys(schema.paths).filter(path => schema.paths[path].instance === 'String');
        query.$or = searchFields.map(field => ({
          [field]: { $regex: search, $options: 'i' }
        }));
      }

      // Handle other filters (exact match or regex for village)
      const reservedKeys = ['page', 'limit', 'search'];
      Object.keys(req.query).forEach(key => {
        if (!reservedKeys.includes(key) && req.query[key]) {
          if (key === 'village') {
            query[key] = { $regex: req.query[key], $options: 'i' };
          } else {
            query[key] = req.query[key];
          }
        }
      });

      if (page && limit) {
        const p = parseInt(page as string) || 1;
        const l = parseInt(limit as string) || 10;
        const skip = (p - 1) * l;
        
        const total = await Models[sheet].countDocuments(query);
        const data = await Models[sheet].find(query).skip(skip).limit(l);
        
        const formattedData = data.map(item => ({ ...item.toObject(), id: item._id }));
        return res.json({
          items: formattedData,
          total,
          totalPages: Math.ceil(total / l),
          currentPage: p
        });
      }

      const data = await Models[sheet].find(query);
      const formattedData = data.map(item => ({ ...item.toObject(), id: item._id }));
      res.json(formattedData);
    } catch (error) {
      console.error(`[API] Error reading ${sheet}:`, error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  });

  app.post('/api/data/:sheet', async (req, res) => {
    const { sheet } = req.params;
    if (!REQUIRED_SHEETS.includes(sheet)) return res.status(404).json({ error: 'Sheet not found' });
    
    const newItem = req.body;
    if (newItem.id) delete newItem.id;
    
    try {
      await Models[sheet].create(newItem);
      const data = await Models[sheet].find();
      const formattedData = data.map(item => ({ ...item.toObject(), id: item._id }));
      res.json(formattedData);
    } catch (error) {
      console.error(`[API] Error saving to ${sheet}:`, error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  app.put('/api/data/:sheet/:id', async (req, res) => {
    const { sheet, id } = req.params;
    if (!REQUIRED_SHEETS.includes(sheet)) return res.status(404).json({ error: 'Sheet not found' });
    
    const updatedItem = req.body;
    if (updatedItem.id) delete updatedItem.id;
    
    try {
      await Models[sheet].findByIdAndUpdate(id, updatedItem);
      const data = await Models[sheet].find();
      const formattedData = data.map(item => ({ ...item.toObject(), id: item._id }));
      res.json(formattedData);
    } catch (error) {
      console.error(`[API] Error updating ${sheet}:`, error);
      res.status(500).json({ error: 'Failed to update data' });
    }
  });

  app.delete('/api/data/:sheet/:id', async (req, res) => {
    const { sheet, id } = req.params;
    if (!REQUIRED_SHEETS.includes(sheet)) return res.status(404).json({ error: 'Sheet not found' });
    
    try {
      await Models[sheet].findByIdAndDelete(id);
      const data = await Models[sheet].find();
      const formattedData = data.map(item => ({ ...item.toObject(), id: item._id }));
      res.json(formattedData);
    } catch (error) {
      console.error(`[API] Error deleting from ${sheet}:`, error);
      res.status(500).json({ error: 'Failed to delete data' });
    }
  });

  app.get('/api/download', async (req, res) => {
    try {
      const workbook = XLSX.utils.book_new();
      for (const sheet of REQUIRED_SHEETS) {
        const data = await Models[sheet].find();
        const formattedData = data.map(item => {
          const obj = item.toObject();
          obj.id = obj._id.toString();
          delete obj._id;
          delete obj.__v;
          return obj;
        });
        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(workbook, ws, sheet);
      }
      const tempFile = 'export_temp.xlsx';
      XLSX.writeFile(workbook, tempFile);
      res.download(tempFile, 'نظام_إدارة_التوريدات.xlsx', () => {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
