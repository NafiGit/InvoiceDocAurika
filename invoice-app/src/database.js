import * as XLSX from 'xlsx';

let db;

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InvoiceDB', 1);

    request.onerror = (event) => {
      console.error("Database error: " + event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Database opened successfully");
      resolve();
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
      invoiceStore.createIndex('invoiceNo', 'invoiceNo', { unique: true });

      const itemStore = db.createObjectStore('invoice_items', { keyPath: 'id', autoIncrement: true });
      itemStore.createIndex('invoiceId', 'invoiceId', { unique: false });
    };
  });
}

export function saveInvoice(invoiceData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['invoices', 'invoice_items'], 'readwrite');
    const invoiceStore = transaction.objectStore('invoices');
    const itemStore = transaction.objectStore('invoice_items');

    const invoice = { ...invoiceData };
    const items = invoice.items;
    delete invoice.items;

    // Check if invoice with this invoiceNo already exists
    const getRequest = invoiceStore.index('invoiceNo').get(invoice.invoiceNo);

    getRequest.onsuccess = (event) => {
      let saveRequest;
      if (event.target.result) {
        // Update existing invoice
        invoice.id = event.target.result.id;
        saveRequest = invoiceStore.put(invoice);
      } else {
        // Add new invoice
        saveRequest = invoiceStore.add(invoice);
      }

      saveRequest.onsuccess = (event) => {
        const invoiceId = event.target.result;
        
        // Delete existing items for this invoice
        const deleteRequest = itemStore.index('invoiceId').openCursor(IDBKeyRange.only(invoiceId));
        deleteRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            // Add new items
            const itemPromises = items.map(item => {
              return new Promise((itemResolve, itemReject) => {
                const itemRequest = itemStore.add({ ...item, invoiceId });
                itemRequest.onsuccess = () => itemResolve();
                itemRequest.onerror = (error) => itemReject(error);
              });
            });

            Promise.all(itemPromises)
              .then(() => resolve(invoiceId))
              .catch(error => reject(error));
          }
        };
      };

      saveRequest.onerror = (event) => {
        reject(event.target.error);
      };
    };

    getRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function getAllInvoices() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['invoices', 'invoice_items'], 'readonly');
    const invoiceStore = transaction.objectStore('invoices');
    const itemStore = transaction.objectStore('invoice_items');

    const invoices = [];

    invoiceStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const invoice = cursor.value;
        invoice.items = [];

        const itemIndex = itemStore.index('invoiceId');
        const itemRequest = itemIndex.getAll(cursor.value.id);

        itemRequest.onsuccess = (e) => {
          invoice.items = e.target.result;
          invoices.push(invoice);
          cursor.continue();
        };
      } else {
        resolve(invoices);
      }
    };

    transaction.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function importJSONInvoices(jsonData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['invoices', 'invoice_items'], 'readwrite');
    const invoiceStore = transaction.objectStore('invoices');
    const itemStore = transaction.objectStore('invoice_items');

    console.log(`Starting import of ${jsonData.length} invoices...`);
    let duplicates = [];

    const promises = jsonData.map((invoice, index) => {
      return new Promise((resolveInvoice, rejectInvoice) => {
        const items = invoice.items;
        delete invoice.items;

        console.log(`Processing invoice ${index + 1}/${jsonData.length}: ${invoice.invoiceNo}`);

        // Check if invoice with this invoiceNo already exists
        const getRequest = invoiceStore.index('invoiceNo').get(invoice.invoiceNo);

        getRequest.onsuccess = (event) => {
          if (event.target.result) {
            console.warn(`Duplicate invoice found: ${invoice.invoiceNo}. Skipping...`);
            duplicates.push(invoice.invoiceNo);
            resolveInvoice();
            return;
          }

          const invoiceRequest = invoiceStore.add(invoice);

          invoiceRequest.onsuccess = (event) => {
            const invoiceId = event.target.result;
            console.log(`Invoice ${invoice.invoiceNo} added with ID: ${invoiceId}`);
            
            const itemPromises = items.map((item, itemIndex) => {
              return new Promise((resolveItem, rejectItem) => {
                const itemRequest = itemStore.add({ ...item, invoiceId });
                itemRequest.onsuccess = () => {
                  console.log(`Item ${itemIndex + 1} added for invoice ${invoice.invoiceNo}`);
                  resolveItem();
                };
                itemRequest.onerror = (error) => {
                  console.error(`Error adding item ${itemIndex + 1} for invoice ${invoice.invoiceNo}:`, error);
                  rejectItem(error);
                };
              });
            });

            Promise.all(itemPromises)
              .then(() => {
                console.log(`All items added for invoice ${invoice.invoiceNo}`);
                resolveInvoice();
              })
              .catch(error => {
                console.error(`Error adding items for invoice ${invoice.invoiceNo}:`, error);
                rejectInvoice(error);
              });
          };

          invoiceRequest.onerror = (event) => {
            console.error(`Error adding invoice ${invoice.invoiceNo}:`, event.target.error);
            rejectInvoice(event.target.error);
          };
        };

        getRequest.onerror = (event) => {
          console.error(`Error checking for existing invoice ${invoice.invoiceNo}:`, event.target.error);
          rejectInvoice(event.target.error);
        };
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log(`Successfully imported ${jsonData.length - duplicates.length} invoices`);
        if (duplicates.length > 0) {
          console.warn(`Skipped ${duplicates.length} duplicate invoices: ${duplicates.join(', ')}`);
        }
        resolve({ success: jsonData.length - duplicates.length, duplicates });
      })
      .catch(error => {
        console.error("Error during import process:", error);
        reject(error);
      });
  });
}

export function importExcelInvoices(excelData) {
  const workbook = XLSX.read(excelData, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Parsing Excel file... Found ${jsonData.length} rows.`);

  const formattedData = jsonData.map((row, index) => {
    console.log(`Processing Excel row ${index + 1}/${jsonData.length}`);
    
    if (!row.invoiceNo) {
      console.warn(`Row ${index + 1} is missing invoiceNo. Skipping...`);
      return null;
    }

    return {
      invoiceNo: row.invoiceNo,
      invoiceDetails: row.invoiceDetails,
      invoiceDate: row.invoiceDate,
      orderNo: row.orderNo,
      orderDate: row.orderDate,
      sellerDetails: {
        name: row.sellerName,
        address: row.sellerAddress,
        panNo: row.sellerPanNo,
        gstNo: row.sellerGstNo,
      },
      billingDetails: {
        name: row.billingName,
        address: row.billingAddress,
        stateCode: row.billingStateCode,
      },
      shippingDetails: {
        name: row.shippingName,
        address: row.shippingAddress,
        stateCode: row.shippingStateCode,
      },
      placeOfSupply: row.placeOfSupply,
      placeOfDelivery: row.placeOfDelivery,
      items: [{
        description: row.itemDescription,
        unitPrice: row.itemUnitPrice,
        quantity: row.itemQuantity,
        discount: row.itemDiscount,
      }],
      bankDetails: {
        bankName: row.bankName,
        accountNo: row.accountNo,
        ifscCode: row.ifscCode,
        branch: row.branch,
      },
    };
  }).filter(invoice => invoice !== null);

  console.log(`Formatted ${formattedData.length} valid invoices from Excel data.`);

  return importJSONInvoices(formattedData);
}