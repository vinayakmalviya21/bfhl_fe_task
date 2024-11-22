import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";

const App = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [filters, setFilters] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState("");

  const options = [
    { value: "alphabets", label: "Alphabets" },
    { value: "numbers", label: "Numbers" },
    { value: "highestLowercase", label: "Highest Lowercase Alphabet" },
  ];

  const getFilteredResponse = () => {
    if (!apiResponse || filters.length === 0) return null;
  
    return filters.reduce((result, filter) => {
      const keyMapping = {
        alphabets: "alphabets",
        numbers: "numbers",
        highestLowercase: "highestLowercaseAlphabet", 
      };
  
      const backendKey = keyMapping[filter];
      if (backendKey && apiResponse[backendKey]) {
        result[filter] = apiResponse[backendKey];
      }
      return result;
    }, {});
  };
  

  const isValidJSON = (input) => {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  };

  const sanitizeJSON = (input) => {
    return input
      .replace(/“|”/g, '"') 
      .replace(/‘|’/g, "'"); 
  };

  const handleSubmit = async () => {
    const sanitizedInput = sanitizeJSON(jsonInput);

    if (!isValidJSON(sanitizedInput)) {
      setError("Invalid JSON format");
      return;
    }

    try {
      const parsedInput = JSON.parse(sanitizedInput);

      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        setError("Invalid input: 'data' must be an array.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/bfhl`,
        parsedInput
      );
      setApiResponse(response.data);
      setError("");
    } catch (err) {
      setError("API error: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredResponse = getFilteredResponse();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          JSON Input and Response
        </h2>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value?.trim())}
          placeholder="Enter JSON input"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={6}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <Select
          options={options}
          isMulti
          onChange={(selected) =>
            setFilters(selected ? selected.map((opt) => opt.value) : [])
          }
          placeholder="Select filters..."
          className="mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Submit
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Filtered Response:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg overflow-auto border border-gray-200">
            <pre className="text-sm text-gray-800">
              {JSON.stringify(filteredResponse, null, 2) ||
                "No filters applied"}
            </pre>
          </div>
        </div>

        {apiResponse && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Full Response:
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto border border-gray-200">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
