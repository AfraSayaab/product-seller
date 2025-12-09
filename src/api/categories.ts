import axios from 'axios';

// Function to fetch category data from the API
export const fetchCategories = async () => {
  try {
    // Full URL for the API call (no need for base URL in axios instance)
    const response = await axios.get('/api/admin/categories/tree'); // Full URL directly
    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error; // Rethrow the error to be handled by the component
  }
};
