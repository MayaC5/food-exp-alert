"use client";
import { useState, useEffect, useRef } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdLogOut } from "react-icons/io";

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
  };

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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex justify-between items-center w-full h-[80px] pl-12 pr-12 bg-[#AC1924]">
        <div className="bg-gray-200 h-12 w-12" />
        <div className="flex items-center justify-between bg-[#6895D2] px-4 py-1 w-28 rounded">
          <IoMdLogOut className="text-white text-xl" />
          <div className="text-white font-[550] text-[16px]">Logout</div>
        </div>
      </div>

      <div className="flex px-6 flex-col flex-grow">
        <div className="flex py-4 text-gray-500">
          Home /{" "}
          <span className="font-bold mx-1.5 text-black">
            [New] Barcode Scanner
          </span>
        </div>
        <div className="flex bg-white rounded-[5px] h-full p-4">
          <div className="w-1/2 p-2">
            <button
              onClick={checkoutItem}
              className="bg-[#19ac40] hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Checkout
            </button>
            <div className="flex flex-col py-4">
              <div>
                {Object.keys(productInfo).length > 0 && (
                  <div className='mb-2'>
                    <div className="font-bold">Previous Product Details:</div>
                    {/* <p>{data}</p> */}
                    <p>Name: {productInfo.product_name}</p>
                    <p>Brand: {productInfo.brands}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold">Scanned Items:</div>
                <ul>
                  {scannedItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {item.barcode} -{" "}
                        {item.product?.product_name || "Unknown Product"}
                      </span>

                      <button
                        className="bg-[#AC1924] hover:bg-red-800 text-white font-bold py-1 px-2 rounded"
                        onClick={() => deleteItem(index)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="w-1/2 p-2">
            <div className="flex w-full flex-col">
              <div className="flex justify-end w-full">
                <button
                  className="bg-[#6895D2] hover:bg-blue-200 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={addItem}
                >
                  {addItemState ? "Stop Scanning" : "Start Scanning"}
                </button>
                {/* <button onClick={playBeep}>Play Beep</button> */}
              </div>

              {addItemState && (
                <div className="flex pt-4 flex-col">
                  <BarcodeScannerComponent
                    width="full"
                    // height= {30}
                    onUpdate={(err, result) => {
                      if (result && scanning) {
                        handleScan(result.text);
                      } else {
                        setData("Product Not Found");
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-center py-4">
        Pettle System © 2025 Created by Pettle Co Ltd
      </div>
    </div>
  );
}

//review and understand the code
