import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Table,
  Modal,
  Flex,
  Input,
  message,
  Space,
  Card,
} from "antd";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faIndustry,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import ProductForm from "./forms/ProductForm";
import useAuth from "../contexts/useAuth";


const Dashboard = () => {
  const { userData } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [manufacturerCount, setManufacturerCount] = useState(0);

  const today = new Date();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(today);

  const fetchCounts = async () => {
    try {
      const productResponse = await axios.get(
        "/api/v1/products"
      );
      setProductCount(productResponse.data.length);

      const categoryResponse = await axios.get(
        "/api/v1/categories"
      );
      setCategoryCount(categoryResponse.data.length);

      const manufacturerResponse = await axios.get(
        "/api/v1/manufacturer"
      );
      setManufacturerCount(manufacturerResponse.data.length);
    } catch (error) {
      message.error("Failed to fetch counts 😔");
    }
  };

  const fetchProducts = async (search = "") => {
    console.log("fetchProducts called with search:", search);
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/v1/products?search=${encodeURIComponent(search)}`
      );
      console.log("Response:", response);
      setProducts(response.data);
    } catch (error) {
      console.log("Error fetching products:", error);
      setProducts([]);
      message.error("Failed to fetch products 😔");
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (userData && userData._id) {
    fetchCounts();
    fetchProducts();
  }
}, [userData]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  }, [setEditingProduct, setIsModalVisible]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/products/${id}`);
      message.success("Product deleted successfully 🎉");
      fetchProducts();
    } catch (error) {
      message.error("Failed to delete product 😔");
    }
  };

  const handleCreate = () => setIsModalVisible(true);

  const handleOk = async (values) => {
    console.log("Dashboard.handleOk: values=", values);
    try {
      if (editingProduct) {
        console.log("Dashboard.handleOk: updating product", editingProduct._id);
        await axios.put(
          `/api/v1/products/${editingProduct._id}`,
          values
        );
        message.success("Product updated successfully 🎉");
      } else {
        console.log("Dashboard.handleOk: creating new product");
        await axios.post("/api/v1/products", values);
        message.success("Product created successfully 🎉");
      }
      fetchCounts();
      fetchProducts();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Dashboard.handleOk: error", error);
      message.error("Failed to save product 😔");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearch = debounce((value) => {
    if (value.length >= 3) {
      fetchProducts(value);
    } else {
      fetchProducts();
    }
  }, 300);

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text, record) =>
        record.imageUrl ? (
          <img
            src={record.imageUrl}
            alt={record.productName}
            style={{
              maxWidth: "200px", maxHeight: "200px"
            }}
            loading="lazy"
          />
        ) : null,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      className: "nameListing",
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturerName",
      key: "manufacturerName",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      className: "nameListing",
    },
    {
      title: "Category",
      dataIndex: "productCategory",
      key: "productCategory",
    },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      className: "nameListing",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        if (record.isArchived === true) {
          return ( <span className="archivedStatus">Archived </span>)
           
        } else {
          return <span className="activeStatus">Active</span>;
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button className="editBtn" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Link to={`/products/${record._id}`}>
            <Button className="archiveBtn">View Details</Button>
          </Link>
          <Button
            className="deleteBtn"
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
    {userData && (
    <Flex vertical flex={1} className="content">
      <div>
        <div className="intro">
          <h2>Dashboard </h2>

          <span style={{ fontSize: "15px", color: "#878787" }}>
            {formattedDate}
          </span>
        </div>
        <div className="stats-container">
          <Card className="stats-item0">
            <div className="stats-item-content">
              <div>
                <FontAwesomeIcon
                  icon={faBoxArchive}
                  size="2xl"
                  style={{ color: "#ffffff" }}
                  className="iconContent"
                />
              </div>
              <div className="text-content">
                <p className="stats-item-header">Total InProducts</p>
                <p className="stats-item-body">{productCount}</p>
              </div>
            </div>
          </Card>

          <Card className="stats-item1">
            <div className="stats-item-content">
              <div>
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  size="2xl"
                  className="iconContent"
                  style={{ color: "#ffffff" }}
                />
              </div>
              <div className="text-content">
                <p className="stats-item-header">Total Categories</p>
                <p className="stats-item-body">{categoryCount}</p>
              </div>
            </div>
          </Card>
          <Card className="stats-item2">
            <div className="stats-item-content">
              <div>
                <FontAwesomeIcon
                  icon={faIndustry}
                  className="iconContent"
                  size="2xl"
                  style={{ color: "#ffffff" }}
                />
              </div>
              <div className="text-content">
                <p className="stats-item-header">Total Manufacturers</p>
                <p className="stats-item-body">{manufacturerCount}</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="details">
          <span style={{ margin: "0 8px", marginTop: "60px" }} />
          <div className="searchBarContainer">
              <Input
                placeholder="Search Product by name"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: "100%" }}
                className="searchBar"
              />
              <Button
                type="primary"
                className="addBtn"
                onClick={handleCreate}
              >
                Add New Product
              </Button>
            </div>
          <Table
            columns={columns}
            dataSource={products}
            loading={loading}
            rowKey="_id"
            className="table"
            pagination={{ position: ["bottomCenter"] }}
          />
        </div>
      </div>
      <Modal
        title={editingProduct ? "Edit Product" : "Create Product"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <ProductForm
          initialValues={editingProduct}
          onCancel={handleCancel}
          onOk={handleOk}
        />
      </Modal>
    </Flex>
 )}
 </>
);
};

export default Dashboard;
