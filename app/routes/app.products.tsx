import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Frame,
  Icon,
  Layout,
  Modal,
  Page,
  Text,
  TextContainer,
  TextField,
  Toast,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { EditIcon } from "@shopify/polaris-icons";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { DataType } from "@shopify/shopify-api";

export const loader: LoaderFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    const response = await admin.rest.get({ path: "products" });
    const { products } = await response.json();
    return products;
  } catch (error) {
    console.log(error);
  }
};

// Action Function
export const action: ActionFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const { product_id } = await Object.fromEntries(formData);
  const productBody = await Object.fromEntries(formData);

  const body = {
    product: productBody,
  };

  const method = request.method;
  let response;

  try {
    switch (method) {
      case "DELETE":
        return await admin.rest.delete({ path: `products/${product_id}` });

      case "PUT":
        return await admin.rest.put({
          path: `products/${product_id}`,
          data: {
            title: "Latest Product =====>",
          },
        });

      case "POST":
        return await admin.rest.post({
          path: "products",
          data: body,
          type: DataType.JSON,
        });

      default:
        return (response = "Request wrong method");
    }
  } catch (error) {
    console.log(error);
  }
};

// Product Table Component
const Products = () => {
  // showing toast
  const [active, setActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const [activeModal, setActiveModal] = useState(false);

  const handleChange = useCallback(
    () => setActiveModal(!activeModal),
    [activeModal],
  );

  const activator = (
    <Button variant="primary" tone="success" onClick={handleChange}>
      Add Products
    </Button>
  );

  const toastMarkup = active ? (
    <Toast content={toastMessage} onDismiss={toggleActive} />
  ) : null;

  const products = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const actionData = useActionData();

  // handler-functions

  // delete product
  const deleteProduct = async (product_id: number) => {
    submit({ product_id }, { method: "DELETE" });
    setToastMessage("Product Removed Successfully!");
    toggleActive();
  };

  // update product
  const updateProduct = async (product_id: number) => {
    submit({ product_id }, { method: "PUT" });
    setToastMessage("Product Updated Successfully!");
    toggleActive();
  };

  const createProduct = (e: any) => {
    const newFormData = new FormData(e.target);
    submit(newFormData, { method: "POST" });
    setToastMessage("Product Created Successfully!");
    toggleActive();
    setTimeout(() => handleChange(), 300);
  };

  // rendering an image
  const renderImageCell = (imageUrl: string) => (
    <img
      src={imageUrl}
      alt="Product"
      style={{ maxWidth: "40", maxHeight: "40px" }}
    />
  );

  useEffect(() => {
    return () => {};
  }, [products]);

  return (
    <Page title="Available Products">
      <Frame>
        <Layout>
          {/* Add product section */}
          <Layout.Section>
            <Card>
              <div
                style={{
                  fontWeight: "700",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "nowrap",
                }}
              >
                <Text children={"Add New Product"} as={"span"}></Text>
                <Modal
                  activator={activator}
                  open={activeModal}
                  onClose={handleChange}
                  title="Add new product to your store"
                >
                  <Modal.Section>
                    <TextContainer>
                      <Form onSubmit={createProduct}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            placeItems: "center",
                            fontWeight: '400',
                            fontSize: '0.9rem'
                          }}
                        >
                          <div>
                            <label htmlFor="Product Title">Product Title</label>
                            <br />
                            <input style={{padding: '0.5rem', borderRadius: '2px', border: "0.5px solid gray", outline: "none"}} type="text" name="title" />
                          </div>

                          <div>
                            <label htmlFor="Product Price">Price</label>
                            <br />
                            <input style={{padding: '0.5rem', borderRadius: '2px', border: "0.5px solid gray", outline: "none"}} type="number" name="price" />
                          </div>

                          <div>
                            <label htmlFor="Product Vendor">Vendor</label>
                            <br />
                            <input  style={{padding: '0.5rem', borderRadius: '2px', border: "0.5px solid gray", outline: "none"}}type="text" name="vendor" />
                          </div>

                          <div style={{alignItems: 'center'}}>
                            <label htmlFor="Product Image">Image</label>
                            <br />
                            <input style={{padding: '0.5rem', borderRadius: '2px', maxWidth: '150px', border: "0.5px solid gray", outline: "none"}} type="file" name="image" />
                          </div>
                        </div>
                        <br />

                        <Button submit>Add Product</Button>
                      </Form>
                    </TextContainer>
                  </Modal.Section>
                </Modal>
              </div>
            </Card>
          </Layout.Section>

          {/* Product table */}
          <Layout.Section>
            <Card>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Sr. No</th>
                    <th scope="col">Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Image</th>
                    <th scope="col">Price</th>
                    <th scope="col">Vendor</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any, idx: number) => (
                    <tr
                      className="align-middle"
                      style={{ fontSize: "0.8em" }}
                      key={product.id}
                    >
                      <td>{idx + 1}</td>
                      <td>{product.title}</td>
                      <td>
                        {product.image !== null
                          ? product?.image?.alt?.length > 60
                            ? product.image.alt.slice(0, 60) + " ..."
                            : product.image.alt
                          : "NA"}
                      </td>
                      <td>
                        {product.image !== null
                          ? renderImageCell(product.image?.src)
                          : "NA"}
                      </td>
                      <td>${product.variants[0]["price"]}</td>
                      <td>{product.vendor}</td>
                      <td style={{ gap: "0.8rem" }}>
                        <span style={{ gap: "0.8rem", display: "flex" }}>
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => console.log("edit-product")}
                          >
                            <Icon source={EditIcon} tone="base" />
                          </div>
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Icon source={DeleteIcon} tone="base" />
                          </div>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {toastMarkup}
            </Card>
          </Layout.Section>
        </Layout>
      </Frame>
    </Page>
  );
};

export default Products;
