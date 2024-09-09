/* eslint-disable react/prop-types */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import moment from "moment";
import PropTypes from "prop-types";
import React, { forwardRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import styled from "styled-components";
import img from "./../assets/company_logo.png";
import signature from "./../assets/signature.png";

// Utility function to convert numbers to words
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return "";

    let result = "";

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result.trim();
    }

    if (n > 0) {
      result += ones[n] + " ";
    }

    return result.trim();
  };

  if (num === 0) return "Zero";

  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  let result = "";

  if (billion) {
    result += convertLessThanOneThousand(billion) + " Billion ";
  }

  if (million) {
    result += convertLessThanOneThousand(million) + " Million ";
  }

  if (thousand) {
    result += convertLessThanOneThousand(thousand) + " Thousand ";
  }

  if (remainder) {
    result += convertLessThanOneThousand(remainder);
  }

  return result.trim();
};

const PDFDownloader = ({ contentId }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const generatePDF = () => {
    const printElement = document.getElementById(contentId);
    if (printElement) {
      html2canvas(printElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "px", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20 * 0.75;
        const contentWidth = pageWidth - 2 * margin;
        const contentHeight = pageHeight - 2 * margin;
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(
          contentWidth / imgWidth,
          contentHeight / imgHeight
        );
        const imgX = margin + (contentWidth - imgWidth * ratio) / 2;
        const imgY = margin;

        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        );
        pdf.save("Invoice.pdf");
        setIsPrinting(false);
      });
    } else {
      console.error("Print element not found");
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    setIsPrinting(true);
    setTimeout(generatePDF, 100);
  };

  return (
    <StyledButton
      className="mt-3"
      onClick={handleDownload}
      disabled={isPrinting}
    >
      {isPrinting ? "Generating PDF..." : "Download PDF"}
    </StyledButton>
  );
};

// eslint-disable-next-line no-unused-vars
const InvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
  const calculateTotals = () => {
    return invoiceData.items.map((item) => {
      const netAmount = item.unitPrice * item.quantity - (item.discount || 0);
      const taxAmount =
        invoiceData.placeOfSupply === invoiceData.placeOfDelivery
          ? (netAmount * 9) / 100 // CGST + SGST
          : (netAmount * 18) / 100; // IGST
      const totalAmount = netAmount + taxAmount;
      return { netAmount, taxAmount, totalAmount };
    });
  };

  const renderInvoiceContent = () => {
    const totals = calculateTotals();
    const totalAmount = totals.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalAmountInWords = numberToWords(Math.floor(totalAmount));

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: "#000",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <img src={img} alt="Company Logo" style={{ height: "30px" }} />
          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Tax Invoice/Bill of Supply/Cash Memo
            </h2>
            <span>(Original for Recipient)</span>
          </div>
        </div>

        {/* Seller and Buyer Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          <div style={{ width: "48%" }}>
            <strong>Sold By :</strong>
            <br />
            {invoiceData.sellerDetails.name}
            <br />
            {invoiceData.sellerDetails.address}
            <br />
            <br />
            PAN No: {invoiceData.sellerDetails.panNo}
            <br />
            GST Registration No: {invoiceData.sellerDetails.gstNo}
          </div>
          <div style={{ width: "48%" }}>
            <strong>Billing Address :</strong>
            <br />
            {invoiceData.billingDetails.name}
            <br />
            {invoiceData.billingDetails.address}
            <br />
            State/UT Code: {invoiceData.billingDetails.stateCode}
            <br />
            <br />
            <strong>Shipping Address :</strong>
            <br />
            {invoiceData.shippingDetails.name}
            <br />
            {invoiceData.shippingDetails.address}
            <br />
            State/UT Code: {invoiceData.shippingDetails.stateCode}
            <br />
            <br />
            Place of supply: {invoiceData.placeOfSupply}
            <br />
            Place of delivery: {invoiceData.placeOfDelivery}
          </div>
        </div>

        {/* Order and Invoice Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          <div style={{ width: "48%" }}>
            <strong>Order Number:</strong> {invoiceData.orderNo}
            <br />
            <strong>Order Date:</strong>{" "}
            {moment(invoiceData.orderDate).format("DD.MM.YYYY")}
          </div>
          <div style={{ width: "48%" }}>
            <strong>Invoice Number:</strong> {invoiceData.invoiceNo}
            <br />
            <strong>Invoice Details:</strong> {invoiceData.invoiceDetails}
            <br />
            <strong>Invoice Date:</strong>{" "}
            {moment(invoiceData.invoiceDate).format("DD.MM.YYYY")}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginLeft: "10px", marginRight: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Sl. No
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Description
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Unit Price
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Qty
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Net Amount
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Tax Rate
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Tax Type
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Tax Amount
                </th>
                <th style={{ border: "1px solid black", padding: "5px" }}>
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, idx) => {
                const { netAmount, taxAmount, totalAmount } = totals[idx];
                return (
                  <React.Fragment key={idx}>
                    <tr>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {item.description}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        ₹{item.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {item.quantity}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        ₹{netAmount.toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        2.5%
                        <br />
                        2.5%
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        CGST
                        <br />
                        SGST
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        ₹{(taxAmount / 2).toFixed(2)}
                        <br />₹{(taxAmount / 2).toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        ₹{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="9"
                        style={{ border: "1px solid black", padding: "5px" }}
                      >
                        Shipping Charges
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {/* Total Tax and Amount */}
              <tr style={{ fontWeight: "bold" }}>
                <td
                  colSpan="7"
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "left",
                  }}
                >
                  Total:
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  ₹
                  {totals
                    .reduce((sum, item) => sum + item.taxAmount, 0)
                    .toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  ₹
                  {totals
                    .reduce((sum, item) => sum + item.totalAmount, 0)
                    .toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="9"
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Amount in Words: <br />
                  {totalAmountInWords} only
                </td>
              </tr>
              <tr>
                <td
                  colSpan="9"
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "right",
                    marginTop: "40px",
                    marginRight: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  <strong>For {invoiceData.sellerDetails.name}</strong>
                  <br />
                  <img
                    src={signature}
                    alt="Signature"
                    style={{ height: "50px" }}
                  />
                  <br />
                  Authorized Signatory
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Whether tax is payable under reverse charge */}
        <div
          style={{
            marginBottom: "20px",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          <p>
        Whether tax is payable under reverse charge:{" "}
        {invoiceData.isTaxPayableUnderReverseCharge ? "Yes" : "No"}
      </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <StyledCard className="mt-4">
        <div>
          <div id="print-content">{renderInvoiceContent()}</div>
        </div>
      </StyledCard>
      <PDFDownloader contentId="print-content" />
    </>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";

const StyledCard = styled(Card)`
  background-color: #ffffff;
  color: #333333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  background-color: #3aaee9;
  border-color: #0f0e25;
  &:hover {
    background-color: #3aafff;
    border-color: #2a5298;
  }
  &:active {
    background-color: #3aafff;
    border-color: #2a5298;
  }
  &:disabled {
    background-color: #3aafff;
    border-color: #2a5298;
  }
  &:focus {
    background-color: #3aafff;
    border-color: #2a5298;
  }
`;

InvoiceTemplate.propTypes = {
  invoiceData: PropTypes.object.isRequired,
};

export default InvoiceTemplate;
