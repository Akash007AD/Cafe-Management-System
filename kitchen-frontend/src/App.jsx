import { useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "./api";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("kitchen_token"));
  const [user, setUser] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("kitchen@test.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [saving, setSaving] = useState(false);

  const [menuForm, setMenuForm] = useState({
    name: "",
    display_name: "",
    description: "",
    price: "",
    available_quantity: "",
    category_id: "",
    is_available: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      loadDashboard();
    } else {
      setAuthToken(null);
      setLoading(false);
    }
  }, [token]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [meResponse, menuResponse, categoryResponse] =
        await Promise.all([
          api.get("/auth/me"),
          api.get("/menu"),
          api.get("/categories"),
        ]);

      setUser(meResponse.data);
      setMenuItems(menuResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        logout();
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load kitchen dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const newToken = response.data.access_token;

      localStorage.setItem("kitchen_token", newToken);
      setToken(newToken);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("kitchen_token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setMenuItems([]);
    setCategories([]);
  }

  /* =========================
     MENU MANAGEMENT
     ========================= */

  function openAddMenuModal() {
    setEditingItem(null);

    setMenuForm({
      name: "",
      display_name: "",
      description: "",
      price: "",
      available_quantity: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      is_available: true,
    });

    setShowMenuModal(true);
  }

  function openEditMenuModal(item) {
    setEditingItem(item);

    setMenuForm({
      name: item.name || "",
      display_name: item.display_name || "",
      description: item.description || "",
      price: item.price ?? "",
      available_quantity: item.available_quantity ?? "",
      category_id: item.category_id ?? "",
      is_available: item.is_available ?? true,
    });

    setShowMenuModal(true);
  }

  function closeMenuModal() {
    if (!saving) {
      setShowMenuModal(false);
      setEditingItem(null);
    }
  }

  function handleMenuFormChange(event) {
    const { name, value, type, checked } = event.target;

    setMenuForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveMenuItem(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: menuForm.name.trim(),
        display_name: menuForm.display_name.trim(),
        description: menuForm.description.trim() || null,
        price: Number(menuForm.price),
        available_quantity: Number(menuForm.available_quantity),
        category_id: Number(menuForm.category_id),
        is_available: menuForm.is_available,
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
      } else {
        await api.post("/menu", payload);
      }

      setShowMenuModal(false);
      setEditingItem(null);

      await loadDashboard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMenuItem(item) {
    const confirmed = window.confirm(
      `Delete "${item.display_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/menu/${item.id}`);

      await loadDashboard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete menu item."
      );
    }
  }

  /* =========================
     CATEGORY MANAGEMENT
     ========================= */

  function openAddCategoryModal() {
    setEditingCategory(null);

    setCategoryForm({
      name: "",
      description: "",
    });

    setShowCategoryModal(true);
  }

  function openEditCategoryModal(category) {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
    });

    setShowCategoryModal(true);
  }

  function closeCategoryModal() {
    if (!saving) {
      setShowCategoryModal(false);
      setEditingCategory(null);
    }
  }

  function handleCategoryFormChange(event) {
    const { name, value } = event.target;

    setCategoryForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveCategory(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: categoryForm.name.trim(),
        description:
          categoryForm.description.trim() || null,
      };

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.id}`,
          payload
        );
      } else {
        await api.post("/categories", payload);
      }

      setShowCategoryModal(false);
      setEditingCategory(null);

      await loadDashboard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category) {
    const hasItems = menuItems.some(
      (item) => item.category_id === category.id
    );

    if (hasItems) {
      setError(
        `Cannot delete "${category.name}" because menu items are using this category.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/categories/${category.id}`);

      await loadDashboard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete category."
      );
    }
  }

  function getCategoryName(categoryId) {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    return category?.name || "Unknown";
  }

  const availableCount = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.is_available &&
          item.available_quantity > 0
      ).length,
    [menuItems]
  );

  /* =========================
     LOGIN
     ========================= */

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-mark">C</div>

          <h1>Cafe Kitchen</h1>

          <p className="login-subtitle">
            Sign in to manage the kitchen menu.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label>Email</label>

            <input
              type="email"
              value={loginEmail}
              onChange={(event) =>
                setLoginEmail(event.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={loginPassword}
              onChange={(event) =>
                setLoginPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

            <button
              className="primary-button login-button"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading kitchen dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app">

      {/* HEADER */}

      <header className="topbar">
        <div>
          <h1>Cafe Kitchen</h1>

          <span>
            Kitchen Management Dashboard
          </span>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="content">

        {error && (
          <div className="error-message dashboard-error">
            {error}

            <button
              className="error-close"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* =========================
            MENU SECTION
            ========================= */}

        <section className="dashboard-heading">
          <div>
            <h2>Menu Management</h2>

            <p>
              Manage menu items, prices, stock and availability.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openAddMenuModal}
          >
            + Add Menu Item
          </button>
        </section>

        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-label">
              Menu Items
            </span>

            <strong>{menuItems.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Categories
            </span>

            <strong>{categories.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Available
            </span>

            <strong>{availableCount}</strong>
          </div>

        </section>

        <section className="table-card">

          <div className="table-header">
            <div>
              <h3>Menu Items</h3>

              <span>
                {menuItems.length} item
                {menuItems.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          {menuItems.length === 0 ? (
            <div className="empty-state">
              <h3>No menu items</h3>

              <p>
                Add your first menu item to get started.
              </p>

              <button
                className="primary-button"
                onClick={openAddMenuModal}
              >
                Add Menu Item
              </button>
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {menuItems.map((item) => (
                    <tr key={item.id}>

                      <td>
                        <div className="item-name">
                          {item.display_name}
                        </div>

                        <div className="item-slug">
                          {item.name}
                        </div>
                      </td>

                      <td>
                        {getCategoryName(
                          item.category_id
                        )}
                      </td>

                      <td>
                        ₹
                        {Number(item.price).toFixed(2)}
                      </td>

                      <td>
                        {item.available_quantity}
                      </td>

                      <td>

                        {item.is_available &&
                        item.available_quantity > 0 ? (
                          <span className="status available">
                            Available
                          </span>
                        ) : (
                          <span className="status unavailable">
                            Unavailable
                          </span>
                        )}

                      </td>

                      <td>

                        <div className="actions">

                          <button
                            className="action-button"
                            onClick={() =>
                              openEditMenuModal(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-button delete"
                            onClick={() =>
                              deleteMenuItem(item)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =========================
            CATEGORY SECTION
            ========================= */}

        <section className="dashboard-heading category-heading">

          <div>
            <h2>Category Management</h2>

            <p>
              Create and manage categories for your menu.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openAddCategoryModal}
          >
            + Add Category
          </button>

        </section>

        <section className="category-grid">

          {categories.length === 0 ? (
            <div className="empty-state category-empty">
              <h3>No categories</h3>

              <p>
                Create a category before adding menu items.
              </p>

              <button
                className="primary-button"
                onClick={openAddCategoryModal}
              >
                Add Category
              </button>
            </div>
          ) : (
            categories.map((category) => {

              const itemCount = menuItems.filter(
                (item) =>
                  item.category_id === category.id
              ).length;

              return (
                <div
                  className="category-card"
                  key={category.id}
                >

                  <div className="category-card-content">

                    <h3>{category.name}</h3>

                    <p>
                      {category.description ||
                        "No description"}
                    </p>

                    <span className="category-count">
                      {itemCount} menu item
                      {itemCount !== 1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  <div className="category-actions">

                    <button
                      className="action-button"
                      onClick={() =>
                        openEditCategoryModal(category)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="action-button delete"
                      onClick={() =>
                        deleteCategory(category)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })
          )}

        </section>

      </main>

      {/* =========================
          MENU MODAL
          ========================= */}

      {showMenuModal && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingItem
                    ? "Edit Menu Item"
                    : "Add Menu Item"}
                </h2>

                <p>
                  Enter the menu item information below.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeMenuModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveMenuItem}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Internal Name</label>

                  <input
                    name="name"
                    value={menuForm.name}
                    onChange={handleMenuFormChange}
                    placeholder="masala-chai"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Display Name</label>

                  <input
                    name="display_name"
                    value={menuForm.display_name}
                    onChange={handleMenuFormChange}
                    placeholder="Masala Chai"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={menuForm.description}
                    onChange={handleMenuFormChange}
                    placeholder="Traditional Indian masala chai"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>

                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuForm.price}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Available Quantity</label>

                  <input
                    name="available_quantity"
                    type="number"
                    min="0"
                    value={menuForm.available_quantity}
                    onChange={handleMenuFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    name="category_id"
                    value={menuForm.category_id}
                    onChange={handleMenuFormChange}
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}

                  </select>
                </div>

                <div className="form-group checkbox-group">

                  <label className="checkbox-label">

                    <input
                      name="is_available"
                      type="checkbox"
                      checked={menuForm.is_available}
                      onChange={handleMenuFormChange}
                    />

                    <span>
                      Item is available
                    </span>

                  </label>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeMenuModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Update Item"
                    : "Add Item"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================
          CATEGORY MODAL
          ========================= */}

      {showCategoryModal && (
        <div className="modal-overlay">

          <div className="modal small-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p>
                  Create a category for your menu.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeCategoryModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveCategory}>

              <div className="form-grid single-column">

                <div className="form-group">
                  <label>Category Name</label>

                  <input
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryFormChange}
                    placeholder="Coffee"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryFormChange}
                    placeholder="Hot and cold coffee"
                    rows="4"
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCategoryModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
