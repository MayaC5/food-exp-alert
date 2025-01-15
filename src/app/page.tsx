"use client";
import { useState, useEffect, useRef } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  const [data, setData] = useState("Not Found");
  const [addItemState, setAddItemState] = useState(false);
  const [productInfo, setProductInfo] = useState({});
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [scannedItems, setScannedItems] = useState([]); // Store scanned items
  const audioRef = useRef(null);
  const [scanning, setScanning] = useState(true); // To control scanning state
  const lastScannedRef = useRef(null); // To store the last scanned barcode

  // Load items from local storage on initial render
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("scannedItems")) || [];
    setScannedItems(storedItems); // Load scanned items into state
  }, []);

  // Preinitialize audio on user interaction
  const initializeAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/beep.mp3");
      console.log("Audio initialized");
    }
  };

  // Play beep sound
  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing beep sound:", error);
      });
    } else {
      console.error("Audio not initialized");
    }
  };

  const addItem = () => {
    initializeAudio(); // Ensure audio is initialized when this button is clicked
    setAddItemState(!addItemState);
  };

  const fetchProductDetails = (barcode) => {
    fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data); // Log the full API response
        if (data.status === 1) {
          setProductInfo(data.product);
          saveScannedItem({ barcode, product: data.product }); // Save product details
        } else {
          setProductInfo({});
          setData("Product not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        setData("Failed to fetch product details");
      });
  };

  const saveScannedItem = (item) => {
    setScannedItems((prevItems) => {
      const updatedItems = [...prevItems, item]; // Append the new item ***
      localStorage.setItem("scannedItems", JSON.stringify(updatedItems)); // Save to localStorage ***
      return updatedItems; // Return the updated state
    });
  };

  const checkoutItem = () => {
    setScannedItems([]); // Clear the state
    localStorage.removeItem("scannedItems"); // Clear localStorage
    setProductInfo({});
    console.log("All items have been checked out.");
  }

  // Delete a specific item from the list and localStorage
  const deleteItem = (index) => {
    setScannedItems((prevItems) => {
      const updatedItems = prevItems.filter((_, i) => i !== index); // Remove the item at the given index ***
      localStorage.setItem("scannedItems", JSON.stringify(updatedItems)); // Update localStorage
      return updatedItems; // Update state
    });
  };

  const handleScan = (barcode) => {
    // Prevent duplicate scans during timeout
    if (barcode === lastScannedRef.current) {
      console.log("Duplicate barcode detected, ignoring...");
      return;
    }

    lastScannedRef.current = barcode; // Store the scanned barcode
    setScanning(false); // Disable scanning temporarily
    setData(barcode);
    fetchProductDetails(barcode);
    playBeep(); // Play beep for valid scan

    // Re-enable scanning after 2 seconds
    setTimeout(() => {
      setScanning(true);
      lastScannedRef.current = null; // Clear the last scanned barcode
    }, 2000);
  };

  return (
    <div className="flex p-4 w-full flex-col">
      <div className="flex justify-end w-full">
        <button
          className="bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-full"
          onClick={addItem}
        >
          Start Scanning
        </button>
        {/* <button onClick={playBeep}>Play Beep</button> */}
      </div>

      {addItemState && (
        <div className="flex pt-4 flex-col">
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={(err, result) => {
              if (result && scanning) {
                handleScan(result.text);
              } else {
                setData("Not Found");
              }
            }}
          />
          <p>{data}</p>
          {Object.keys(productInfo).length > 0 && (
            <div>
              <h3>Product Details:</h3>
              <p>Name: {productInfo.product_name}</p>
              <p>Brand: {productInfo.brands}</p>
              {/* <label htmlFor="expiryDate">Expiry Date: </label> */}
              {/* <DatePicker
                selected={expiryDate}
                onChange={(date) => setExpiryDate(date)}
                dateFormat="MMMM d, yyyy"
                className="input"
              /> */}
              {/* <button>Button</button> */}
            </div>
          )}
          <h3>Scanned Items:</h3>
          <ul>
            {scannedItems.map((item, index) => (
              <li key={index} className='flex justify-between items-center mb-2'>
                <span>
                  {item.barcode} - {item.product?.product_name || "Unknown Product"}
                </span>
                
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => deleteItem(index)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button onClick={checkoutItem} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Checkout</button>
        </div>
      )}
    </div>
  );
}




//review and understand the code