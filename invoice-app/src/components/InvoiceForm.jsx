/* eslint-disable react/prop-types */
import { Button, Col, Form, Row } from "react-bootstrap";
import styled from "styled-components";

const StyledForm = styled(Form)`
  background-color: #ffffff;
  color: #333333;
  padding: 2rem;
  border-radius: 8px;
`;

const StyledButton = styled(Button)`
  background-color: #3aaee9;
  border-color: #3aaee9;
  &:hover,
  &:active,
  &:disabled,
  &:focus {
    background-color: #3adfff;
    border-color: #fff;
  }
`;

const SectionTitle = styled.h5`
  color: #1e3c72;
  font-weight: bold;
`;

const InvoiceForm = ({ invoiceData, onInvoiceChange }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name, "value", value);
    onInvoiceChange({ ...invoiceData, [name]: value });
  };

  const handleNestedChange = (section, field, value) => {
    onInvoiceChange({
      ...invoiceData,
      [section]: { ...invoiceData[section], [field]: value },
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = field === "description" ? value : Number(value) || 0;
    onInvoiceChange({ ...invoiceData, items: updatedItems });
  };

  const addItem = () => {
    onInvoiceChange({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { description: "", unitPrice: 0, quantity: 1, discount: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter((_, i) => i !== index);
      onInvoiceChange({ ...invoiceData, items: updatedItems });
    }
  };

  return (
    <StyledForm>
      <SectionTitle>Invoice Details</SectionTitle>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="invoiceNo">
            <Form.Label>Invoice No</Form.Label>
            <Form.Control
              type="text"
              name="invoiceNo"
              value={invoiceData.invoiceNo}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="invoiceDate">
            <Form.Label>Invoice Date</Form.Label>
            <Form.Control
              type="date"
              name="invoiceDate"
              value={invoiceData.invoiceDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="invoiceDetails">
            <Form.Label>Invoice Details</Form.Label>
            <Form.Control
              type="text"
              name="invoiceDetails"
              value={invoiceData.invoiceDetails}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <SectionTitle>Order Details</SectionTitle>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="orderNo">
            <Form.Label>Order No</Form.Label>
            <Form.Control
              type="text"
              name="orderNo"
              value={invoiceData.orderNo}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="orderDate">
            <Form.Label>Order Date</Form.Label>
            <Form.Control
              type="date"
              name="orderDate"
              value={invoiceData.orderDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <SectionTitle>Seller Details</SectionTitle>
      <Form.Group controlId="sellerName">
        <Form.Label>Seller Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={invoiceData.sellerDetails.name}
          onChange={(e) => handleNestedChange("sellerDetails", "name", e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="sellerAddress">
        <Form.Label>Seller Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={invoiceData.sellerDetails.address}
          onChange={(e) => handleNestedChange("sellerDetails", "address", e.target.value)}
        />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="sellerPAN">
            <Form.Label>PAN</Form.Label>
            <Form.Control
              type="text"
              name="panNo"
              value={invoiceData.sellerDetails.panNo}
              onChange={(e) => handleNestedChange("sellerDetails", "panNo", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="sellerGST">
            <Form.Label>GSTIN</Form.Label>
            <Form.Control
              type="text"
              name="gstNo"
              value={invoiceData.sellerDetails.gstNo}
              onChange={(e) => handleNestedChange("sellerDetails", "gstNo", e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <SectionTitle>Billing Details</SectionTitle>
      <Form.Group controlId="billingName">
        <Form.Label>Billing Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={invoiceData.billingDetails.name}
          onChange={(e) => handleNestedChange("billingDetails", "name", e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="billingAddress">
        <Form.Label>Billing Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={invoiceData.billingDetails.address}
          onChange={(e) => handleNestedChange("billingDetails", "address", e.target.value)}
        />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="billingStateCode">
            <Form.Label>State Code</Form.Label>
            <Form.Control
              type="text"
              name="stateCode"
              value={invoiceData.billingDetails.stateCode}
              onChange={(e) => handleNestedChange("billingDetails", "stateCode", e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <SectionTitle>Shipping Details</SectionTitle>
      <Form.Group controlId="shippingName">
        <Form.Label>Shipping Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={invoiceData.shippingDetails.name}
          onChange={(e) => handleNestedChange("shippingDetails", "name", e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="shippingAddress">
        <Form.Label>Shipping Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={invoiceData.shippingDetails.address}
          onChange={(e) => handleNestedChange("shippingDetails", "address", e.target.value)}
        />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="shippingStateCode">
            <Form.Label>State Code</Form.Label>
            <Form.Control
              type="text"
              name="stateCode"
              value={invoiceData.shippingDetails.stateCode}
              onChange={(e) => handleNestedChange("shippingDetails", "stateCode", e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <SectionTitle>Place of Supply & Delivery</SectionTitle>
      <Form.Group controlId="placeOfSupply">
        <Form.Label>Place of Supply</Form.Label>
        <Form.Control
          type="text"
          name="placeOfSupply"
          value={invoiceData.placeOfSupply}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group controlId="placeOfDelivery">
        <Form.Label>Place of Delivery</Form.Label>
        <Form.Control
          type="text"
          name="placeOfDelivery"
          value={invoiceData.placeOfDelivery}
          onChange={handleChange}
        />
      </Form.Group>

      <SectionTitle>Items</SectionTitle>
      {invoiceData.items.map((item, index) => (
        <Row key={index} className="mb-3">
          <Col>
            <Form.Group controlId={`description-${index}`}>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, "description", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`unitPrice-${index}`}>
              <Form.Label>Unit Price</Form.Label>
              <Form.Control
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`quantity-${index}`}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`discount-${index}`}>
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                value={item.discount}
                onChange={(e) => handleItemChange(index, "discount", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="danger" onClick={() => removeItem(index)} className="mt-4">
              Remove
            </Button>
          </Col>
        </Row>
      ))}

      <Button variant="primary" onClick={addItem} className="mt-3">
        Add Item
      </Button>

      <SectionTitle className="mt-2">Tax Options</SectionTitle>
        <Form.Group controlId="reverseChargeTax">
          <Form.Check
            type="switch"
            name="isTaxPayableUnderReverseCharge"
            id="reverse-charge-switch"
            label={`Whether tax is payable under reverse charge: ${invoiceData.isTaxPayableUnderReverseCharge ? "Yes" : "No"}`}
            checked={invoiceData.isTaxPayableUnderReverseCharge}  // Use checked instead of value
            onChange={(e) =>
              onInvoiceChange({
                ...invoiceData,
                isTaxPayableUnderReverseCharge: e.target.checked,  // Update using e.target.checked
              })
            }
          />
      </Form.Group>
      <StyledButton variant="primary" type="button" className="mt-4" onClick={() => onInvoiceChange(invoiceData)}>
        Update Invoice
      </StyledButton>
    </StyledForm>
  );
};

export default InvoiceForm;
