"use client";

import { useState, useEffect, useRef } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { supabase } from "@/lib/supabase";

export default function AddFoodPage() {
  const [data, setData] = useState("Not Found");
  const [addItemState, setAddItemState] = useState(false);
  const [productInfo, setProductInfo] = useState({});
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [scannedItems, setScannedItems] = useState([]);
  const [scanning, setScanning] = useState(true);
  const audioRef = useRef(null);
  const lastScannedRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const initializeAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/beep.mp3");
    }
  };

  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing beep sound:", error);
      });
    }
  };

  const addItem = () => {
    initializeAudio();
    setAddItemState(!addItemState);
  };

  const fetchProductDetails = (barcode) => {
    fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1) {
          setProductInfo(data.product);
          setScannedItems((prevItems) => [...prevItems, { barcode, product: data.product }]);
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

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      for (const item of scannedItems) {
        const product = item.product;
        const name = product.product_name || "Unknown";
        const brand = product.brands || "Unknown";
        const ean = item.barcode;

        const { error } = await supabase.from("food_items").insert({
          name,
          quantity: 1,
          purchase_date: new Date().toISOString().split("T")[0],
          exp_date: expiryDate.toISOString().split("T")[0],
          ean,
          brand,
          price: null,
          manual_entry: false,
          userId
        });

        if (error) throw new Error(error.message);
      }

      setScannedItems([]);
      setProductInfo({});
      alert("Items successfully saved to Supabase.");
    } catch (err) {
      console.error("Error submitting items:", err);
      alert("Failed to submit items.");
    }
  };

  const deleteItem = (index) => {
    setScannedItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const handleScan = (barcode) => {
    if (barcode === lastScannedRef.current) return;
    lastScannedRef.current = barcode;
    setScanning(false);
    setData(barcode);
    fetchProductDetails(barcode);
    playBeep();
    setTimeout(() => {
      setScanning(true);
      lastScannedRef.current = null;
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex px-6 flex-col flex-grow">
        <div className="flex bg-white rounded-[5px] h-full p-4">
          <div className="w-1/2 p-2">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Submit
            </button>

            <div className="flex flex-col py-4">
              {Object.keys(productInfo).length > 0 && (
                <div className='mb-2'>
                  <div className="font-bold">Previous Product Details:</div>
                  <p>Name: {productInfo.product_name}</p>
                  <p>Brand: {productInfo.brands}</p>
                </div>
              )}
              <div>
                <div className="font-bold">Scanned Items:</div>
                <ul>
                  {scannedItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {item.barcode} - {item.product?.product_name || "Unknown Product"}
                      </span>
                      <button
                        className="bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-2 rounded"
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
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={addItem}
                >
                  {addItemState ? "Stop Scanning" : "Start Scanning"}
                </button>
              </div>

              {addItemState && (
                <div className="flex pt-4 flex-col">
                  <BarcodeScannerComponent
                    width="100%"
                    onUpdate={(err, result) => {
                      if (result && scanning) {
                        handleScan(result.text);
                      } else {
                        setData("Product Not Found");
                      }
                    }}
                  />
                  <div className="pt-4">
                    <label className="font-bold block mb-2">Expiry Date:</label>
                    <DatePicker
                      selected={expiryDate}
                      onChange={(date) => setExpiryDate(date)}
                      dateFormat="yyyy-MM-dd"
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}