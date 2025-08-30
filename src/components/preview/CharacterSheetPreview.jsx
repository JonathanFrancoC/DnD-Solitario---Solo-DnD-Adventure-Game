import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Print, X } from 'lucide-react';

const CharacterSheetPreview = ({ characterData, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = 3;
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  const handleDownload = () => {
    // Aquí se implementaría la lógica para descargar el PDF
    console.log('Descargando ficha...');
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Vista Previa de la Ficha de Personaje
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Descargar
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Print size={16} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              Cerrar
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="/Ficha_2019_D&D_5aEd_hoja_Editable.pdf"
              className="w-full h-full border-0"
              title="Ficha de Personaje D&D"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Página Anterior
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPage === i ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Página Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetPreview;
