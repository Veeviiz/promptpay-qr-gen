import { useState, useRef } from "react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

import "./App.css";

function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [amountError, setAmountError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSetAmount = (value: number) => {
    setAmount(value.toString());
  };

  const validate = () => {
    let isValid = true;

    setPhoneError("");
    setAmountError("");

    const cleanPhone = phone.replace(/[-\s]/g, "");
    const checkText = /^[0-9]+$/;
    // ตรวจสอบเบอร์โทรหรือเลขบัตรประชาชน
    if (!cleanPhone) {
      setPhoneError("กรุณากรอกเบอร์โทรศัพท์หรือเลขบัตรประชาชน");
      isValid = false;
    } else if (!checkText.test(cleanPhone)) {
      setPhoneError("เบอร์โทรศัพท์หรือเลขบัตรประชาชนไม่ถูกต้อง");
      isValid = false;
    } else if (cleanPhone.length !== 10 && cleanPhone.length !== 13) {
      setPhoneError("เบอร์โทรต้องมี 10 หลัก หรือเลขบัตรประชาชนต้องมี 13 หลัก");
      isValid = false;
    }

    // ตรวจสอบจำนวนเงิน
    if (amount) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setAmountError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
        isValid = false;
      }
    }

    return isValid;
  };

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const payload = generatePayload(phone, {
        amount: amount ? parseFloat(amount) : undefined,
      });

      await QRCode.toCanvas(canvasRef.current, payload, {
        width: 300,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    await generateQRCode();
  };
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* LEFT */}
            <div className="w-full md:w-1/2 p-8">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  สร้าง QR Code พร้อมเพย์
                </h1>
                <p className="text-gray-600">
                  ใส่ข้อมูลเพื่อรับรหัสสแกนจ่ายเงินทันที
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Phone */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                    เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน
                  </label>

                  <input
                    type="text"
                    value={phone}
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="08xxxxxxxx หรือ 110xxxxxxxxxx"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-4 focus:border-blue-500 focus:outline-none"
                  />

                  {phoneError && (
                    <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                    จำนวนเงิน
                  </label>

                  <input
                    type="number"
                    value={amount}
                    placeholder="0.00"
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-4 focus:border-blue-500 focus:outline-none"
                  />

                  {amountError && (
                    <p className="mt-1 text-sm text-red-500">{amountError}</p>
                  )}
                </div>

                {/* Quick Amount */}
                <div className="mb-6 flex gap-3">
                  {[100, 500, 1000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSetAmount(value)}
                      className="rounded-md border border-gray-400 px-3 py-1 hover:bg-green-100"
                    >
                      ฿{value}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-500 py-4 text-white hover:bg-blue-600"
                >
                  สร้าง QR Code
                </button>
              </form>
            </div>

            {/* RIGHT */}
            <div className="w-full md:w-1/2   flex flex-col items-center justify-center p-8">
              <h2 className="mb-6 text-lg font-semibold">QR Code</h2>

              <div className="flex h-[340px] w-[340px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white shadow-sm">
                <canvas ref={canvasRef} />
              </div>

              <p className="mt-5 text-center text-sm text-gray-500">
                สแกนด้วยแอปธนาคารที่รองรับ PromptPay
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
