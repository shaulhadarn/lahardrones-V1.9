import React from 'react'
import { X, Send, Square, Ruler, MapPin, AlertTriangle, Phone } from 'lucide-react'

interface InfoModalProps {
  info: {
    coordinates: number[][];
    area: string;
    perimeter: string;
    noFlyZones: string[];
  };
  onClose: () => void;
  onSend: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ info, onClose, onSend }) => {
  const handleCallForQuote = () => {
    // This is a placeholder. In a real application, you might want to
    // integrate with a phone system or show contact information.
    alert('מתקשר לחברה לקבלת הצעת מחיר...');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">מידע על הפוליגון</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 space-y-2">
          <p className="flex items-center text-sm sm:text-base">
            <Square size={18} className="ml-2 flex-shrink-0" />
            <strong>שטח:</strong> {info.area} מ"ר
          </p>
          <p className="flex items-center text-sm sm:text-base">
            <Ruler size={18} className="ml-2 flex-shrink-0" />
            <strong>היקף:</strong> {info.perimeter} מ'
          </p>
          <p className="flex items-center text-sm sm:text-base">
            <AlertTriangle size={18} className="ml-2 flex-shrink-0" />
            <strong>איזורי איסור טיסה:</strong> {info.noFlyZones.length > 0 ? info.noFlyZones.join(', ') : 'אין'}
          </p>
          <div>
            <p className="flex items-center mb-1 text-sm sm:text-base">
              <MapPin size={18} className="ml-2 flex-shrink-0" />
              <strong>קואורדינטות:</strong>
            </p>
            <textarea
              className="w-full h-24 sm:h-32 p-2 border rounded text-xs sm:text-sm"
              value={JSON.stringify(info.coordinates, null, 2)}
              readOnly
              dir="ltr"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
          <button
            onClick={onSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
          >
            שלח לחברת הרחפנים
            <Send size={18} className="mr-2" />
          </button>
          {info.noFlyZones.length > 0 && (
            <button
              onClick={handleCallForQuote}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center"
            >
              התקשר להצעת מחיר
              <Phone size={18} className="mr-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoModal