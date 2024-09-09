import { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import FooterComponent from "./components/Footer.jsx";
import InvoiceForm from "./components/InvoiceForm.jsx";
import InvoiceTemplate from "./components/InvoiceTemplate.jsx";
import NavbarComponent from "./components/Navbar.jsx";
import { getAllInvoices, importExcelInvoices, importJSONInvoices, initializeDatabase, saveInvoice } from "./database.js";

const GlobalStyle = createGlobalStyle`
  body {
    background: linear-gradient(135deg, #1d1e25 0%, #074463 100%);
    color: #ffffff;
    font-family: "Arial", sans-serif;
  }
`;

const App = () => {
  const [invoiceData, setInvoiceData] = useState({
    isTaxPayableUnderReverseCharge: false,
    invoiceNo: "IN-761",
    invoiceDetails: "KA-310565025-1920",
    invoiceDate: "2023-10-28",
    orderNo: "403-3225714-7676307",
    orderDate: "2023-10-28",
    sellerDetails: {
      name: "Varasiddhi Silk Exports",
      address: "75, 3rd Cross, Lalbagh Road\nBENGALURU, KARNATAKA, 560027\nIN",
      panNo: "AACFV3325K",
      gstNo: "29AACFV3325K1ZY",
    },
    billingDetails: {
      name: "Madhu B",
      address:
        "Eurofins IT Solutions India Pvt Ltd., 1st Floor,\nMaruti Platinum, Lakshminarayana Pura, AECS\nLayou\nBENGALURU, KARNATAKA, 560037\nIN",
      stateCode: "29",
    },
    shippingDetails: {
      name: "Madhu B",
      address:
        "Eurofins IT Solutions India Pvt Ltd., 1st Floor,\nMaruti Platinum, Lakshminarayana Pura, AECS\nLayou\nBENGALURU, KARNATAKA, 560037\nIN",
      stateCode: "29",
    },
    placeOfSupply: "KARNATAKA",
    placeOfDelivery: "KARNATAKA",
    items: [
      {
        description:
          "Varasiddhi Silks Men's Formal Shirt (SH-05-42, Navy Blue, 42) | B07KGF3KW8 ( SH-05--42 )",
        unitPrice: 538.1,
        quantity: 1,
        discount: 0,
      },
      {
        description:
          "Varasiddhi Silks Men's Formal Shirt (SH-05-40, Navy Blue, 40) | B07KGCS2X7 ( SH-05--40 )",
        unitPrice: 538.1,
        quantity: 1,
        discount: 0,
      },
    ],
    bankDetails: {
      bankName: "",
      accountNo: "",
      ifscCode: "",
      branch: "",
    },
  });

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [importLogs, setImportLogs] = useState([]);

  useEffect(() => {
    initializeDatabase().catch(error => console.error("Failed to initialize database:", error));
  }, []);


  useEffect(() => {
    console.log("Invoice Data:", invoiceData);
  }, [invoiceData]);

  const handleInvoiceChange = (updatedData) => {
    setInvoiceData(updatedData);
  };

  const handleSaveInvoice = async () => {
    try {
      const invoiceId = await saveInvoice(invoiceData);
      console.log(`Invoice saved with ID: ${invoiceId}`);
      alert(`Invoice saved successfully with ID: ${invoiceId}`);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handleDisplayInvoices = async () => {
    try {
      const invoices = await getAllInvoices();
      setSavedInvoices(invoices);
      console.log("Saved Invoices:", invoices);
    } catch (error) {
      console.error("Error retrieving invoices:", error);
      alert("Failed to retrieve invoices. Please try again.");
    }
  };

  const handleImportJSON = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonData = JSON.parse(e.target.result);
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;

        console.log = (...args) => {
          setImportLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
          originalConsoleLog(...args);
        };
        console.warn = (...args) => {
          setImportLogs(prev => [...prev, { type: 'warn', message: args.join(' ') }]);
          originalConsoleWarn(...args);
        };
        console.error = (...args) => {
          setImportLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
          originalConsoleError(...args);
        };

        const result = await importJSONInvoices(jsonData);
        
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;

        if (result.duplicates.length > 0) {
          alert(`Successfully imported ${result.success} invoices. Skipped ${result.duplicates.length} duplicate invoices: ${result.duplicates.join(', ')}`);
        } else {
          alert(`Successfully imported ${result.success} invoices.`);
        }
        handleDisplayInvoices();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing JSON invoices:", error);
      alert("Failed to import JSON invoices. Please try again.");
    }
  };

  const handleImportExcel = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;

        console.log = (...args) => {
          setImportLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
          originalConsoleLog(...args);
        };
        console.warn = (...args) => {
          setImportLogs(prev => [...prev, { type: 'warn', message: args.join(' ') }]);
          originalConsoleWarn(...args);
        };
        console.error = (...args) => {
          setImportLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
          originalConsoleError(...args);
        };

        const result = await importExcelInvoices(data);
        
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;

        if (result.duplicates.length > 0) {
          alert(`Successfully imported ${result.success} invoices. Skipped ${result.duplicates.length} duplicate invoices: ${result.duplicates.join(', ')}`);
        } else {
          alert(`Successfully imported ${result.success} invoices.`);
        }
        handleDisplayInvoices();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error importing Excel invoices:", error);
      alert("Failed to import Excel invoices. Please try again.");
    }
  };

  return (
    <>
      <GlobalStyle />
      <NavbarComponent onImportJSON={handleImportJSON} onImportExcel={handleImportExcel} />
      <div className="mx-4 mt-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="bg-white rounded shadow-lg">
              <InvoiceForm
                invoiceData={invoiceData}
                onInvoiceChange={handleInvoiceChange}
              />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="rounded">
              <InvoiceTemplate invoiceData={invoiceData} />
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <button className="btn btn-primary me-2" onClick={handleSaveInvoice}>
              Save Invoice
            </button>
            <button className="btn btn-secondary me-2" onClick={handleDisplayInvoices}>
              Display Saved Invoices
            </button>
          </div>
        </div>
        {savedInvoices.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <h3>Saved Invoices</h3>
              <pre>{JSON.stringify(savedInvoices, null, 2)}</pre>
            </div>
          </div>
        )}
        {importLogs.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <h3>Import Logs</h3>
              <pre>
                {importLogs.map((log, index) => (
                  <div key={index} className={`text-${log.type === 'error' ? 'danger' : log.type === 'warn' ? 'warning' : 'info'}`}>
                    {log.message}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}
      </div>
      <FooterComponent />
    </>
  );
};

export default App;
