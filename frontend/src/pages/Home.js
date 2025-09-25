import React, { useState } from "react";
import { Link } from "react-router-dom";
import useRestaurants from "../components/hooks/useRestaurants";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const { restaurants, loading, error } = useRestaurants();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlateType, setSelectedPlateType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  const validRestaurants = restaurants.filter((restaurant) => restaurant.valid);

  const categories = [...new Set(validRestaurants.map((res) => res.category))];
  const plateTypes = ["Carne", "Peixe", "Vegetariano", "Sobremessa"];

  const filteredRestaurants = validRestaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === "" || restaurant.category === selectedCategory;

    const matchesSearch =
      searchQuery === "" ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlateTypeAndPrice = restaurant.plates.some((plate) => {
      const matchesPlateType =
        selectedPlateType === "" || plate.type === selectedPlateType;

      const matchesPrice =
        (minPrice === "" || plate.dose.some((dose) => dose.price >= parseFloat(minPrice))) &&
        (maxPrice === "" || plate.dose.some((dose) => dose.price <= parseFloat(maxPrice)));

      return matchesPlateType && matchesPrice;
    });

    return matchesCategory && matchesSearch && matchesPlateTypeAndPrice;
  });

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Restaurants</h1>

      <div className="mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="search-input" className="form-label">
              Search by Name:
            </label>
            <input
              id="search-input"
              type="text"
              className="form-control"
              placeholder="Search for a restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="category-select" className="form-label">
              Filter by Category:
            </label>
            <select
              id="category-select"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="plate-type-select" className="form-label">
              Filter by Plate Type:
            </label>
            <select
              id="plate-type-select"
              className="form-select"
              value={selectedPlateType}
              onChange={(e) => setSelectedPlateType(e.target.value)}
            >
              <option value="">All Plate Types</option>
              {plateTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="min-price" className="form-label">
              Min Price:
            </label>
            <input
              id="min-price"
              type="number"
              className="form-control"
              placeholder="Enter minimum price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="max-price" className="form-label">
              Max Price:
            </label>
            <input
              id="max-price"
              type="number"
              className="form-control"
              placeholder="Enter maximum price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <div key={restaurant._id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{restaurant.name}</h5>
                  <p className="card-text">Category: {restaurant.category}</p>
                  <h6>Plates:</h6>
                  <ul>
                    {restaurant.plates.slice(0, 3).map((plate) => (
                      <li key={plate._id}>
                        {plate.name} -{" "}
                        {plate.dose.map(
                          (dose, index) =>
                            `${dose.type.charAt(0).toUpperCase() + dose.type.slice(1)}: $${dose.price}${
                              index !== plate.dose.length - 1 ? ", " : ""
                            }`
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/restaurants/${restaurant._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            No restaurants match your search or filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

